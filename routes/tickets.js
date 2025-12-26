const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");

//POST /tickets/create
router.post("/create", async (req, res) => {
  try {
    const ticketNumber = String(req.body.ticketNumber || "")
      .trim()
      .padStart(4, "0");
    const requester = String(req.body.requester || "").trim();
    const dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
    const category = String(req.body.category || "").trim();
    const subjectLine = String(req.body.subjectLine || "").trim();
    const description = String(req.body.description || "").trim();
    const priority = String(req.body.priority || "").trim();

    await Ticket.create({
      ticketNumber,
      requester,
      dueDate,
      category,
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

module.exports = router;
