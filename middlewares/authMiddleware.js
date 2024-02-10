// const asyncHandler = require("express-async-handler")
// const User = require("../models/userModel")
// const jwt = require("jsonwebtoken")

// const protect =asyncHandler(async (req,res ,next)=>{
//     try {
//         const token = req.cookies.token
//         if (!token) {
//             res.status(400).json("your are not Authorized, login again")
//         }
//         //verify the token
//         const verifyToken = jwt.verify(token, process.env.JWT_SECRET)

//         // get the user
//         const user = await User.findById(verifyToken.id)
//         if (!user) {
//             res.status(400).json("user not found")
//         }
//         req.user = user
//         next()
//     }
//     catch (error) {
//         res.status(400).json("your are not Authorized")
//     }

// } )

// module.exports = {
//     protect
// }

const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

exports.protect = async (req, res, next) => {
  try {
    // Extract token from cookies
    const token = req.cookies.token;

    if (!token) {
      return res
        .status(401)
        .json({ error: "No token found. User not authenticated." });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user based on decoded token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ error: "Invalid token. User not authenticated." });
  }
};
