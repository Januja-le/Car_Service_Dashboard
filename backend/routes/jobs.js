import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

const router = Router();

function enrich(job) {
  const vehicle = db.data.vehicles.find((v) => v.id === job.vehicleId) || null;
  const owner = vehicle ? db.data.owners.find((o) => o.id === vehicle.ownerId) : null;
  return { ...job, vehicle, owner };
}

// GET /api/jobs?status=&search=  -> dashboard feed
router.get("/", async (req, res) => {
  await db.read();
  const { status, search } = req.query;
  let list = db.data.jobs.map(enrich);

  if (status) list = list.filter((j) => j.status === status);

  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      (j) =>
        j.vehicle?.plateNumber?.toLowerCase().includes(q) ||
        j.owner?.name?.toLowerCase().includes(q) ||
        j.complaint?.toLowerCase().includes(q)
    );
  }

  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(list);
});

router.get("/:id", async (req, res) => {
  await db.read();
  const job = db.data.jobs.find((j) => j.id === req.params.id);
  if (!job) return res.status(404).json({ error: "Case not found" });
  res.json(enrich(job));
});

// Create a case. Accepts either an existing vehicleId, or inline owner+vehicle details
// so front-desk staff can register a new car and case in one step.
router.post("/", async (req, res) => {
  await db.read();
  let { vehicleId, ownerName, ownerPhone, make, model, year, plateNumber, complaint } = req.body;

  if (!vehicleId) {
    if (!ownerName || !ownerPhone || !make || !model || !plateNumber) {
      return res.status(400).json({
        error:
          "Provide vehicleId, or ownerName+ownerPhone+make+model+plateNumber to register a new vehicle",
      });
    }
    let owner = db.data.owners.find(
      (o) => o.phone === ownerPhone && o.name.toLowerCase() === ownerName.toLowerCase()
    );
    if (!owner) {
      owner = { id: "own_" + nanoid(8), name: ownerName, phone: ownerPhone, loyaltyPoints: 0 };
      db.data.owners.push(owner);
    }
    const vehicle = {
      id: "veh_" + nanoid(8),
      ownerId: owner.id,
      make,
      model,
      year: year || null,
      plateNumber,
    };
    db.data.vehicles.push(vehicle);
    vehicleId = vehicle.id;
  }

  if (!complaint) return res.status(400).json({ error: "complaint is required" });

  const job = {
    id: "job_" + nanoid(8),
    vehicleId,
    complaint,
    diagnosis: "",
    remedy: "",
    status: "received",
    createdAt: new Date().toISOString(),
    deliveredAt: null,
    nextServiceDate: null,
    nextServiceKm: null,
  };
  db.data.jobs.push(job);
  await db.write();
  res.status(201).json(enrich(job));
});

router.put("/:id", async (req, res) => {
  await db.read();
  const job = db.data.jobs.find((j) => j.id === req.params.id);
  if (!job) return res.status(404).json({ error: "Case not found" });

  const allowed = [
    "complaint",
    "diagnosis",
    "remedy",
    "status",
    "nextServiceDate",
    "nextServiceKm",
  ];
  for (const key of allowed) {
    if (key in req.body) job[key] = req.body[key];
  }
  if (job.status === "delivered" && !job.deliveredAt) {
    job.deliveredAt = new Date().toISOString();
  }
  await db.write();
  res.json(enrich(job));
});

router.delete("/:id", async (req, res) => {
  await db.read();
  db.data.jobs = db.data.jobs.filter((j) => j.id !== req.params.id);
  await db.write();
  res.status(204).end();
});

export default router;
