const Account = require("../models/Account");
const Customer = require("../models/Customer");
const Transaction = require("../models/Transaction");

async function getDashboard(req, res) {
  try {
    const [customerCount, accountCount, transactionCount, totalBalanceData, recentTransactions] =
      await Promise.all([
        Customer.countDocuments(),
        Account.countDocuments(),
        Transaction.countDocuments(),
        Account.aggregate([
          {
            $group: {
              _id: null,
              totalBalance: { $sum: "$balance" },
            },
          },
        ]),
        Transaction.find()
          .sort({ date: -1 })
          .limit(5)
          .populate({
            path: "accountId",
            populate: { path: "customerId" },
          }),
      ]);

    const totalBalance = totalBalanceData.length
      ? totalBalanceData[0].totalBalance
      : 0;

    return res.render("dashboard", {
      title: "Dashboard",
      stats: {
        customerCount,
        accountCount,
        transactionCount,
        totalBalance,
      },
      recentTransactions,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    req.flash("error", "Could not load dashboard right now.");
    return res.redirect("/login");
  }
}

module.exports = {
  getDashboard,
};
