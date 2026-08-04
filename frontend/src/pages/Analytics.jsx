import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import api from "../api";
import Topbar from "../components/Topbar";

function StatCard({ label, value }) {
  return (
    <div className="card p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 font-display text-2xl font-semibold text-brand-800">{value}</div>
    </div>
  );
}

export default function Analytics() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get("/analytics/summary").then(({ data }) => setSummary(data));
  }, []);

  if (!summary) return <div className="p-8 text-slate-400">Loading...</div>;

  return (
    <div>
      <Topbar title="Analytics" subtitle="Business performance at a glance" />
      <div className="space-y-6 p-8">
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Total Revenue" value={`₹${summary.totalRevenue.toLocaleString("en-IN")}`} />
          <StatCard label="Total Cases" value={summary.totalCases} />
          <StatCard label="Retention Rate" value={`${summary.retentionRate}%`} />
          <StatCard label="Avg. Rating" value={summary.avgRating ? `${summary.avgRating} ★` : "—"} />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="mb-4 text-sm font-semibold text-brand-800">Revenue vs. Expenses</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={summary.revenueVsExpenses}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#4338ca" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5">
            <h3 className="mb-4 text-sm font-semibold text-brand-800">Most Common Complaints</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={summary.topComplaints} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                <YAxis dataKey="complaint" type="category" width={140} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
