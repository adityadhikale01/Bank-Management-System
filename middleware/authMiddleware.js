function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  req.flash("error", "Please log in to continue.");
  return res.redirect("/login");
}

function isGuest(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }

  return res.redirect("/dashboard");
}

module.exports = {
  isAuthenticated,
  isGuest,
};
