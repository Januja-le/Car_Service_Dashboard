const STYLES = {
  received: "bg-slate-100 text-slate-700",
  "in-progress": "bg-amber-100 text-amber-800",
  ready: "bg-brand-100 text-brand-800",
  delivered: "bg-emerald-100 text-emerald-700",
  proforma: "bg-slate-100 text-slate-700",
  final: "bg-brand-100 text-brand-800",
  paid: "bg-emerald-100 text-emerald-700",
};

const LABELS = {
  "in-progress": "In Progress",
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || "bg-slate-100 text-slate-700";
  const label = LABELS[status] || (status ? status[0].toUpperCase() + status.slice(1) : "-");
  return <span className={`badge ${style}`}>{label}</span>;
}
