const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Ticket = require("./models/Ticket");

if (process.argv.length != 3) {
  console.error(`Usage: ${process.argv[1]} portNumber`);
  process.exit(1);
}
const portNumber = +process.argv[2];
if (isNaN(portNumber)) {
  console.error("Invalid port number given");
  process.exit(1);
}

dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("public"));

//MongoDB
mongoose.connect(process.env.MONGO_URI);

//pages
app.get("/", async (req, res) => {
  const ALLOWED_LIMITS = [10, 25, 50, 100];
  const ALLOWED_CATEGORIES = [
    "Admin",
    "Billing",
    "Bug",
    "Security",
    "Technical",
  ];

  let page = parseInt(req.query.page || "1", 10);
  if (isNaN(page) || page < 1) page = 1;

  let limit = parseInt(req.query.perPage || "50", 10);
  if (!ALLOWED_LIMITS.includes(limit)) limit = 50;

  let category = String(req.query.category || "").trim();
  if (!ALLOWED_CATEGORIES.includes(category)) category = "";

  const filter = {};
  if (category) filter.category = category;

  const skip = (page - 1) * limit;

  const [tickets, total] = await Promise.all([
    Ticket.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Ticket.countDocuments(filter),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (page > totalPages) page = totalPages;

  res.render("pages/page-home", {
    tickets,
    page,
    totalPages,
    hasPrev: page > 1,
    hasNext: page < totalPages,
    perPage: limit,
    perPageOptions: ALLOWED_LIMITS,
    category,
  });
});
app.get("/login", async (req, res) => res.render("pages/login"));
app.get("/landing", async (req, res) => res.render("pages/page-landing"));
app.get("/admin", async (req, res) => res.render("pages/create-user-admin"));

//Mount login/admin POST routes
app.use("/", require("./routes/login"));
app.use("/tickets", require("./routes/tickets"));

app.listen(portNumber);
console.log(`Web server started and running at http://localhost:${portNumber}`);

process.stdin.setEncoding("utf8");

const interpreterPrompt = "Type stop to shutdown the server: ";
process.stdout.write(interpreterPrompt);
process.stdin.on("readable", function () {
  const dataInput = process.stdin.read();
  if (dataInput !== null) {
    const command = dataInput.trim();
    switch (command) {
      case "stop":
        console.log("Shutting down the server");
        process.exit(0);
      default:
        console.error(`Invalid command: ${command}`);
    }
    process.stdout.write(interpreterPrompt);
    process.stdin.resume();
  }
});
