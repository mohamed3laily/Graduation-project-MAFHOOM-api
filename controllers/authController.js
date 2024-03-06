const User = require("../models/userModel");
var jwt = require("jsonwebtoken");
const { promisify } = require("util");
//const sendEmail = require("../utils/emailSender");
const crypto = require("crypto");
const { compare } = require("bcryptjs");
const { sendToken } = require("./JWTHandler");

///////////////////////////////////////////////

exports.signUp = async (req, res) => {
  const { userName, email, password, passwordConfirm, phone, fullName } =
    req.body;

  try {
    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(200).json({
        status: "fail",
        message: "Email already in use. Please use a different email.",
      });
    }
    if (!email || !userName || !password || !passwordConfirm) {
      return res.status(200).json({
        status: "fail",
        message: "Please provide an email",
      });
    }
    if (password < 6) {
      return res.status(200).json({
        status: "fail",
        message: "Please provide an email",
      });
    }

    // Create a new user
    const user = new User({
      userName,
      password,
      passwordConfirm,
      email,
      phone,
      fullName,
    });
    if (password !== passwordConfirm) {
      return res.status(200).json({
        status: "fail",
        message: "Passwords do not match",
      });
    }

    // Save the new user to the database
    const newUser = await user.save();

    // Generate and send JWT token
    sendToken(newUser, 201, res);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, userName, password } = req.body;

    // Check if either email or userName is provided
    if (!email && !userName) {
      res.status(200).json({
        status: "fail",
        message: "Invalid email/username or password",
      });
      throw new Error("Please provide email or username");
    }

    let user;

    if (email) {
      user = await User.findOne({ email }).select("+password");
    } else if (userName) {
      user = await User.findOne({ userName }).select("+password");
    }

    if (!user || !(await user.comparePassword(password, user.password))) {
      res.status(200).json({
        status: "fail",
        message: "Invalid email/username or password",
      });
    }

    sendToken(user, 200, res);
  } catch (error) {
    next(error);
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
    res.status(200).json({ status: "success", message: "You are logged out" });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ error: "Error in logout" });
  }
};
