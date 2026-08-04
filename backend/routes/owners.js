import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  await db.read();
  res.json(db.data.owners);
});

router.get("/:id", async (req, res) => {
  await db.read();
  const owner = db.data.owners.find((o) => o.id === req.params.id);
  if (!owner) return res.status(404).json({ error: "Owner not found" });
  res.json(owner);
});

router.post("/", async (req, res) => {
  await db.read();
  const { name, phone } = req.body;
  if (!name || !phone) return res.status(400).json({ error: "name and phone are required" });
  const owner = { id: "own_" + nanoid(8), name, phone, loyaltyPoints: 0 };
  db.data.owners.push(owner);
  await db.write();
  res.status(201).json(owner);
});

router.put("/:id", async (req, res) => {
  await db.read();
  const owner = db.data.owners.find((o) => o.id === req.params.id);
  if (!owner) return res.status(404).json({ error: "Owner not found" });
  Object.assign(owner, req.body);
  await db.write();
  res.json(owner);
});

router.delete("/:id", async (req, res) => {
  await db.read();
  db.data.owners = db.data.owners.filter((o) => o.id !== req.params.id);
  await db.write();
  res.status(204).end();
});

export default router;
