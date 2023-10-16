const asyncHandler = require("express-async-handler")
const User = require("../models/userModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const Token = require("../models/tokenModel")
const sendEmail = require("../utils/sendEmail")

const createToken = (id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn:"1d"})
}

const register = asyncHandler(async(req,res)=>{
    try {
        const {name , email , password} = req.body
        if(!name || !email || !password){
            res.status(400).json("add in all fields")
        }
        const user = await User.findOne({email})
        if (user) {
            res.status(403).json("you already registered")
        }
        const newUser = await User.create({name ,email,password})
        const token = createToken(newUser._id)
        res.cookie("token",token , {
            path : "/",
            httpOnly: true,
            secure :true ,
            sameSite : 'none',
            expires : new Date(Date.now()  + 1000 * 86400)  // 1day
        })
        res.status(201).json({
            message : "user Created successfully",
            user : {newUser,token}
        })
    } 
    catch (error) {
        console.log(error.message);
        res.status(400).json("error in register new user")
    }
})



const login = asyncHandler(async(req,res)=>{
    try {
        const {email , password} = req.body
        if(!email || !password){
            res.status(400).json("add in all fields")
        }
        const user = await User.findOne({email})
        if (!user) {
            res.status(403).json("user not found")
        }
        const correctPass = await bcrypt.compare(password , user.password)
        if (!correctPass) {
            return res.status(403).json('wrong email or password')
        }

        const token = createToken(user._id)
        res.cookie("token",token , {
            path : "/",
            httpOnly: true,
            secure :true ,
            sameSite : 'none',
            expires : new Date(Date.now()  + 1000 * 86400)  // 1day
        })
        res.status(201).json({
            message : "login successfully",
            user : {user,token}
        })
    } 
    catch (error) {
        console.log(error.message);
        res.status(400).json("error in login")
    }
})


const logout = asyncHandler(async(req,res)=>{
    try{
        res.cookie("token" , "" ,{
            path:"/",
            httpOnly:true,
            secure :true ,
            sameSite:'none',
            expires : new Date(0)
        })
        res.status(200).json("you are logged out")
    }
    catch(error){
        console.log(error.message);
        res.status(400).json("error in logout")
    }
})


const getSingleUser= asyncHandler(async(req,res)=>{
    try {
        const {_id} = req.user
        const user = await User.findById(_id).select("-password")
        res.status(200).json(user)
    } 
    catch (error) {
        console.log(error.message);
        res.status(400).json("error in git a user")
    }
})



const loginStatus= asyncHandler(async(req,res)=>{
    try {
        const token = req.cookies.token
        if (!token) {
            return res.json(false)
        }
        const verified = jwt.verify(token,process.env.JWT_SECRET)
        if (!verified) {
            return res.json(false)
        }
        res.json(true)
    } 
    catch (error) {
        console.log(error.message);
        res.status(400).json("error in get login status")
    }
})


const updateUser = asyncHandler(async(req,res)=>{
    try {
        const {_id} = req.user
        const {name, bio, phone, photo} = req.body

        const updatedUser = await User.findByIdAndUpdate(_id , {
            name : name || updatedUser.name ,
            bio : bio || updatedUser.bio ,
            phone : phone || updatedUser.phone ,
            photo : photo || updatedUser.photo 
        },
        {new: true}).select('-password')
        await updatedUser.save();
        res.status(200).json({
            message :"user updated successfully" ,
            updateUser : updatedUser
        })
    } 
    catch (error) {
        console.log(error.message);
        res.status(400).json("error in get login status")
    }
})



//change user password
const changePassword = asyncHandler(async (req, res) => {
    try {
        const { _id } = req.user;
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({ error: 'User not found. Please sign up again.' });
        }
        // Check if the user has a password set
        if (!user.password) {
            return res.status(400).json({ error: 'User password not found' });
        }
        // Check if the new password is provided
        if (!newPassword) {
            return res.status(400).json({ error: 'New password is required' });
        }
        // Check old password
        const verify = await bcrypt.compare(oldPassword, user.password);
        if (!verify) {
            return res.status(400).json({ error: 'Incorrect old password' });
        }
        // Update password
        user.password = newPassword;
        await user.save();
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error in changing password' });
    }
});


// forgot password
const forgotPassword = asyncHandler(async(req,res)=>{
        const {email} = req.body
        const user = await User.findOne({email });
        if (!user) {
            res.status(404).json("No user match this email")
        }
        // delete token if it exist in DB
        const token = await Token.findOne({userId : user._id})
        if(token){
            await  token.deleteOne()
        }

        // create reset token
        let resetToken = crypto.randomBytes(32).toString("hex") + user._id
        console.log(resetToken);
        // hash the reset token
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")
        console.log(hashedToken);
        // save hashedToken to DB
        await new Token({
            userId : user._id ,
            token : hashedToken ,
            createAt : Date.now()  ,
            expiresAt : Date.now() + 30 * (60 * 1000)  // 30 minutes
        }).save()

        // Reset Url
        // const resetUrl = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`
        // const message = `
        //     <h2>Hello ${user.name}</h2>
        //     <p>follow this link to reset your password</p>
        //     <a href=${resetUrl} clicktracking> ${resetUrl}</a>
        //     <p>regards....</p>
        // `
        // const subject = "password Reset token"
        // const sent_from = process.env.EMAIL_USER
        // const send_to = user.email

        const baseUrl = `Hi, please follow this link to reset password ,this link iis valid till 10 minute from now <a href='${process.env.FRONTEND_URL}/resetPassword/${resetToken}'>click here</a>`
        const data = {
            to : email ,
            subject : 'forgot password link' ,
            text :'Hey user' ,
            htm : baseUrl
        }


        try {
            // await sendEmail(send_to, sent_from, subject, message);
            sendEmail(data) ;
            res.status(200).json({
                success: true,
                message: "Reset Email SENT" 
            });
        } catch (error) {
            console.error("Email sending error:", error);
            res.status(500).json({
                success: false,
                message: "Email NOT SENT, TRY AGAIN"
            });
        }

    
})


// reset password
const resetPassword = asyncHandler(async(req,res)=>{
    try {
        const {password} = req.body;
        const {resetToken} = req.params;

        // hash resetToken , then compare there with token in DB
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")
        // find hashed  token in DB
        const userToken = await Token.findOne({
            token : hashedToken,
            expiresAt : {$gt :Date.now()}
        })
        if(!userToken){
            throw new Error('Invalid or Expired Token')
        }
        // update the user Password
        const user = await User.findOne({_id :userToken.userId })
        user.password = password
        await user.save()
        res.status(200).json({
            success:true,
            message:"PASSWORD RESET SUCCESSFULLY ,PLEASE LOGIN"
        })
    } 
    catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            message: "error in reset password"
        });
    }
})



module.exports ={
    register,
    login,
    logout,
    getSingleUser,
    loginStatus,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword
}