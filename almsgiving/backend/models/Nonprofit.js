const mongoose = require("mongoose");

const nonprofitSchema = new mongoose.Schema(
  {
    organizationName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    logoUrl: { type: String, default: "" },
    description: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Nonprofit", nonprofitSchema);
