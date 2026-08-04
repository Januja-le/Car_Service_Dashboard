import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import NewCase from "./pages/NewCase";
import CaseDetail from "./pages/CaseDetail";
import Invoices from "./pages/Invoices";
import ServiceHistory from "./pages/ServiceHistory";
import Analytics from "./pages/Analytics";

export default function App() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new-case" element={<NewCase />} />
          <Route path="/cases/:id" element={<CaseDetail />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/service-history" element={<ServiceHistory />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </main>
    </div>
  );
}
