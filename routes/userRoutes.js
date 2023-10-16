const express = require("express")
const { register,
    login,
    logout, 
    getSingleUser,
    loginStatus,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword
} = require("../controllers/userCtrl")
const { protect } = require("../middlewares/authMiddleware")
const router = express.Router()

router.post("/register" , register)
router.post("/login" , login)
router.post("/logout" , logout)
router.get("/getUser",protect , getSingleUser)
router.get("/loginStatus" , loginStatus)
router.patch("/updateUser",protect , updateUser)
router.patch("/changePassword", protect , changePassword)
router.post("/forgotPassword", forgotPassword)
router.put("/resetPassword/:resetToken", resetPassword)






module.exports = router