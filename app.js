require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");

const configurePassport = require("./config/passport");
const { isAuthenticated } = require("./middleware/authMiddleware");
const dashboardController = require("./controllers/dashboardController");

const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const accountRoutes = require("./routes/accountRoutes");

const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bank_management_system";
const SESSION_SECRET =
  process.env.SESSION_SECRET || "please_change_this_session_secret";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
configurePassport(passport);

app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }
  return res.redirect("/login");
});

app.get("/dashboard", isAuthenticated, dashboardController.getDashboard);

app.use("/", authRoutes);
app.use("/customers", customerRoutes);
app.use("/accounts", accountRoutes);

app.use((req, res) => {
  res.status(404).render("not-found", { title: "Page Not Found" });
});

app.use((err, req, res, next) => {
  console.error("Unexpected error:", err);
  req.flash("error", "Something went wrong. Please try again.");
  const fallbackPath = req.isAuthenticated() ? "/dashboard" : "/login";
  res.status(500).redirect(fallbackPath);
});

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Could not start server:", error.message);
    process.exit(1);
  }
}

startServer();
