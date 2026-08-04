# AJ Motors — Car Service Shop Platform

A full-stack app for a car service shop: create per-case invoices, and run a
dashboard that tracks every vehicle that comes in — its make/model, plate
number, owner, complaint and remedy.

**Included:** invoicing (PDF), dashboard, service history & reminders,
customer experience (digital inspection reports, WhatsApp/SMS-style status
updates, feedback & loyalty points), and business analytics.
**Not included (by request):** staff/technician workflow, inventory & parts
tracking — add these later as `routes/staff.js` and `routes/inventory.js`
following the same pattern as the other route files.

## Stack

- **Backend:** Node.js + Express, JSON-file database via `lowdb` (no DB
  server to install), PDF invoices via `pdfkit`.
- **Frontend:** React + Vite + Tailwind CSS, indigo blue theme throughout,
  charts via `recharts`.

## Run it in VS Code

1. Open the `car-service-platform` folder in VS Code (`File → Open Folder`).
2. Open **two terminals** (Terminal → New Terminal, then split it — the ⊞ icon).

**Terminal 1 — backend:**
```bash
cd backend
npm install
npm run dev
```
Runs on `http://localhost:4000`. Seeds one example case (AJ Motors / Prabahar R)
on first run — this matches the sample invoice you started from. Data is
stored in `backend/data/db.json`; delete that file to reset.

**Terminal 2 — frontend:**
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173` and proxies `/api` calls to the backend
(see `vite.config.js`) — so open **http://localhost:5173** in your browser,
not the backend port.

Both need to be running at the same time for the app to work.

## Project layout

```
backend/
  server.js          entry point, mounts all routes
  db.js               lowdb setup + seed data
  routes/
    owners.js         customer records + loyalty points
    vehicles.js        vehicle records + lookup by plate
    jobs.js             the central case: complaint → diagnosis → remedy → status
    invoices.js          invoice CRUD + GET /:id/pdf (indigo-themed PDF)
    inspections.js        digital inspection reports (notes + photo URLs)
    notifications.js       simulated WhatsApp/SMS status-update log
    feedback.js              customer ratings, awards loyalty points
    reminders.js              upcoming service reminders
    analytics.js               revenue, expenses, top complaints, retention
    expenses.js                 manual expense entries for analytics
  data/db.json          the "database" (plain JSON, human-readable)

frontend/
  src/
    api.js               axios client
    App.jsx               routes + layout
    components/            Sidebar, Topbar, StatusBadge
    pages/
      Dashboard.jsx          case list, search & filter
      NewCase.jsx              register vehicle + complaint
      CaseDetail.jsx            diagnosis/remedy, inspection, invoice, notify, feedback
      Invoices.jsx               all invoices, PDF links
      ServiceHistory.jsx          reminders + per-vehicle history lookup
      Analytics.jsx                 charts
```

## Notes on what's simulated vs. real

- **WhatsApp/SMS updates** are logged in the database, not actually sent.
  Swap in Twilio or the WhatsApp Cloud API inside `routes/notifications.js`
  when you're ready to go live.
- **Inspection photos** are stored as plain URLs (comma-separated in the UI)
  rather than uploaded binary files, to keep the backend dependency-free.
  If you want real uploads later, add `multer` and a `/uploads` static route.
- **Data storage** is a single JSON file (`lowdb`), which is fine for one
  shop's daily volume and is trivial to inspect/back up. Swap for
  PostgreSQL/MongoDB later without changing the route logic much — the
  route files already isolate all data access.

## Extending

- **Job workflow & staff** (left out on purpose): add a `technicianId` field
  to jobs, a `staff.js` route for logins, and a checklist array on the job.
- **Inventory & parts** (left out on purpose): add a `parts.js` route with
  stock counts, and deduct stock when an invoice line item references a part.
