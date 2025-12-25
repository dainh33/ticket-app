const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

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

app.use(bodyParser.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

// replace with router code
app.get("/", async (req, res) => {
  res.render("pages/page-home");
});

app.get("/login", async (req, res) => {
  res.render("pages/login");
});

// other endpoints as defined by router

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

//modal code
