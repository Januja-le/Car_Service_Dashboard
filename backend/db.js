import { Low, JSONFile } from "lowdb";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, "data", "db.json");
const adapter = new JSONFile(file);

const defaultData = {
  owners: [],
  vehicles: [],
  jobs: [],
  invoices: [],
  feedback: [],
  inspections: [],
  expenses: [],
  notifications: [],
};

export const db = new Low(adapter, defaultData);

export async function initDB() {
  await db.read();
  db.data ||= defaultData;

  // Seed once if empty
  if (db.data.owners.length === 0) {
    const ownerId = "own_1";
    const vehicleId = "veh_1";
    const jobId = "job_1";

    db.data.owners.push({
      id: ownerId,
      name: "Prabahar R",
      phone: "9840012345",
      loyaltyPoints: 20,
    });

    db.data.vehicles.push({
      id: vehicleId,
      ownerId,
      make: "Hyundai",
      model: "i20",
      year: 2021,
      plateNumber: "TN 66 AB 1234",
    });

    db.data.jobs.push({
      id: jobId,
      vehicleId,
      complaint: "Engine noise on cold start",
      diagnosis: "Worn drive belt",
      remedy: "Replaced drive belt and tensioner",
      status: "delivered",
      createdAt: "2026-07-10T09:30:00.000Z",
      deliveredAt: "2026-07-11T17:00:00.000Z",
      nextServiceDate: "2027-01-10",
      nextServiceKm: 45000,
    });

    db.data.invoices.push({
      id: "inv_1",
      jobId,
      items: [
        { description: "Drive belt", amount: 1200 },
        { description: "Tensioner pulley", amount: 900 },
        { description: "Labour charge", amount: 600 },
      ],
      taxPercent: 18,
      status: "paid",
      createdAt: "2026-07-11T17:10:00.000Z",
    });

    db.data.feedback.push({
      id: "fb_1",
      jobId,
      rating: 5,
      comment: "Quick and honest service.",
      createdAt: "2026-07-12T10:00:00.000Z",
    });

    db.data.expenses.push(
      { id: "exp_1", category: "Rent", amount: 15000, date: "2026-07-01" },
      { id: "exp_2", category: "Utilities", amount: 3200, date: "2026-07-05" }
    );

    await db.write();
  }
}
