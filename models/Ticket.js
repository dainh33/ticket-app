// models/Ticket.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true, maxlength: 60 },
    message: { type: String, trim: true, required: true, maxlength: 2000 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    _id: true,
  }
);

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{4}$/, "Ticket number must be a 4 digit integer"],
    },
    status: {
      type: String,
      enum: {
        values: ["Open", "In Progress", "Closed", "Review"],
        message: "Status must be one of: Open, In Progress, Closed, Review",
      },
      default: "Open",
      required: true,
    },
    assignee: {
      //make this require to be a user who is in the database
      type: String,
      default: "Unclaimed",
    },
    requester: {
      //make this require to be a user who is in the database
      type: String,
      required: true,
    },
    dueDate: { type: Date, default: null },
    category: {
      type: String,
      trim: true,
      enum: {
        values: ["Billing", "Technical", "Admin", "Bug", "Security"],
        message:
          "Ticket Category must be one of these: Billing, Technical, Admin, Bug, Security",
      },
      required: true,
    },
    title: {
      type: String,
      trim: true,
      required: true,
      maxlength: 60,
    },
    subjectLine: {
      type: String,
      trim: true,
      required: true,
      maxlength: 60,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    priority: {
      type: String,
      trim: true,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
