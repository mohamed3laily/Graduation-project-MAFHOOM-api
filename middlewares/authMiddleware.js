const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { promisify } = require("util");

exports.protect = async (req, res, next) => {
  // get the token from the header if it exists
  let token = "";
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new Error("You are not logged in! Please log in to get access.")
    );
  }

  // Verify token
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, process.env.TOKEN_SECRET);
  } catch (error) {
    return next(res.status(401).json({ message: error.message }));
  }
  //check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(res.status(401).json({ message: "User no longer exists" }));
  }
  req.user = currentUser;
  next();
};
