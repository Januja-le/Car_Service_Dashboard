import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Topbar from "../components/Topbar";

export default function ServiceHistory() {
  const [reminders, setReminders] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [plateSearch, setPlateSearch] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    api.get("/reminders", { params: { withinDays: 60 } }).then(({ data }) => setReminders(data));
  }, []);

  async function searchVehicles(q) {
    setPlateSearch(q);
    if (!q) return setVehicles([]);
    const { data } = await api.get("/vehicles", { params: { plateNumber: q } });
    setVehicles(data);
  }

  async function openVehicle(id) {
    const { data } = await api.get(`/vehicles/${id}`);
    setSelectedVehicle(data);
  }

  return (
    <div>
      <Topbar title="Service History" subtitle="Upcoming service reminders and full vehicle history" />
      <div className="grid grid-cols-2 gap-6 p-8">
        <div className="card p-5">
          <h3 className="mb-3 text-sm font-semibold text-brand-800">Upcoming service (next 60 days)</h3>
          <div className="space-y-2">
            {reminders.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <div>
                  <span className="font-medium text-slate-700">
                    {r.vehicle?.make} {r.vehicle?.model} · {r.vehicle?.plateNumber}
                  </span>
                  <div className="text-xs text-slate-500">
                    Due {new Date(r.nextServiceDate).toLocaleDateString()}
                    {r.nextServiceKm ? ` · ${r.nextServiceKm} km` : ""}
                  </div>
                </div>
                <Link to={`/cases/${r.id}`} className="text-xs font-medium text-brand-700 hover:underline">
                  Open case
                </Link>
              </div>
            ))}
            {reminders.length === 0 && <p className="text-sm text-slate-400">No reminders due soon.</p>}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-3 text-sm font-semibold text-brand-800">Look up vehicle by plate number</h3>
          <input
            className="input mb-3"
            placeholder="e.g. TN 66 AB 1234"
            value={plateSearch}
            onChange={(e) => searchVehicles(e.target.value)}
          />
          <div className="space-y-1">
            {vehicles.map((v) => (
              <button
                key={v.id}
                onClick={() => openVehicle(v.id)}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-brand-50"
              >
                {v.make} {v.model} · {v.plateNumber} — {v.owner?.name}
              </button>
            ))}
          </div>

          {selectedVehicle && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="mb-2 text-sm font-medium text-slate-700">
                History for {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.plateNumber})
              </p>
              <div className="space-y-2">
                {selectedVehicle.jobs.map((j) => (
                  <div key={j.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <div className="font-medium text-slate-700">{j.complaint}</div>
                    <div className="text-slate-500">{j.remedy || "In progress"}</div>
                    <div className="text-xs text-slate-400">{new Date(j.createdAt).toLocaleDateString()}</div>
                  </div>
                ))}
                {selectedVehicle.jobs.length === 0 && (
                  <p className="text-sm text-slate-400">No service history for this vehicle yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
