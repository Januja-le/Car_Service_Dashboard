import { Router } from "express";
import { db } from "../db.js";

const router = Router();

function invoiceTotal(inv) {
  const subTotal = inv.items.reduce((s, i) => s + Number(i.amount || 0), 0);
  return subTotal + Math.round((subTotal * (inv.taxPercent || 0)) / 100);
}

router.get("/summary", async (req, res) => {
  await db.read();
  const { jobs, invoices, vehicles, expenses, feedback } = db.data;

  // Revenue by month (YYYY-MM)
  const revenueByMonth = {};
  invoices.forEach((inv) => {
    const month = inv.createdAt.slice(0, 7);
    revenueByMonth[month] = (revenueByMonth[month] || 0) + invoiceTotal(inv);
  });

  // Expenses by month
  const expensesByMonth = {};
  expenses.forEach((e) => {
    const month = e.date.slice(0, 7);
    expensesByMonth[month] = (expensesByMonth[month] || 0) + Number(e.amount || 0);
  });

  const months = Array.from(
    new Set([...Object.keys(revenueByMonth), ...Object.keys(expensesByMonth)])
  ).sort();
  const revenueVsExpenses = months.map((m) => ({
    month: m,
    revenue: revenueByMonth[m] || 0,
    expenses: expensesByMonth[m] || 0,
  }));

  // Most common complaints
  const complaintCounts = {};
  jobs.forEach((j) => {
    const key = (j.complaint || "Unknown").trim();
    complaintCounts[key] = (complaintCounts[key] || 0) + 1;
  });
  const topComplaints = Object.entries(complaintCounts)
    .map(([complaint, count]) => ({ complaint, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Retention: vehicles with more than one job
  const jobCountByVehicle = {};
  jobs.forEach((j) => {
    jobCountByVehicle[j.vehicleId] = (jobCountByVehicle[j.vehicleId] || 0) + 1;
  });
  const totalVehicles = vehicles.length || 1;
  const repeatVehicles = Object.values(jobCountByVehicle).filter((c) => c > 1).length;
  const retentionRate = Math.round((repeatVehicles / totalVehicles) * 100);

  // Average rating
  const avgRating = feedback.length
    ? Number((feedback.reduce((s, f) => s + Number(f.rating), 0) / feedback.length).toFixed(1))
    : null;

  res.json({
    totalRevenue: invoices.reduce((s, i) => s + invoiceTotal(i), 0),
    totalExpenses: expenses.reduce((s, e) => s + Number(e.amount || 0), 0),
    totalCases: jobs.length,
    totalVehicles,
    retentionRate,
    avgRating,
    revenueVsExpenses,
    topComplaints,
  });
});

export default router;
