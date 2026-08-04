import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Topbar from "../components/Topbar";
import StatusBadge from "../components/StatusBadge";

const STATUS_OPTIONS = ["", "received", "in-progress", "ready", "delivered"];

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await api.get("/jobs", { params: { status: status || undefined, search: search || undefined } });
    setJobs(data);
    setLoading(false);
  }

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search]);

  return (
    <div>
      <Topbar
        title="Dashboard"
        subtitle="Every vehicle that has come in, its owner, complaint and remedy"
        action={
          <Link to="/new-case" className="btn-primary">
            + New Case
          </Link>
        }
      />
      <div className="p-8">
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            className="input max-w-xs"
            placeholder="Search plate, owner or complaint..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="input max-w-[180px]" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s ? s[0].toUpperCase() + s.slice(1) : "All statuses"}
              </option>
            ))}
          </select>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-50 text-left text-xs font-semibold uppercase tracking-wide text-brand-800">
              <tr>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Plate No.</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Complaint</th>
                <th className="px-4 py-3">Remedy</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((j) => (
                <tr key={j.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {j.vehicle?.make} {j.vehicle?.model}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{j.vehicle?.plateNumber}</td>
                  <td className="px-4 py-3 text-slate-600">{j.owner?.name}</td>
                  <td className="px-4 py-3 text-slate-600">{j.complaint}</td>
                  <td className="px-4 py-3 text-slate-500">{j.remedy || "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={j.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/cases/${j.id}`} className="text-sm font-medium text-brand-700 hover:underline">
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
              {!loading && jobs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    No cases found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
