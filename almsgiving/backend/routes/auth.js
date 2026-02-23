const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Nonprofit = require("../models/Nonprofit");

const router = express.Router();

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { organizationName, password } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!organizationName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await Nonprofit.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const nonprofit = await Nonprofit.create({
      organizationName,
      email, // normalized
      passwordHash,
    });

    const token = jwt.sign(
      { nonprofitId: nonprofit._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      token,
      nonprofit: {
        id: nonprofit._id,
        organizationName: nonprofit.organizationName,
        email: nonprofit.email,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    console.log("LOGIN BODY:", req.body);
    console.log("LOGIN normalized email:", email);

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const nonprofit = await Nonprofit.findOne({ email });
    console.log("FOUND nonprofit?", Boolean(nonprofit), "email:", email);

    if (!nonprofit || !nonprofit.passwordHash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, nonprofit.passwordHash);
    console.log("PASSWORD VALID?", isValid);
    
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { nonprofitId: nonprofit._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      nonprofit: {
        id: nonprofit._id,
        organizationName: nonprofit.organizationName,
        email: nonprofit.email,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;