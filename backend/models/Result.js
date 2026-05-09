const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  score: Number,
  words: Number,
  level: String,
  feedback: String,
  suggestion: String,
  type: {
    type: String,
    default: "speech",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Result", resultSchema);