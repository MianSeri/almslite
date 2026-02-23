const express = require("express");
const Campaign = require("../models/Campaign");
const requireAuth = require("../middleware/auth");

const router = express.Router();

/**
 * PUBLIC: GET /campaigns
 * List all campaigns (donor-facing list)
 */
router.get("/", async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    return res.json({ campaigns }); // keep consistent with frontend
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * PROTECTED: GET /campaigns/mine
 * Get campaigns created by the logged-in nonprofit (dashboard)
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

const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/jpg"].includes(file.mimetype);
    cb(ok ? null : new Error("Only jpg/png allowed"), ok);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/**
 * PUBLIC: GET /campaigns/:id
 * Get one campaign by id (donor-facing)
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId BEFORE hitting database
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid campaign ID" });
  }

  try {
    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    return res.json({ campaign });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// PROTECTED: POST /campaigns
// Accepts multipart/form-data with optional file field "image"
router.post("/", requireAuth, upload.single("image"), async (req, res) => {
  try {
    const nonprofitId = req.user?.nonprofitId;
    if (!nonprofitId) return res.status(401).json({ error: "Unauthorized" });

    const { title, description, goalAmount, status, imageUrl } = req.body;

    // If a file is uploaded, store its served path
    // Otherwise use the manual imageUrl text input (optional)
    const cleanImageUrl = typeof imageUrl === "string" ? imageUrl.trim() : "";
    const finalImageUrl = req.file ? `/uploads/${req.file.filename}` : (cleanImageUrl || "");

    const campaign = await Campaign.create({
      nonprofitId,
      title,
      description,
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
 /**
 * PROTECTED: PUT /campaigns/:id
 * Update a campaign (owner only) with optional image upload
 */
router.put("/:id", requireAuth, upload.single("image"), async (req, res) => {
  try {
    const nonprofitId = req.user?.nonprofitId;
    if (!nonprofitId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid campaign ID" });
    }

    const { title, description, goalAmount, status, imageUrl } = req.body;

    const cleanImageUrl =
      typeof imageUrl === "string" ? imageUrl.trim() : "";

    const update = {
      title,
      description,
      goalAmount: Number(goalAmount || 0),
      status,
    };

    // If a new file uploaded → use it
    if (req.file) {
      update.imageUrl = `/uploads/${req.file.filename}`;
    }
    // Else if manual URL provided → use it
    else if (cleanImageUrl) {
      update.imageUrl = cleanImageUrl;
    }

    // Enforce ownership
    const campaign = await Campaign.findOneAndUpdate(
      { _id: id, nonprofitId },
      update,
      { new: true }
    );

    if (!campaign) {
      return res.status(403).json({
        error: "Not authorized to update this campaign",
      });
    }

    return res.json({ campaign });
  } catch (err) {
    console.error("UPDATE CAMPAIGN ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});


// PROTECTED: DELETE /campaigns/:id
// Only the owning nonprofit can delete their campaign
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid campaign ID" });
    }

    const nonprofitId = req.user?.nonprofitId; // matches your middleware
    if (!nonprofitId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Atomic: only deletes if it belongs to this nonprofit
    const result = await Campaign.deleteOne({ _id: id, nonprofitId });

    if (result.deletedCount === 0) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this campaign" });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
