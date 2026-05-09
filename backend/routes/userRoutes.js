const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const {
  updateProfile,
  deleteAccount,
} = require("../controllers/userController");

// ✅ protected routes
router.put("/update", auth, updateProfile);
router.delete("/delete", auth, deleteAccount);

module.exports = router;