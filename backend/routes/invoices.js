import { Router } from "express";
import { nanoid } from "nanoid";
import PDFDocument from "pdfkit";
import { db } from "../db.js";

const router = Router();

function computeTotals(invoice) {
  const subTotal = invoice.items.reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const tax = Math.round((subTotal * (invoice.taxPercent || 0)) / 100);
  const total = subTotal + tax;
  return { subTotal, tax, total };
}

function enrich(invoice) {
  const job = db.data.jobs.find((j) => j.id === invoice.jobId) || null;
  const vehicle = job ? db.data.vehicles.find((v) => v.id === job.vehicleId) : null;
  const owner = vehicle ? db.data.owners.find((o) => o.id === vehicle.ownerId) : null;
  return { ...invoice, ...computeTotals(invoice), job, vehicle, owner };
}

router.get("/", async (req, res) => {
  await db.read();
  const list = db.data.invoices.map(enrich).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(list);
});

router.get("/:id", async (req, res) => {
  await db.read();
  const invoice = db.data.invoices.find((i) => i.id === req.params.id);
  if (!invoice) return res.status(404).json({ error: "Invoice not found" });
  res.json(enrich(invoice));
});

router.post("/", async (req, res) => {
  await db.read();
  const { jobId, items, taxPercent } = req.body;
  if (!jobId || !Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: "jobId and at least one item are required" });

  const job = db.data.jobs.find((j) => j.id === jobId);
  if (!job) return res.status(404).json({ error: "Case not found" });

  const invoice = {
    id: "inv_" + nanoid(8),
    jobId,
    items,
    taxPercent: taxPercent ?? 18,
    status: "proforma",
    createdAt: new Date().toISOString(),
  };
  db.data.invoices.push(invoice);
  await db.write();
  res.status(201).json(enrich(invoice));
});

router.put("/:id", async (req, res) => {
  await db.read();
  const invoice = db.data.invoices.find((i) => i.id === req.params.id);
  if (!invoice) return res.status(404).json({ error: "Invoice not found" });
  const allowed = ["items", "taxPercent", "status"];
  for (const key of allowed) if (key in req.body) invoice[key] = req.body[key];
  await db.write();
  res.json(enrich(invoice));
});

// GET /api/invoices/:id/pdf -> downloadable proforma invoice, indigo-themed
router.get("/:id/pdf", async (req, res) => {
  await db.read();
  const invoice = db.data.invoices.find((i) => i.id === req.params.id);
  if (!invoice) return res.status(404).json({ error: "Invoice not found" });
  const full = enrich(invoice);

  const INDIGO = "#3730a3";
  const INDIGO_LIGHT = "#e0e7ff";
  const SLATE = "#334155";

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename=invoice-${invoice.id}.pdf`);
  doc.pipe(res);

  // Header band
  doc.rect(0, 0, doc.page.width, 90).fill(INDIGO);
  doc.fillColor("white").fontSize(20).font("Helvetica-Bold").text("AJ MOTORS", 50, 30);
  doc
    .fontSize(9)
    .font("Helvetica")
    .text("Expert mechanical work, custom tinkering & professional painting", 50, 55);
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text(full.status === "proforma" ? "PROFORMA INVOICE" : "INVOICE", 0, 35, {
      align: "right",
      width: doc.page.width - 50,
    });

  doc.fillColor(SLATE);
  let y = 115;
  doc.fontSize(10).font("Helvetica-Bold").text("Invoice To", 50, y);
  doc.font("Helvetica").text(full.owner?.name || "-", 50, y + 14);
  doc.text(full.owner?.phone || "-", 50, y + 28);

  doc.font("Helvetica-Bold").text("Date", 350, y);
  doc.font("Helvetica").text(new Date(full.createdAt).toLocaleDateString("en-IN"), 350, y + 14);
  doc.font("Helvetica-Bold").text("Invoice No.", 350, y + 28);
  doc.font("Helvetica").text(full.id, 350, y + 42);

  y += 70;
  doc.font("Helvetica-Bold").text("Vehicle", 50, y);
  doc
    .font("Helvetica")
    .text(
      `${full.vehicle?.make || ""} ${full.vehicle?.model || ""}  |  Reg No: ${
        full.vehicle?.plateNumber || "-"
      }`,
      50,
      y + 14
    );
  doc.font("Helvetica-Bold").text("Complaint", 50, y + 32);
  doc.font("Helvetica").text(full.job?.complaint || "-", 50, y + 46, { width: 495 });

  y += 90;
  // Table header
  doc.rect(50, y, 495, 22).fill(INDIGO_LIGHT);
  doc.fillColor(INDIGO).font("Helvetica-Bold").fontSize(10);
  doc.text("Description", 60, y + 6);
  doc.text("Amount (₹)", 470, y + 6);
  y += 30;

  doc.fillColor(SLATE).font("Helvetica");
  full.items.forEach((item) => {
    doc.text(item.description, 60, y);
    doc.text(Number(item.amount).toFixed(2), 450, y, { width: 95, align: "right" });
    y += 20;
  });

  y += 10;
  doc.moveTo(50, y).lineTo(545, y).strokeColor("#cbd5e1").stroke();
  y += 10;

  doc.font("Helvetica").text("Sub-Total", 350, y);
  doc.text(full.subTotal.toFixed(2), 450, y, { width: 95, align: "right" });
  y += 18;
  doc.text(`Tax (${full.taxPercent}%)`, 350, y);
  doc.text(full.tax.toFixed(2), 450, y, { width: 95, align: "right" });
  y += 18;
  doc.font("Helvetica-Bold").fontSize(12).fillColor(INDIGO);
  doc.text("Total", 350, y);
  doc.text(`Rs. ${full.total.toFixed(2)}`, 450, y, { width: 95, align: "right" });

  y += 50;
  doc
    .fontSize(9)
    .fillColor("#64748b")
    .font("Helvetica")
    .text("Thank you for servicing your vehicle with AJ Motors.", 50, y);

  doc.end();
});

export default router;
