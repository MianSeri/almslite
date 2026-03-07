const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    goalAmount: { type: Number, required: true, min: 1 },
    amountRaised: { type: Number, default: 0 },
    category: { type: String, trim: true },
    status: {
      type: String,
      enum: ["active", "draft", "completed"],
      default: "active",
    },

    // nonprofit owner
    nonprofit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Nonprofit",
      required: true,
    },

    // image support
    imageUrl: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Campaign", campaignSchema);