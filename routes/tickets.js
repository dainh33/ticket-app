const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");
const mongoose = require("mongoose");

//POST /tickets/create
router.post("/create", async (req, res) => {
  try {
    const ticketNumber = String(req.body.ticketNumber || "")
      .trim()
      .padStart(4, "0");
    const requester = String(req.body.requester || "").trim();
    const dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
    const category = String(req.body.category || "").trim();
    const title = String(req.body.title || "").trim();
    const subjectLine = String(req.body.subjectLine || "").trim();
    const description = String(req.body.description || "").trim();
    const priority = String(req.body.priority || "").trim();

    await Ticket.create({
      ticketNumber,
      requester,
      dueDate,
      category,
      title,
      subjectLine,
      description,
      priority,
      //status defaults to "Open" from schema
      //assignee defaults to "Unclaimed" from schema
    });

    return res.redirect("/"); // or "/tickets"
  } catch (err) {
    console.error(err);
    //if duplicate ticketNumber or validation error
    return res.status(500).send("Failed to create ticket");
  }
});

//GET /tickets/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).send("Ticket not found");
    }

    const ticket = await Ticket.findById(id).lean();
    if (!ticket) return res.status(404).send("Ticket not found");

    return res.render("pages/ticket-view", { ticket });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Failed to load ticket");
  }
});
//routes/tickets.js
router.post("/newMessage", async (req, res) => {
  const { ticketId, Name, message } = req.body;

  await Ticket.findByIdAndUpdate(ticketId, {
    $push: { messages: { name: Name, message } },
  });

  res.redirect(`/tickets/${ticketId}`);
});

module.exports = router;
