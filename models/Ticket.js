// models/Ticket.js
const mongoose = require("mongoose");

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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
