import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import Topbar from "../components/Topbar";
import StatusBadge from "../components/StatusBadge";

const STATUSES = ["received", "in-progress", "ready", "delivered"];

export default function CaseDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [editForm, setEditForm] = useState({ diagnosis: "", remedy: "", nextServiceDate: "", nextServiceKm: "" });
  const [invoiceItems, setInvoiceItems] = useState([{ description: "", amount: "" }]);
  const [inspectionNotes, setInspectionNotes] = useState("");
  const [inspectionPhotos, setInspectionPhotos] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

  async function loadAll() {
    const [{ data: j }, { data: inv }, { data: insp }, { data: notif }, { data: fb }] = await Promise.all([
      api.get(`/jobs/${id}`),
      api.get("/invoices"),
      api.get("/inspections", { params: { jobId: id } }),
      api.get("/notifications", { params: { jobId: id } }),
      api.get("/feedback", { params: { jobId: id } }),
    ]);
    setJob(j);
    setInvoices(inv.filter((i) => i.jobId === id));
    setInspections(insp);
    setNotifications(notif);
    setFeedback(fb);
    setEditForm({
      diagnosis: j.diagnosis || "",
      remedy: j.remedy || "",
      nextServiceDate: j.nextServiceDate || "",
      nextServiceKm: j.nextServiceKm || "",
    });
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function saveCaseDetails() {
    setSavingStatus(true);
    await api.put(`/jobs/${id}`, editForm);
    await loadAll();
    setSavingStatus(false);
  }

  async function changeStatus(status) {
    await api.put(`/jobs/${id}`, { status });
    await loadAll();
  }

  async function createInvoice() {
    const items = invoiceItems.filter((i) => i.description && i.amount).map((i) => ({ description: i.description, amount: Number(i.amount) }));
    if (items.length === 0) return;
    await api.post("/invoices", { jobId: id, items, taxPercent: 18 });
    setInvoiceItems([{ description: "", amount: "" }]);
    await loadAll();
  }

  async function submitInspection() {
    if (!inspectionNotes && !inspectionPhotos) return;
    const photos = inspectionPhotos.split(",").map((p) => p.trim()).filter(Boolean);
    await api.post("/inspections", { jobId: id, notes: inspectionNotes, photos });
    setInspectionNotes("");
    setInspectionPhotos("");
    await loadAll();
  }

  async function sendNotification() {
    if (!notifyMessage) return;
    await api.post("/notifications", { jobId: id, message: notifyMessage, channel: "whatsapp" });
    setNotifyMessage("");
    await loadAll();
  }

  if (!job) return <div className="p-8 text-slate-400">Loading...</div>;

  return (
    <div>
      <Topbar
        title={`${job.vehicle?.make} ${job.vehicle?.model} · ${job.vehicle?.plateNumber}`}
        subtitle={`Owner: ${job.owner?.name} (${job.owner?.phone}) · Loyalty points: ${job.owner?.loyaltyPoints ?? 0}`}
        action={<StatusBadge status={job.status} />}
      />

      <div className="grid grid-cols-3 gap-6 p-8">
        {/* LEFT COLUMN */}
        <div className="col-span-2 space-y-6">
          {/* Status pipeline */}
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-brand-800">Case status</h3>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => changeStatus(s)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    job.status === s ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-brand-50"
                  }`}
                >
                  {s === "in-progress" ? "In Progress" : s[0].toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Complaint / diagnosis / remedy */}
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-brand-800">Complaint, diagnosis & remedy</h3>
            <div>
              <label className="label">Complaint (reported by customer)</label>
              <p className="mb-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{job.complaint}</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="label">Diagnosis</label>
                <textarea
                  className="input"
                  rows={2}
                  value={editForm.diagnosis}
                  onChange={(e) => setEditForm((f) => ({ ...f, diagnosis: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Remedy / work done</label>
                <textarea
                  className="input"
                  rows={2}
                  value={editForm.remedy}
                  onChange={(e) => setEditForm((f) => ({ ...f, remedy: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Next service date</label>
                  <input
                    type="date"
                    className="input"
                    value={editForm.nextServiceDate || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, nextServiceDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Next service (km)</label>
                  <input
                    type="number"
                    className="input"
                    value={editForm.nextServiceKm || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, nextServiceKm: e.target.value }))}
                  />
                </div>
              </div>
              <button onClick={saveCaseDetails} disabled={savingStatus} className="btn-primary w-fit">
                {savingStatus ? "Saving..." : "Save details"}
              </button>
            </div>
          </div>

          {/* Digital inspection report */}
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-brand-800">Digital inspection report</h3>
            <div className="space-y-3">
              <textarea
                className="input"
                rows={2}
                placeholder="Inspection notes..."
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
              />
              <input
                className="input"
                placeholder="Photo URLs, comma separated (optional)"
                value={inspectionPhotos}
                onChange={(e) => setInspectionPhotos(e.target.value)}
              />
              <button onClick={submitInspection} className="btn-secondary">
                Add inspection report
              </button>
            </div>
            {inspections.length > 0 && (
              <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                {inspections.map((r) => (
                  <div key={r.id} className="text-sm">
                    <p className="text-slate-700">{r.notes}</p>
                    {r.photos?.length > 0 && (
                      <p className="mt-1 text-xs text-slate-400">{r.photos.length} photo(s) attached</p>
                    )}
                    <p className="mt-1 text-xs text-slate-400">{new Date(r.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invoicing */}
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-brand-800">Invoice</h3>
            <div className="space-y-2">
              {invoiceItems.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    className="input"
                    placeholder="Description (e.g. Brake pads)"
                    value={item.description}
                    onChange={(e) => {
                      const next = [...invoiceItems];
                      next[idx].description = e.target.value;
                      setInvoiceItems(next);
                    }}
                  />
                  <input
                    className="input max-w-[140px]"
                    type="number"
                    placeholder="Amount ₹"
                    value={item.amount}
                    onChange={(e) => {
                      const next = [...invoiceItems];
                      next[idx].amount = e.target.value;
                      setInvoiceItems(next);
                    }}
                  />
                </div>
              ))}
              <button
                className="text-sm font-medium text-brand-700 hover:underline"
                onClick={() => setInvoiceItems([...invoiceItems, { description: "", amount: "" }])}
              >
                + Add line item
              </button>
              <div>
                <button onClick={createInvoice} className="btn-primary">
                  Generate proforma invoice
                </button>
              </div>
            </div>

            {invoices.length > 0 && (
              <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                {invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <div>
                      <span className="font-medium text-slate-700">{inv.id}</span>{" "}
                      <StatusBadge status={inv.status} />
                    </div>
                    <a
                      className="font-medium text-brand-700 hover:underline"
                      href={`/api/invoices/${inv.id}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View / Download PDF
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Status updates */}
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-brand-800">Send status update</h3>
            <textarea
              className="input"
              rows={2}
              placeholder='e.g. "Your car is ready for pickup"'
              value={notifyMessage}
              onChange={(e) => setNotifyMessage(e.target.value)}
            />
            <button onClick={sendNotification} className="btn-secondary mt-2">
              Send via WhatsApp/SMS
            </button>
            <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
              {notifications.map((n) => (
                <div key={n.id} className="text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{n.channel}:</span> {n.message}
                  <div className="text-slate-400">{new Date(n.sentAt).toLocaleString()}</div>
                </div>
              ))}
              {notifications.length === 0 && <p className="text-xs text-slate-400">No updates sent yet.</p>}
            </div>
          </div>

          {/* Feedback */}
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-brand-800">Customer feedback</h3>
            {feedback.length === 0 && <p className="text-sm text-slate-400">No feedback submitted yet.</p>}
            {feedback.map((f) => (
              <div key={f.id} className="mb-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="font-medium text-amber-600">{"★".repeat(f.rating)}</span>
                <p className="text-slate-600">{f.comment}</p>
              </div>
            ))}
          </div>

          <Link to="/" className="block text-sm font-medium text-brand-700 hover:underline">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
