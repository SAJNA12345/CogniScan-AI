const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    // ✅ Extract token from "Bearer token"
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, "secret");

    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
};