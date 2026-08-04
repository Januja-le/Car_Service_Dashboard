import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

const router = Router();

// This backend simulates sending the update (logs it) rather than calling a
// real SMS/WhatsApp provider. Swap in Twilio/WhatsApp Cloud API here later.
router.get("/", async (req, res) => {
  await db.read();
  const { jobId } = req.query;
  let list = db.data.notifications;
  if (jobId) list = list.filter((n) => n.jobId === jobId);
  list.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
  res.json(list);
});

router.post("/", async (req, res) => {
  await db.read();
  const { jobId, message, channel } = req.body;
  if (!jobId || !message) return res.status(400).json({ error: "jobId and message are required" });
  const job = db.data.jobs.find((j) => j.id === jobId);
  if (!job) return res.status(404).json({ error: "Case not found" });

  const entry = {
    id: "note_" + nanoid(8),
    jobId,
    channel: channel || "whatsapp",
    message,
    sentAt: new Date().toISOString(),
  };
  db.data.notifications.push(entry);
  await db.write();
  res.status(201).json(entry);
});

export default router;
