
//usage:  node .\scripts\seedTickets.js --reset



/ scripts/seedTickets.js
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Ticket = require("../models/Ticket");

//load .env the same way your app does
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from .env");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const reset = process.argv.includes("--reset");
  if (reset) {
    await Ticket.deleteMany({});
    console.log("Cleared tickets collection.");
  }

  const categories = ["Billing", "Technical", "Admin", "Bug", "Security"];
  const statuses = ["Open", "In Progress", "Closed", "Review"];
  const priorities = ["Low", "Medium", "High", "Critical"];

  const now = new Date();
  const requesters = [
    "Jane Doe",
    "John Smith",
    "Alex Kim",
    "Sam Patel",
    "Riley Chen",
  ];
  const assignees = ["Unclaimed", "A. Agent", "B. Agent", "C. Agent"];

  const tickets = Array.from({ length: 10 }, (_, i) => {
    const ticketNumber = String(1000 + i); // 4 digits

    return {
      ticketNumber,
      status: statuses[i % statuses.length],
      priority: priorities[i % priorities.length],
      requester: requesters[i % requesters.length],
      assignee: assignees[i % assignees.length],
      dueDate: new Date(now.getTime() + (i + 3) * 24 * 60 * 60 * 1000),
      category: categories[i % categories.length],
      subjectLine: `Example ticket #${ticketNumber}`,
      description: `Seeded example ticket ${ticketNumber} for testing pagination and display.`,
    };
  });

  try {
    const inserted = await Ticket.insertMany(tickets, { ordered: false });
    console.log(`Inserted ${inserted.length} tickets.`);
  } catch (err) {
    console.error("Insert finished with errors (likely duplicates):");
    console.error(err.message);
  }

  const total = await Ticket.countDocuments();
  console.log(`Tickets in DB now: ${total}`);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
