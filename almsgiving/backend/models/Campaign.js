const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    nonprofitId: { type: mongoose.Schema.Types.ObjectId, ref: "Nonprofit", required: true },

    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    goalAmount: { type: Number, required: true, min: 1 },
    amountRaised: { type: Number, default: 0, min: 0 },

    imageUrl: { type: String, default: "" },

    status: { type: String, enum: ["draft", "active", "ended"], default: "active" },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Campaign", campaignSchema);
