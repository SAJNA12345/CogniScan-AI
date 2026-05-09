const express = require("express");
const router = express.Router();

// ✅ Import controller functions
const {
  saveResult,
  getResults
} = require("../controllers/resultController");

// ✅ Import auth middleware
const auth = require("../middleware/authMiddleware");


// ===============================
// 🚀 ROUTES
// ===============================

// ✅ Save cognitive test result
// POST → /api/results
router.post("/", auth, saveResult);


// ✅ Get all results of logged-in user
// GET → /api/results
router.get("/", auth, getResults);


module.exports = router;