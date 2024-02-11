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
