import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  await db.read();
  const { jobId } = req.query;
  let list = db.data.feedback;
  if (jobId) list = list.filter((f) => f.jobId === jobId);
  res.json(list);
});

router.post("/", async (req, res) => {
  await db.read();
  const { jobId, rating, comment } = req.body;
  if (!jobId || !rating) return res.status(400).json({ error: "jobId and rating are required" });

  const job = db.data.jobs.find((j) => j.id === jobId);
  if (!job) return res.status(404).json({ error: "Case not found" });

  const entry = { id: "fb_" + nanoid(8), jobId, rating, comment: comment || "", createdAt: new Date().toISOString() };
  db.data.feedback.push(entry);

  // reward loyalty points on the owner tied to this job's vehicle
  const vehicle = db.data.vehicles.find((v) => v.id === job.vehicleId);
  const owner = vehicle ? db.data.owners.find((o) => o.id === vehicle.ownerId) : null;
  if (owner) owner.loyaltyPoints = (owner.loyaltyPoints || 0) + 5;

  await db.write();
  res.status(201).json(entry);
});

export default router;
