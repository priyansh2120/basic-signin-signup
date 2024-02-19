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

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  firstName: String,
  lastName: String,
  dateOfBirth: Date,
  email: String,
});

const User = mongoose.model("User", userSchema);

const loginSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  username: String,
  password: String,
});

const Login = mongoose.model("Login", loginSchema);

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

    const savedUser = await newUser.save();

    const newLogin = new Login({
      userId: savedUser._id,
      username,
      password,
    });

    await newLogin.save();

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
    const loginDetails = await Login.findOne({ username, password });

    if (loginDetails) {
      const user = await User.findOne({ _id: loginDetails.userId }); // Corrected field name

      if (user) {
        req.session.user = user;
        res.redirect("/dashboard");
        return;
      }
    }

    res.redirect("/login");
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

app.get("/success", (req, res) => {
  if (req.session.user) {
    const user = req.session.user;
    res.render("success", { user });
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
      res.redirect("/login");
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
