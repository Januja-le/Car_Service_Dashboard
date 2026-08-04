import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  await db.read();
  res.json(db.data.expenses.sort((a, b) => new Date(b.date) - new Date(a.date)));
});

router.post("/", async (req, res) => {
  await db.read();
  const { category, amount, date } = req.body;
  if (!category || !amount || !date)
    return res.status(400).json({ error: "category, amount and date are required" });
  const expense = { id: "exp_" + nanoid(8), category, amount, date };
  db.data.expenses.push(expense);
  await db.write();
  res.status(201).json(expense);
});

export default router;
