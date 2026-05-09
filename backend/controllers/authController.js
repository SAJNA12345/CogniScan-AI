const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// =======================
// ✅ SIGNUP CONTROLLER
// =======================
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("Signup request:", req.body);

    // check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists");
      return res.status(400).json({ message: "User already exists" });
    }

    const bcrypt = require("bcryptjs");

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    // 🔥 SAVE USER
    const savedUser = await newUser.save();

    console.log("User saved successfully:", savedUser);

    res.status(201).json({ message: "Signup successful" });

  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ message: "Server error during signup" });
  }
};


// =======================
// ✅ LOGIN CONTROLLER
// =======================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login request:", email);

    // 🔹 Find user
    const user = await User.findOne({ email });
    console.log("USER FROM DB:", user);

    if (!user) {
      console.log("User not found");
      return res.status(400).json({ message: "User not found" });
    }

    // 🔹 Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("Invalid password");
      return res.status(400).json({ message: "Invalid password" });
    }

    // 🔹 Generate token
    const token = jwt.sign(
      { id: user._id },
      "secret", // ⚠️ later move to env
      { expiresIn: "1d" }
    );

    console.log("Login successful:", user.email);

    // 🔹 Send response (VERY IMPORTANT)
    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};