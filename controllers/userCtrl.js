const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Token = require("../models/tokenModel");
const sendEmail = require("../utils/sendEmail");

exports.createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json("add in all fields");
    }
    const user = await User.findOne({ email });
    if (user) {
      res.status(403).json("you already registered");
    }
    const newUser = await User.create({ name, email, password });
    const token = createToken(newUser._id);
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "none",
      expires: new Date(Date.now() + 1000 * 86400), // 1day
    });
    res.status(201).json({
      message: "user Created successfully",
      user: { newUser, token },
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json("error in register new user");
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json("add in all fields");
    }
    const user = await User.findOne({ email });
    if (!user) {
      res.status(403).json("user not found");
    }
    const correctPass = await bcrypt.compare(password, user.password);
    if (!correctPass) {
      return res.status(403).json("wrong email or password");
    }

    const token = createToken(user._id);
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "none",
      expires: new Date(Date.now() + 1000 * 86400), // 1day
    });
    res.status(201).json({
      message: "login successfully",
      user: { user, token },
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json("error in login");
  }
};

exports.logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "none",
      expires: new Date(0),
    });
    res.status(200).json("you are logged out");
  } catch (error) {
    console.log(error.message);
    res.status(400).json("error in logout");
  }
};

exports.getSingleUser = async (req, res) => {
  try {
    const { _id } = req.user;
    const user = await User.findById(_id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.log(error.message);
    res.status(400).json("error in git a user");
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { _id } = req.user;
    const { name, bio, phone, photo } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
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
    const { _id } = req.user;
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(_id);
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
    res.status(500).json({ error: "Error in changing password" });
  }
};

// forgot password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404).json("No user match this email");
  }
  // delete token if it exist in DB
  const token = await Token.findOne({ userId: user._id });
  if (token) {
    await token.deleteOne();
  }
  // create reset token
  let resetToken = crypto.randomBytes(32).toString("hex") + user._id;
  console.log(resetToken);
  // hash the reset token
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  //   console.log(hashedToken);
  // save hashedToken to DB
  await new Token({
    userId: user._id,
    token: hashedToken,
    createAt: Date.now(),
    expiresAt: Date.now() + 10 * (60 * 1000), // 10 minutes
  }).save();

  // send email function
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/users/resetPassword/${resetToken}`;
  const message = `we have received a password reset request. please use the below link to reset your password \n\n ${resetUrl} \n\n this reset password will be valid for 10 minutes`;

  try {
    await sendEmail({
      email: user.email,
      subject: "password changed request received",
      message: message,
    });
    res.status(200).json({
      success: true,
      message: "Reset Email SENT",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Email NOT SENT, TRY AGAIN",
    });
  }

  // const baseUrl = `Hi, please follow this link to reset password ,this link iis valid till 10 minute from now <a href='${process.env.FRONTEND_URL}/resetPassword/${resetToken}'>click here</a>`
  // const data = {
  //     to : email ,
  //     subject : 'forgot password link' ,
  //     text :'Hey user' ,
  //     htm : baseUrl
  // }

  // try {
  //     // await sendEmail(send_to, sent_from, subject, message);
  //     sendEmail(data) ;
  //     res.status(200).json({
  //         success: true,
  //         message: "Reset Email SENT"
  //     });
  // } catch (error) {
  //     console.error("Email sending error:", error);
  //     res.status(500).json({
  //         success: false,
  //         message: "Email NOT SENT, TRY AGAIN"
  //     });
  // }
};

// reset password
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { resetToken } = req.params;
    console.log(resetToken);
    // hash resetToken , then compare there with token in DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    console.log(hashedToken);
    // find hashed  token in DB
    const userToken = await Token.findOne({
      token: hashedToken,
      expiresAt: { $gt: Date.now() },
    });
    if (!userToken) {
      throw new Error("Invalid or Expired Token");
    }
    // update the user Password
    const user = await User.findOne({ _id: userToken.userId });
    user.password = password;
    // make token undefined
    userToken.token = undefined;
    userToken.expiresAt = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "PASSWORD RESET SUCCESSFULLY ,PLEASE LOGIN",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "error in reset password",
    });
  }
};

// save sentences
exports.saveSentence = async (req, res) => {
  try {
    const { sentence } = req.body;
    const { _id } = req.user;
    console.log(_id);
    const user = await User.findById(_id);
    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found. Please sign up again." });
    }
    user.sentences.push(sentence);
    console.log(user.sentences);
    res.status(200).json({
      success: true,
      message: "add sentences successfully",
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      message: "failed to add this sentences",
    });
  }
};

// const saveSentence = asyncHandler(async (req, res) => {
//     try {
//         const { sentence } = req.body;
//         // Check if req.user is properly populated
//         if (!req.user || !req.user._id) {
//             return res.status(401).json({ error: "User not authenticated." });
//         }
//         const userId = req.user._id;
//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({ error: "User not found. Please sign up again." });
//         }
//         user.sentences.push(sentence);
//         await user.save();
//         res.status(200).json({
//             success: true,
//             message: "Sentence added successfully"
//         });
//     } catch (error) {
//         res.status(400).json({
//             error: error.message,
//             message: "Failed to add sentence"
//         });
//     }
// });

// module.exports = {
//   register,
//   login,
//   logout,
//   getSingleUser,
//   updateUser,
//   changePassword,
//   forgotPassword,
//   resetPassword,
//   saveSentence
// };
