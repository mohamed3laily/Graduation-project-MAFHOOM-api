const USER = require("../models/userModel");
var jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

exports.getUser = async (req, res) => {
  try {
    const id = req.user._id;
    const user = await USER.findById(_id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.log(error.message);
    res.status(400).json("error in git a user");
  }
};

exports.updateUser = async (req, res) => {
  try {
    const id = req.user._id;
    const { name, bio, phone, photo } = req.body;

    const updatedUser = await USER.findByIdAndUpdate(
      _id,
      {
        name: name || updatedUser.name,
        bio: bio || updatedUser.bio,
        phone: phone || updatedUser.phone,
        photo: photo || updatedUser.photo,
      },
      { new: true }
    ).select("-password");
    await updatedUser.save();
    res.status(200).json({
      message: "user updated successfully",
      updateUser: updatedUser,
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json("error in get login status");
  }
};

//change user password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user._id; // Corrected variable name from 'id' to 'userId'
    const { oldPassword, newPassword } = req.body;
    const user = await USER.findById(userId); // Corrected variable name from '_id' to 'userId'
    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found. Please sign up again." });
    }
    // Check if the user has a password set
    if (!user.password) {
      return res.status(400).json({ error: "User password not found" });
    }
    // Check if the new password is provided
    if (!newPassword) {
      return res.status(400).json({ error: "New password is required" });
    }
    if (newPassword == oldPassword) {
      return res.status(400).json({
        error:
          "New password is the same as the old password, make a new password",
      });
    }
    // Check old password
    const verify = await bcrypt.compare(oldPassword, user.password);
    if (!verify) {
      return res.status(400).json({ error: "Incorrect old password" });
    }
    // Update password
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Error in changing password" });
  }
};

// forgot password
exports.forgotPassword = async (req, res, next) => {
  //check if user exists
  if (!req.body.email) {
    return next(new Error("Please provide email"));
  }
  const user = await USER.findOne({ email: req.body.email });
  if (!user) {
    return next(res.status(404).json({ message: "User not found" }));
  }
  //generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
  try {
    sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    res.status(200).json({
      message: "Token sent to email",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(res.status(500).json({ message: error.message }));
  }
};
//reset password
exports.resetPassword = async (req, res, next) => {
  // get user using token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await USER.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      res.status(400).json({ message: "Token is invalid or has expired" })
    );
  }
  //set new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //log the user in, send JWT
  sendToken(user, 201, res);
};
