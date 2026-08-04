import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Topbar from "../components/Topbar";

export default function NewCase() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    ownerName: "",
    ownerPhone: "",
    make: "",
    model: "",
    year: "",
    plateNumber: "",
    complaint: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const { data } = await api.post("/jobs", form);
      navigate(`/cases/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Topbar title="New Case" subtitle="Register the vehicle, owner and complaint" />
      <div className="p-8">
        <form onSubmit={submit} className="card max-w-2xl space-y-5 p-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-brand-800">Owner</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Owner name</label>
                <input
                  className="input"
                  required
                  value={form.ownerName}
                  onChange={(e) => update("ownerName", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  className="input"
                  required
                  value={form.ownerPhone}
                  onChange={(e) => update("ownerPhone", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-brand-800">Vehicle</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Make</label>
                <input className="input" required value={form.make} onChange={(e) => update("make", e.target.value)} />
              </div>
              <div>
                <label className="label">Model</label>
                <input className="input" required value={form.model} onChange={(e) => update("model", e.target.value)} />
              </div>
              <div>
                <label className="label">Year</label>
                <input className="input" value={form.year} onChange={(e) => update("year", e.target.value)} />
              </div>
              <div>
                <label className="label">Registration plate no.</label>
                <input
                  className="input"
                  required
                  value={form.plateNumber}
                  onChange={(e) => update("plateNumber", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-brand-800">Complaint</h3>
            <textarea
              className="input"
              rows={3}
              required
              value={form.complaint}
              onChange={(e) => update("complaint", e.target.value)}
              placeholder="What did the customer report?"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving..." : "Create case"}
          </button>
        </form>
      </div>
    </div>
  );
}
