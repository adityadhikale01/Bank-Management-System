const Customer = require("../models/Customer");

function getCreateCustomerPage(req, res) {
  res.render("customers/new", { title: "Add Customer" });
}

async function getAllCustomers(req, res) {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });

    return res.render("customers/index", {
      title: "Customers",
      customers,
    });
  } catch (error) {
    console.error("Get customers error:", error);
    req.flash("error", "Could not load customers.");
    return res.redirect("/dashboard");
  }
}

async function createCustomer(req, res) {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      req.flash("error", "Name, email and phone are required.");
      return res.redirect("/customers/new");
    }

    await Customer.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
    });

    req.flash("success", "Customer created successfully.");
    return res.redirect("/customers");
  } catch (error) {
    console.error("Create customer error:", error);
    req.flash("error", "Could not create customer. Check input values.");
    return res.redirect("/customers/new");
  }
}

module.exports = {
  getCreateCustomerPage,
  getAllCustomers,
  createCustomer,
};
