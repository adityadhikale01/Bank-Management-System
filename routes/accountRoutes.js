const express = require("express");

const accountController = require("../controllers/accountController");
const { isAuthenticated } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(isAuthenticated);

router.get("/", accountController.getAllAccounts);
router.get("/new", accountController.getCreateAccountPage);
router.post("/", accountController.createAccount);
router.get("/:id", accountController.getAccountDetails);
router.post("/:id/transactions", accountController.createTransaction);

module.exports = router;
