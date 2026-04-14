const bcrypt = require("bcrypt");

const User = require("../models/User");

function getRegisterPage(req, res) {
  res.render("register", { title: "Register" });
}

function getLoginPage(req, res) {
  res.render("login", { title: "Login" });
}

async function registerUser(req, res) {
  try {
    const { username, password, confirmPassword } = req.body;

    if (!username || !password || !confirmPassword) {
      req.flash("error", "All fields are required.");
      return res.redirect("/register");
    }

    if (password !== confirmPassword) {
      req.flash("error", "Passwords do not match.");
      return res.redirect("/register");
    }

    if (password.length < 6) {
      req.flash("error", "Password must be at least 6 characters.");
      return res.redirect("/register");
    }

    const normalizedUsername = username.trim().toLowerCase();

    const existingUser = await User.findOne({ username: normalizedUsername });
    if (existingUser) {
      req.flash("error", "Username is already taken.");
      return res.redirect("/register");
    }

    // Hash password before saving to keep sensitive data secure.
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username: normalizedUsername,
      password: hashedPassword,
    });

    req.flash("success", "Registration successful. Please log in.");
    return res.redirect("/login");
  } catch (error) {
    console.error("Registration error:", error);
    req.flash("error", "Could not register user. Please try again.");
    return res.redirect("/register");
  }
}

function loginUser(req, res) {
  req.flash("success", `Welcome back, ${req.user.username}!`);
  res.redirect("/dashboard");
}

function logoutUser(req, res, next) {
  req.logout((error) => {
    if (error) {
      return next(error);
    }

    req.flash("success", "You have been logged out.");
    return res.redirect("/login");
  });
}

module.exports = {
  getRegisterPage,
  getLoginPage,
  registerUser,
  loginUser,
  logoutUser,
};
