const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const savedSentencesController = require("../controllers/savedSentencesController");

const { protect } = require("../middlewares/authMiddleware");

router.post("/register", authController.signUp);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post(
  "/saveSentence",
  protect,
  savedSentencesController.createSavedSentence
);
router.get("/getUser", protect, userController.getUser);

router.patch("/changeMyPassword", protect, userController.changePassword);
router.post("/forgotPassword", userController.forgotPassword);
router.patch("/resetPassword/:token", userController.resetPassword);
module.exports = router;
