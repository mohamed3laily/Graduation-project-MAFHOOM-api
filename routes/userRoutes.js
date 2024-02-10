const express = require("express");
const router = express.Router();
const userController = require("../controllers/userCtrl");

// const {
//   register,
//   login,
//   logout,
//   getSingleUser,
//   updateUser,
//   changePassword,
//   forgotPassword,
//   resetPassword,
//   saveSentence,
// } = require("../controllers/userCtrl");
const { protect } = require("../middlewares/authMiddleware");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.post("/saveSentence", protect, userController.saveSentence);
router.post("/forgotPassword", userController.forgotPassword);

router.get("/getUser", protect, userController.forgotPassword);

router.patch("/changePassword", protect, userController.changePassword);
router.patch("/resetPassword/:resetToken", userController.resetPassword);

module.exports = router;
