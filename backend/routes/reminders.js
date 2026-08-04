import { Router } from "express";
import { db } from "../db.js";

const router = Router();

// GET /api/reminders?withinDays=30 -> jobs whose nextServiceDate falls within window
router.get("/", async (req, res) => {
  await db.read();
  const withinDays = Number(req.query.withinDays || 30);
  const now = new Date();
  const cutoff = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000);

  const upcoming = db.data.jobs
    .filter((j) => j.nextServiceDate)
    .filter((j) => {
      const d = new Date(j.nextServiceDate);
      return d >= now && d <= cutoff;
    })
    .map((j) => {
      const vehicle = db.data.vehicles.find((v) => v.id === j.vehicleId);
      const owner = vehicle ? db.data.owners.find((o) => o.id === vehicle.ownerId) : null;
      return { ...j, vehicle, owner };
    })
    .sort((a, b) => new Date(a.nextServiceDate) - new Date(b.nextServiceDate));

  res.json(upcoming);
});

export default router;
