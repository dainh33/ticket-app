const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, ".env") });
const mongoose = require("mongoose");
const Ticket = require("./models/Ticket");
const User = require("./models/User");
const session = require("express-session");
const userRoutes = require("./routes/users");

const { MongoStore } = require("connect-mongo");
const {
  requireAuth,
  redirectIfAuthed,
  requireRole,
} = require("./middleware/auth");

if (process.argv.length != 3) {
  console.error(`Usage: ${process.argv[1]} portNumber`);
  process.exit(1);
}
const portNumber = +process.argv[2];
if (isNaN(portNumber)) {
  console.error("Invalid port number given");
  process.exit(1);
}

const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, //7day cookie lifetime
      // secure: true, //https
    },
  })
);

app.use(async (req, res, next) => {
  res.locals.user = null;

  if (req.session?.userId) {
    res.locals.user = await User.findById(req.session.userId)
      .select("name email role pfpUrl")
      .lean();
  }

  next();
});

app.use(bodyParser.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("public"));
app.use("/users", userRoutes);

//MongoDB
mongoose.connect(process.env.MONGO_URI);

//escapes any special character so that regex match doesnt get messed up
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
//pages
app.get("/", async (req, res) => {
  if (!req.session?.userId) {
    return res.render("pages/page-landing");
  }

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

  const category = String(req.query.category || "").trim();
  const safeCategory = ALLOWED_CATEGORIES.includes(category) ? category : "";

  const myTickets = req.query.name === "1";
  const q = String(req.query.q || "")
    .trim()
    .slice(0, 80);

  //filter content
  const filter = {};

  if (safeCategory) filter.category = safeCategory;

  if (myTickets) {
    const userName = req.session?.userName;
    if (!userName) return res.redirect("/login");
    filter.assignee = userName;
  }

  if (q) {
    const regex = new RegExp(escapeRegex(q), "i");
    filter.$or = [
      { ticketNumber: regex },
      { requester: regex },
      { title: regex },
      { subjectLine: regex },
      { description: regex },
      { category: regex },
      { priority: regex },
      { status: regex },
      { assignee: regex },
    ];
  }

  const total = await Ticket.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (page > totalPages) page = totalPages;

  const skip = (page - 1) * limit;

  const tickets = await Ticket.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.render("pages/page-home", {
    tickets,
    page,
    totalPages,
    hasPrev: page > 1,
    hasNext: page < totalPages,
    perPage: limit,
    perPageOptions: ALLOWED_LIMITS,
    category: safeCategory,
    q,
    showAlerts: myTickets || q,
    name: myTickets ? "1" : "",
  });
});
app.get("/login", redirectIfAuthed, (req, res) => res.render("pages/login"));
app.get("/landing", async (req, res) => res.render("pages/page-landing"));
app.get("/settings", async (req, res) => res.render("pages/page-settings"));

app.get("/admin", requireRole("admin"), (req, res) =>
  res.render("pages/create-user-admin")
);

app.use((req, res, next) => {
  res.locals.userEmail = req.session?.userEmail || null;
  res.locals.userName = req.session?.userName || null;
  next();
});

//Mount login/admin POST routes
app.use("/", require("./routes/login"));
//require auth to view tickets
app.use("/tickets", requireAuth, require("./routes/tickets"));

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
