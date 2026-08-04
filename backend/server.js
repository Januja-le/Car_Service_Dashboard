import express from "express";
import cors from "cors";
import morgan from "morgan";
import { initDB } from "./db.js";

import ownersRouter from "./routes/owners.js";
import vehiclesRouter from "./routes/vehicles.js";
import jobsRouter from "./routes/jobs.js";
import invoicesRouter from "./routes/invoices.js";
import feedbackRouter from "./routes/feedback.js";
import inspectionsRouter from "./routes/inspections.js";
import analyticsRouter from "./routes/analytics.js";
import remindersRouter from "./routes/reminders.js";
import expensesRouter from "./routes/expenses.js";
import notificationsRouter from "./routes/notifications.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

await initDB();

app.use("/api/owners", ownersRouter);
app.use("/api/vehicles", vehiclesRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/invoices", invoicesRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/inspections", inspectionsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/reminders", remindersRouter);
app.use("/api/expenses", expensesRouter);
app.use("/api/notifications", notificationsRouter);

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`AJ Motors backend running on http://localhost:${PORT}`);
});
