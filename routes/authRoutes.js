const express = require("express");
const passport = require("passport");

const authController = require("../controllers/authController");
const { isGuest, isAuthenticated } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/register", isGuest, authController.getRegisterPage);
router.post("/register", isGuest, authController.registerUser);

router.get("/login", isGuest, authController.getLoginPage);
router.post(
  "/login",
  isGuest,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: "Invalid username or password.",
  }),
  authController.loginUser
);

router.post("/logout", isAuthenticated, authController.logoutUser);

module.exports = router;
