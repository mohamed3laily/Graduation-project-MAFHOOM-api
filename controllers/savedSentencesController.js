const USER = require("../models/userModel");

exports.createSavedSentence = async (req, res) => {
  try {
    const { sentence } = req.body;
    const { _id } = req.user;

    const user = await USER.findById(_id);

    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found. Please sign up again." });
    }

    user.sentences.push(sentence);
    await user.save();

    // Respond with success message and updated sentences array
    res.status(200).json({
      data: user.sentences,
      success: true,
      message: "Sentence added successfully",
    });
  } catch (error) {
    // Handle errors
    res.status(400).json({
      error: error.message,
      message: "Failed to add this sentence",
    });
  }
};

////////// edit saved sentence it takes to req.body args "sentenceIndex" and "newSentence"
exports.editSavedSentence = async (req, res) => {
  try {
    const { _id } = req.user;
    const { sentenceIndex, newSentence } = req.body;

    const user = await USER.findById(_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.sentences[sentenceIndex] = newSentence;
    await user.save();

    res.status(200).json({
      message: "Sentence updated successfully",
      data: user.sentences,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update sentence" });
  }
};

exports.deleteSavedSentence = async (req, res) => {
  try {
    const { _id } = req.user;
    const { sentenceIndex } = req.body;

    const user = await USER.findById(_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (sentenceIndex < 0 || sentenceIndex >= user.sentences.length) {
      return res.status(400).json({ error: "Invalid sentence index" });
    }

    user.sentences.splice(sentenceIndex, 1);
    await user.save();

    res.status(200).json({
      message: "Sentence deleted successfully",
      data: user.sentences,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete sentence" });
  }
};
