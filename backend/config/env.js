// Centralized environment/config access.
// Loads .env once and validates required secrets at startup so we fail fast
// instead of silently signing tokens with a weak/placeholder key.
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error(
    "FATAL: JWT_SECRET is not set. Copy backend/.env.example to backend/.env and set a strong secret."
  );
  process.exit(1);
}

module.exports = {
  JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/dementiaDB",
  PORT: parseInt(process.env.PORT, 10) || 5000,
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || "http://localhost:8000",
};
