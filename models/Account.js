const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot be negative."],
    },
    accountType: {
      type: String,
      required: true,
      enum: ["Savings", "Current"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Account", accountSchema);
