import { useEffect, useState } from "react";
import api from "../api";
import Topbar from "../components/Topbar";
import StatusBadge from "../components/StatusBadge";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    api.get("/invoices").then(({ data }) => setInvoices(data));
  }, []);

  return (
    <div>
      <Topbar title="Invoices" subtitle="Every proforma and final invoice generated" />
      <div className="p-8">
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-50 text-left text-xs font-semibold uppercase tracking-wide text-brand-800">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Total (₹)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{inv.id}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {inv.vehicle?.make} {inv.vehicle?.model} · {inv.vehicle?.plateNumber}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{inv.owner?.name}</td>
                  <td className="px-4 py-3 text-slate-700">{inv.total?.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <a
                      className="font-medium text-brand-700 hover:underline"
                      href={`/api/invoices/${inv.id}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      PDF
                    </a>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    No invoices yet.
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
