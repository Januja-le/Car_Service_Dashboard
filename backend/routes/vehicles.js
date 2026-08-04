import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  await db.read();
  const { ownerId, plateNumber } = req.query;
  let list = db.data.vehicles;
  if (ownerId) list = list.filter((v) => v.ownerId === ownerId);
  if (plateNumber)
    list = list.filter((v) =>
      v.plateNumber.toLowerCase().includes(String(plateNumber).toLowerCase())
    );
  // attach owner
  list = list.map((v) => ({
    ...v,
    owner: db.data.owners.find((o) => o.id === v.ownerId) || null,
  }));
  res.json(list);
});

router.get("/:id", async (req, res) => {
  await db.read();
  const vehicle = db.data.vehicles.find((v) => v.id === req.params.id);
  if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
  const owner = db.data.owners.find((o) => o.id === vehicle.ownerId) || null;
  const jobs = db.data.jobs
    .filter((j) => j.vehicleId === vehicle.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ ...vehicle, owner, jobs });
});

router.post("/", async (req, res) => {
  await db.read();
  const { ownerId, make, model, year, plateNumber } = req.body;
  if (!ownerId || !make || !model || !plateNumber)
    return res.status(400).json({ error: "ownerId, make, model, plateNumber are required" });
  const vehicle = { id: "veh_" + nanoid(8), ownerId, make, model, year: year || null, plateNumber };
  db.data.vehicles.push(vehicle);
  await db.write();
  res.status(201).json(vehicle);
});

router.put("/:id", async (req, res) => {
  await db.read();
  const vehicle = db.data.vehicles.find((v) => v.id === req.params.id);
  if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
  Object.assign(vehicle, req.body);
  await db.write();
  res.json(vehicle);
});

router.delete("/:id", async (req, res) => {
  await db.read();
  db.data.vehicles = db.data.vehicles.filter((v) => v.id !== req.params.id);
  await db.write();
  res.status(204).end();
});

export default router;
