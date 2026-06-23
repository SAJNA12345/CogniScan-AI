const express = require("express");
const router = express.Router();
const multer = require("multer");

const auth = require("../middleware/authMiddleware");
const {
  interviewTurn,
  assess,
  assessAudio,
  health,
} = require("../controllers/agentController");

// In-memory audio upload (forwarded straight to the agent-service).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
});

// Health is open (debug); the actual agent calls require a logged-in user.
router.get("/health", health);
router.post("/interview", auth, interviewTurn);
router.post("/assess", auth, assess);
router.post("/assess-audio", auth, upload.single("file"), assessAudio);

module.exports = router;
