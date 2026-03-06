const express = require("express");
const Campaign = require("../models/Campaign");
const requireAuth = require("../middleware/auth");
const mongoose = require("mongoose");

const upload = require("../utils/upload");

const router = express.Router();

/**
 * PUBLIC: GET /campaigns
 * List all campaigns (donor-facing)
 */
router.get("/", async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    return res.json({ campaigns });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * PROTECTED: GET /campaigns/mine/list
 * Campaigns owned by the logged-in nonprofit
 */
router.get("/mine/list", requireAuth, async (req, res) => {
  try {
    const campaigns = await Campaign.find({
      nonprofitId: req.user.nonprofitId,
    }).sort({ createdAt: -1 });

    return res.json({ campaigns });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * PUBLIC: GET /campaigns/:id
 * Get one campaign by id (donor-facing)
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid campaign ID" });
  }

  try {
    const campaign = await Campaign.findById(id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    return res.json({ campaign });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * PROTECTED: POST /campaigns
 * Accepts multipart/form-data with optional file field "image"
 */
router.post("/", requireAuth, upload.single("image"), async (req, res) => {
  try {
    const nonprofitId = req.user?.nonprofitId;
    if (!nonprofitId) return res.status(401).json({ error: "Unauthorized" });

    const { title, description, goalAmount, status, imageUrl } = req.body;

    if (!title || !goalAmount) {
      return res.status(400).json({ error: "title and goalAmount are required" });
    }

    const cleanImageUrl = typeof imageUrl === "string" ? imageUrl.trim() : "";
    const finalImageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : cleanImageUrl || "";

    const campaign = await Campaign.create({
      nonprofitId,
      title,
      description: description || "",
      goalAmount: Number(goalAmount || 0),
      imageUrl: finalImageUrl,
      amountRaised: 0,
      status: status || "active",
    });

    return res.status(201).json({ campaign });
  } catch (err) {
    console.error("CREATE CAMPAIGN ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * PROTECTED: PATCH /campaigns/:id
 * Update a campaign (owner only). Also supports optional new image upload.
 */
router.patch("/:id", requireAuth, upload.single("image"), async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid campaign ID" });
  }

  try {
    const campaign = await Campaign.findById(id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    if (String(campaign.nonprofitId) !== String(req.user.nonprofitId)) {
      return res.status(403).json({ error: "Not allowed" });
    }

    const { title, description, goalAmount, status, imageUrl } = req.body;

    if (title !== undefined) campaign.title = title;
    if (description !== undefined) campaign.description = description;
    if (goalAmount !== undefined) campaign.goalAmount = Number(goalAmount || 0);
    if (status !== undefined) campaign.status = status;

    // If a new file is uploaded, it wins
    if (req.file) {
      campaign.imageUrl = `/uploads/${req.file.filename}`;
    } else if (imageUrl !== undefined) {
      // If no file, allow manual URL changes
      campaign.imageUrl = String(imageUrl || "").trim();
    }

    await campaign.save();
    return res.json({ campaign });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * PROTECTED: DELETE /campaigns/:id
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid campaign ID" });
    }

    const nonprofitId = req.user?.nonprofitId;
    if (!nonprofitId) return res.status(401).json({ error: "Unauthorized" });

    const result = await Campaign.deleteOne({ _id: id, nonprofitId });

    if (result.deletedCount === 0) {
      return res.status(403).json({ error: "Not authorized to delete this campaign" });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;