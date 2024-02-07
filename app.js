const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const ejs = require("ejs");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Set up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Define User schema and model
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  firstName: String,
  lastName: String,
  dateOfBirth: Date,
  email: String,
});

const User = mongoose.model("User", userSchema);

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", async (req, res) => {
  const { username, password, firstName, lastName, dateOfBirth, email } =
    req.body;

  try {
    const newUser = new User({
      username,
      password,
      firstName,
      lastName,
      dateOfBirth,
      email,
    });
    await newUser.save();
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.redirect("/signup");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });
    if (user) {
      req.session.user = user;
      res.redirect("/dashboard");
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.error(err);
    res.redirect("/login");
  }
});

app.get("/dashboard", async (req, res) => {
  if (req.session.user) {
    try {
      const users = await User.find({});
      res.render("dashboard", { users });
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    } else {
      res.redirect("/login"); // Redirect to the login page after logout
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
