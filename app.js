// const express = require("express");
// const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
// const session = require("express-session");
// const ejs = require("ejs");
// const dotenv = require("dotenv");
// const path = require("path");
// const bcrypt = require("bcrypt");

// dotenv.config();

// const app = express();
// const port = process.env.PORT || 3000;
// app.use(express.static(path.join(__dirname, "public")));

// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static("public"));
// app.set("view engine", "ejs");
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: true,
//   })
// );

// const userSchema = new mongoose.Schema({
//   username: String,
//   password: String,
//   firstName: String,
//   lastName: String,
//   dateOfBirth: Date,
//   email: String,
// });

// const User = mongoose.model("User", userSchema);

// const loginSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, required: true },
//   username: String,
//   password: String,
// });

// const Login = mongoose.model("Login", loginSchema);

// app.get("/", (req, res) => {
//   res.render("index");
// });

// app.get("/signup", (req, res) => {
//   res.render("signup");
// });

// const saltRounds = 10; // Number of salt rounds for bcrypt

// app.post("/signup", async (req, res) => {
//   const { username, password, firstName, lastName, dateOfBirth, email } =
//     req.body;

//   try {
//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, saltRounds);

//     const newUser = new User({
//       username,
//       password: hashedPassword, // Store the hashed password
//       firstName,
//       lastName,
//       dateOfBirth,
//       email,
//     });

//     const savedUser = await newUser.save();

//     const newLogin = new Login({
//       userId: savedUser._id,
//       username,
//       password: hashedPassword, // Store the hashed password
//     });

//     await newLogin.save();

//     res.redirect("/login");
//   } catch (err) {
//     console.error(err);
//     res.redirect("/signup");
//   }
// });

// app.get("/login", (req, res) => {
//   res.render("login");
// });

// app.post("/login", async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     const loginDetails = await Login.findOne({ username });

//     if (loginDetails) {
//       // Compare the hashed password
//       const passwordMatch = await bcrypt.compare(
//         password,
//         loginDetails.password
//       );

//       if (passwordMatch) {
//         const user = await User.findOne({ _id: loginDetails.userId });

//         if (user) {
//           req.session.user = user;
//           res.redirect("/dashboard");
//           return;
//         }
//       }
//     }

//     res.redirect("/login");
//   } catch (err) {
//     console.error(err);
//     res.redirect("/login");
//   }
// });

// app.get("/dashboard", async (req, res) => {
//   if (req.session.user) {
//     try {
//       const users = await User.find({});
//       res.render("dashboard", { users });
//     } catch (err) {
//       console.error(err);
//       res.status(500).send("Internal Server Error");
//     }
//   } else {
//     res.redirect("/login");
//   }
// });

// app.get("/success", (req, res) => {
//   if (req.session.user) {
//     const user = req.session.user;
//     res.render("success", { user });
//   } else {
//     res.redirect("/login");
//   }
// });

// app.get("/logout", (req, res) => {
//   req.session.destroy((err) => {
//     if (err) {
//       console.error(err);
//       res.status(500).send("Internal Server Error");
//     } else {
//       res.redirect("/login");
//     }
//   });
// });

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

// app.get("/user-data", async (req, res) => {
//   try {
//     const users = await User.find({});
//     res.render("user-data", { users });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Internal Server Error");
//   }
// });

// app.get("/login-data", async (req, res) => {
//   try {
//     const logins = await Login.find({});
//     res.render("login-data", { logins });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Internal Server Error");
//   }
// });

// app.post("/delete-user/:userId", async (req, res) => {
//   const userId = req.params.userId;

//   try {
//     // Delete user from the users collection
//     await User.findByIdAndDelete(userId);

//     // Delete login from the signins collection
//     await Login.findOneAndDelete({ userId });

//     // Redirect back to the user-data page after deletion
//     res.redirect("/user-data");
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Internal Server Error");
//   }
// });

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const ejs = require("ejs");
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcrypt");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

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
    saveUninitialized: false, // Changed to false to prevent always creating a session
  })
);

app.use(passport.initialize());
app.use(passport.session());
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}
const userSchema = new mongoose.Schema({
  googleId: String,
  username: String, // Add username field
  password: String,
  firstName: String,
  lastName: String,
  dateOfBirth: Date,
  email: String,
  profileComplete: { type: Boolean, default: false },
});

const User = mongoose.model("User", userSchema);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, cb) => {
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          profileComplete: false,
        });
      }

      cb(null, user);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
});

app.get("/", (req, res) => {
  res.render("index");
});
// Google OAuth routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    if (req.user.profileComplete) {
      res.redirect("/dashboard");
    } else {
      res.redirect("/complete-profile");
    }
  }
);

// Added for standard sign-up
app.get("/signup", (req, res) => {
  res.render("signup");
});

const saltRounds = 10;

app.post("/signup", async (req, res) => {
  const { username, password, firstName, lastName, dateOfBirth, email } =
    req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user instance with the provided data
    const newUser = new User({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      dateOfBirth,
      email,
    });

    // Save the new user to the database
    await newUser.save();

    res.redirect("/login"); // Redirect to login page after successful signup
  } catch (err) {
    console.error(err);
    res.redirect("/signup"); // Redirect back to signup page in case of error
  }
});

// Added for standard login

// app.post("/signup", async (req, res) => {
//   const { username, password, firstName, lastName, dateOfBirth, email } =
//     req.body;

//   try {
//     // Check if the email is already used for Google signup
//     const existingUser = await User.findOne({
//       email,
//       googleId: { $exists: true },
//     });
//     if (existingUser) {
//       console.log("This email is already used for Google signup.");
//       return res.redirect("/signup"); // Redirect back to signup page
//     }

//     // Check if the email is already used for normal signup
//     const existingNormalUser = await User.findOne({
//       email,
//       googleId: { $exists: false },
//     });
//     if (existingNormalUser) {
//       console.log("This email is already used for normal signup.");
//       return res.render('signup', { alertMessage: alertMessage });
//       // Redirect back to signup page
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, saltRounds);

//     // Create a new user instance with the provided data
//     const newUser = new User({
//       username,
//       password: hashedPassword,
//       firstName,
//       lastName,
//       dateOfBirth,
//       email,
//     });

//     // Save the new user to the database
//     await newUser.save();

//     res.redirect("/login"); // Redirect to login page after successful signup
//   } catch (err) {
//     console.error(err);
//     res.redirect("/signup"); // Redirect back to signup page in case of error
//   }
// });

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (user && (await bcrypt.compare(password, user.password))) {
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

// Complete profile route (for Google OAuth)
// Update the code where findById is used
app.get("/complete-profile", async (req, res) => {
  if (req.user) {
    try {
      const user = await User.findById(req.user._id);
      res.render("complete-profile", { user });
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.redirect("/login");
  }
});

app.post("/complete-profile", async (req, res) => {
  const { username, firstName, lastName, dateOfBirth } = req.body;
  try {
    await User.findByIdAndUpdate(req.user._id, {
      username, // Update username field
      firstName,
      lastName,
      dateOfBirth,
      profileComplete: true,
    });
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error updating profile: ", error);
    res.redirect("/complete-profile");
  }
});

app.get("/success", ensureAuthenticated, (req, res) => {
  const user = req.user || req.session.user;
  res.render("success", { user });
});

app.get("/dashboard", async (req, res) => {
  if (req.user || req.session.user) {
    // Modified to support both session and passport user
    try {
      const users = await User.find({});
      res.render("dashboard", { users, user: req.user || req.session.user });
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
      // Ensure to logout from passport as well
      req.logout(() => {
        res.redirect("/login");
      });
    }
  });
});

app.get("/user-data", async (req, res) => {
  if (!req.user && !req.session.user) {
    return res.redirect("/login");
  }
  try {
    const users = await User.find({});
    res.render("user-data", { users, user: req.user || req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Assuming "Login" collection and related routes are not used since
// we integrated Google OAuth and the local signup/login system directly into the "User" model.

app.post("/delete-user/:userId", async (req, res) => {
  if (!req.user && !req.session.user) {
    return res.redirect("/login");
  }
  const userId = req.params.userId;

  try {
    await User.findByIdAndDelete(userId);
    res.redirect("/user-data");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
