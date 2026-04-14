const Account = require("../models/Account");
const Customer = require("../models/Customer");
const Transaction = require("../models/Transaction");

const ALLOWED_ACCOUNT_TYPES = ["Savings", "Current"];

function formatBalance(value) {
  return Number(value.toFixed(2));
}

async function getCreateAccountPage(req, res) {
  try {
    const customers = await Customer.find().sort({ name: 1 });

    return res.render("accounts/new", {
      title: "Open Account",
      customers,
    });
  } catch (error) {
    console.error("Get create account page error:", error);
    req.flash("error", "Could not load account creation page.");
    return res.redirect("/accounts");
  }
}

async function getAllAccounts(req, res) {
  try {
    const accounts = await Account.find()
      .populate("customerId")
      .sort({ createdAt: -1 });

    return res.render("accounts/index", {
      title: "Accounts",
      accounts,
    });
  } catch (error) {
    console.error("Get accounts error:", error);
    req.flash("error", "Could not load accounts.");
    return res.redirect("/dashboard");
  }
}

async function createAccount(req, res) {
  try {
    const { customerId, accountType, initialBalance } = req.body;
    const openingBalance = Number(initialBalance || 0);

    if (!customerId || !accountType) {
      req.flash("error", "Customer and account type are required.");
      return res.redirect("/accounts/new");
    }

    if (!ALLOWED_ACCOUNT_TYPES.includes(accountType)) {
      req.flash("error", "Please select a valid account type.");
      return res.redirect("/accounts/new");
    }

    if (Number.isNaN(openingBalance) || openingBalance < 0) {
      req.flash("error", "Initial balance must be 0 or greater.");
      return res.redirect("/accounts/new");
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      req.flash("error", "Selected customer does not exist.");
      return res.redirect("/accounts/new");
    }

    const account = await Account.create({
      customerId,
      accountType,
      balance: formatBalance(openingBalance),
    });

    if (openingBalance > 0) {
      await Transaction.create({
        accountId: account._id,
        amount: formatBalance(openingBalance),
        type: "credit",
      });
    }

    req.flash("success", "Account opened successfully.");
    return res.redirect("/accounts");
  } catch (error) {
    console.error("Create account error:", error);
    req.flash("error", "Could not create account. Check input values.");
    return res.redirect("/accounts/new");
  }
}

async function getAccountDetails(req, res) {
  try {
    const { id } = req.params;

    const account = await Account.findById(id).populate("customerId");
    if (!account) {
      req.flash("error", "Account not found.");
      return res.redirect("/accounts");
    }

    const transactions = await Transaction.find({ accountId: id }).sort({
      date: -1,
    });

    return res.render("accounts/show", {
      title: "Account Details",
      account,
      transactions,
    });
  } catch (error) {
    console.error("Get account details error:", error);
    req.flash("error", "Could not load account details.");
    return res.redirect("/accounts");
  }
}

async function createTransaction(req, res) {
  try {
    const { id } = req.params;
    const { type, amount } = req.body;

    const transactionAmount = Number(amount);

    if (Number.isNaN(transactionAmount) || transactionAmount <= 0) {
      req.flash("error", "Transaction amount must be greater than 0.");
      return res.redirect(`/accounts/${id}`);
    }

    if (!["deposit", "withdraw"].includes(type)) {
      req.flash("error", "Transaction type must be deposit or withdraw.");
      return res.redirect(`/accounts/${id}`);
    }

    const account = await Account.findById(id);
    if (!account) {
      req.flash("error", "Account not found.");
      return res.redirect("/accounts");
    }

    const cleanAmount = formatBalance(transactionAmount);
    let transactionType = "credit";

    if (type === "deposit") {
      account.balance = formatBalance(account.balance + cleanAmount);
      transactionType = "credit";
    }

    if (type === "withdraw") {
      if (account.balance < cleanAmount) {
        req.flash("error", "Insufficient balance for withdrawal.");
        return res.redirect(`/accounts/${id}`);
      }

      account.balance = formatBalance(account.balance - cleanAmount);
      transactionType = "debit";
    }

    await account.save();

    await Transaction.create({
      accountId: id,
      amount: cleanAmount,
      type: transactionType,
    });

    req.flash("success", "Transaction completed successfully.");
    return res.redirect(`/accounts/${id}`);
  } catch (error) {
    console.error("Create transaction error:", error);
    req.flash("error", "Could not complete transaction.");
    return res.redirect(`/accounts/${req.params.id}`);
  }
}

module.exports = {
  getCreateAccountPage,
  getAllAccounts,
  createAccount,
  getAccountDetails,
  createTransaction,
};
