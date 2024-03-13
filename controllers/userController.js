const USER = require("../models/userModel");
var jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const {
  uploadPhotoCloud,
  uploadUserPhoto,
} = require("../middlewares/uploadPhoto");
const { sendToken } = require("../controllers/JWTHandler");

exports.userProfile = async (req, res) => {
  try {
    const id = req.user._id;
    const user = await USER.findById(id).select("-password");
    res.status(200).json(user);
    if (!user) {
      return res.status(200).json({ message: "User not found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json("error in get a user");
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, bio, phone } = req.body;

    const updatedFields = {};
    if (fullName) updatedFields.fullName = fullName;
    if (bio) updatedFields.bio = bio;
    if (phone) updatedFields.phone = phone;
    if (req.file) {
      // If a file is uploaded, use Cloudinary to store the photo
      await uploadPhotoCloud(req, res, async () => {
        if (req.file && req.file.cloudinaryUrl) {
          updatedFields.photo = req.file.cloudinaryUrl;
        }
      });
    }

    const updatedUser = await USER.findByIdAndUpdate(userId, updatedFields, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      updatedUser: updatedUser,
    });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ error: er });
  }
};
//change user password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user._id; // Corrected variable name from 'id' to 'userId'
    const { oldPassword, newPassword } = req.body;
    const user = await USER.findById(userId); // Corrected variable name from '_id' to 'userId'
    if (!user) {
      return res.status(200).json({
        status: "fail",
        error: "User not found. Please sign up again.",
      });
    }
    // Check if the user has a password set
    if (!user.password) {
      return res
        .status(200)
        .json({ status: "fail", error: "User password not found" });
    }
    // Check if the new password is provided
    if (!newPassword) {
      return res
        .status(200)
        .json({ status: "fail", error: "New password is required" });
    }
    if (newPassword == oldPassword) {
      return res.status(200).json({
        error:
          "New password is the same as the old password, make a new password",
      });
    }
    // Check old password
    const verify = await bcrypt.compare(oldPassword, user.password);
    if (!verify) {
      return res
        .status(200)
        .json({ status: "fail", error: "Incorrect old password" });
    }
    // Update password
    user.password = newPassword;
    await user.save();
    res
      .status(200)
      .json({ status: "success", message: "Password changed successfully" });
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
    return next(
      res.status(200).json({ status: "fail", message: "User not found" })
    );
  }
  //generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //send it to user's email

  const message = `Subject: Password Reset Request

  Dear ${user.fullName.split(" ")[0]},
  
  We have received a request to reset the password associated with your account. To complete the password reset process, please use the following verification code:
  
  Verification Code: ${resetToken}
  
  Please enter this verification code in the appropriate field on the password reset page. If you did not request this password reset or have any concerns, please contact our support team immediately.
  
  Thank you,
  Mafhoom Team`;
  try {
    sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "success",
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
    .update(req.body.token)
    .digest("hex");
  const user = await USER.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      res
        .status(200)
        .json({ status: "fail", message: "Token is invalid or has expired" })
    );
  }
  //set new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  if (!req.body.password || !req.body.passwordConfirm) {
    return next(
      res.status(200).json({ status: "fail", message: "password is required" })
    );
  }
  if (req.body.password !== req.body.passwordConfirm) {
    return next(
      res
        .status(200)
        .json({ status: "fail", message: "passwords are not the same" })
    );
  }
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateBeforeSave: false });
  //log the user in, send JWT
  sendToken(user, 201, res);
};
