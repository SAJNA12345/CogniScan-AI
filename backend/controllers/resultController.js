const Result = require("../models/Result");

// SAVE RESULT
exports.saveResult = async (req, res) => {
  try {
    const userId = req.user.id;
    const { score, type } = req.body;

const result = new Result({
  userId,
  score,
  type, // ✅ IMPORTANT
});

    

    await result.save();

    res.json({ message: "Result saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving result" });
  }
};

// GET RESULTS
exports.getResults = async (req, res) => {
  try {
    const results = await Result.find({ userId: req.user.id }).sort({
      date: -1,
    });

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Error fetching results" });
  }
};