const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { PORT } = require("./config/env");

const app = express();

// DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/results", require("./routes/resultRoutes"));
app.use("/api/user", require("./routes/userRoutes"));

// Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));