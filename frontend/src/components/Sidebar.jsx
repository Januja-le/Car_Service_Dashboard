import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/new-case", label: "New Case" },
  { to: "/invoices", label: "Invoices" },
  { to: "/service-history", label: "Service History" },
  { to: "/analytics", label: "Analytics" },
];

export default function Sidebar() {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-brand-950 text-brand-100">
      <div className="px-5 py-6">
        <div className="font-display text-lg font-semibold tracking-wide text-white">
          AJ MOTORS
        </div>
        <div className="mt-0.5 text-xs text-brand-300">Service Console</div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-brand-800 text-white"
                  : "text-brand-200 hover:bg-brand-900 hover:text-white"
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 text-xs text-brand-400">
        Multi-branded car mechanical, tinkering &amp; paint services
      </div>
    </aside>
  );
}
