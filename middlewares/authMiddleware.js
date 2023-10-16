const asyncHandler = require("express-async-handler")
const User = require("../models/userModel")
const jwt = require("jsonwebtoken")


const protect =asyncHandler(async (req,res ,next)=>{
    try {
        const token = req.cookies.token
        if (!token) {
            res.status(400).json("your are not Authorized, login again")
        }
        //verify the token
        const verifyToken = jwt.verify(token, process.env.JWT_SECRET)
        
        // get the user
        const user = await User.findById(verifyToken.id) 
        if (!user) {
            res.status(400).json("user not found")
        }
        req.user = user
        next()
    } 
    catch (error) {
        res.status(400).json("your are not Authorized")
    }

} ) 


module.exports = {
    protect
}