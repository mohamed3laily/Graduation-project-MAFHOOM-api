const User = require("../models/userModel");
var jwt = require("jsonwebtoken");
const { promisify } = require("util");
//const sendEmail = require("../utils/emailSender");
const crypto = require("crypto");
const { compare } = require("bcryptjs");
///////////////////////////////////////////////

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookiesOptions = {
    expires: new Date(
      Date.now() + process.env.Token_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookiesOptions.secure = true;

  user.password = undefined;
  res.cookie("jwt", token, cookiesOptions);
  res.status(statusCode).json({ message: "success", token, data: user });
};

exports.signUp = async (req, res) => {
  const { userName, email, password, passwordConfirm, phone, fullName } =
    req.body;

  try {
    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "Email already in use. Please use a different email.",
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

    // Save the new user to the database
    const newUser = await user.save();

    // Generate and send JWT token
    sendToken(newUser, 201, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, userName, password } = req.body;

    if (!password) {
      return next(new Error("Please provide a password"));
    }

    // Check if either email or userName is provided
    if (!email && !userName) {
      return next(new Error("Please provide email or username"));
    }

    let user;

    if (email) {
      user = await User.findOne({ email }).select("+password");
    } else if (userName) {
      user = await User.findOne({ userName }).select("+password");
    }

    if (!user || !(await user.comparePassword(password, user.password))) {
      return next(new Error("Incorrect email/username or password"));
    }

    sendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
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