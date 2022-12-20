const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
app.set("view engine", "pug");
app.set("views", "views");
dotenv.config({ path: "./.env" });
const sendgrid = require("@sendgrid/mail");
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
const folderPath = __dirname + "/files";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "./public")));
app.use(cors());
app.options("*", cors());

//use helmet
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: "Too many requests from this IP, please try again in 15 minutes", //message when rate reached
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.get("/", (req, res, next) => {
  var payload = { title: "Home" };
  return res.render("index", payload);
});

app.get("/cv", function (req, res) {
  console.log("single file");

  res.download(folderPath + "/cv.pdf", function (err) {
    if (err) {
      var payload = {
        title: "Home",
        error: "An error occured, please try again",
      };
      console.log(err);
      return res.render("index", payload);
    }
  });
});

app.post("/contact", async (req, res) => {
  console.log(req.body)
  const { email, name } = req.body;
  await sendgrid
    .send({
      from: process.env.SENDGRID_EMAIL_FROM,
      to: email,
      templateId: process.env.TEMPLATE_ID,
      dynamic_template_data: {name: name, actionurl: ""},
    })
    .catch((err) => {
      var payload = {
        title: "Home",
        message: err.message,
      };
      return res.render("index", payload);
    });
  var payload = {
    title: "Home",
    message: "Email Sent successfully",
  };
  return res.render("index", payload);
});

// SERVER
module.exports = app;
