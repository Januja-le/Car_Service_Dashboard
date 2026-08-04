import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  await db.read();
  const { jobId } = req.query;
  let list = db.data.inspections;
  if (jobId) list = list.filter((i) => i.jobId === jobId);
  res.json(list);
});

// Photos are passed as an array of image URLs (e.g. uploaded to any image host)
// to keep this demo backend free of binary file storage concerns.
router.post("/", async (req, res) => {
  await db.read();
  const { jobId, notes, photos } = req.body;
  if (!jobId) return res.status(400).json({ error: "jobId is required" });
  const job = db.data.jobs.find((j) => j.id === jobId);
  if (!job) return res.status(404).json({ error: "Case not found" });

  const report = {
    id: "insp_" + nanoid(8),
    jobId,
    notes: notes || "",
    photos: Array.isArray(photos) ? photos : [],
    createdAt: new Date().toISOString(),
  };
  db.data.inspections.push(report);
  await db.write();
  res.status(201).json(report);
});

export default router;
