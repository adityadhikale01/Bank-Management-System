const express = require("express");

const customerController = require("../controllers/customerController");
const { isAuthenticated } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(isAuthenticated);

router.get("/", customerController.getAllCustomers);
router.get("/new", customerController.getCreateCustomerPage);
router.post("/", customerController.createCustomer);

module.exports = router;
