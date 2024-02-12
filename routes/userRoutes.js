const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const savedSentencesController = require("../controllers/savedSentencesController");
const {
  uploadUserPhoto,
  uploadPhotoCloud,
} = require("../middlewares/uploadPhoto");

const { protect } = require("../middlewares/authMiddleware");

router.post("/register", authController.signUp);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post(
  "/createSavedSentence",
  protect,
  savedSentencesController.createSavedSentence
);
router.patch(
  "/editSavedSentence",
  protect,
  savedSentencesController.editSavedSentence
);

router.delete(
  "/deleteSavedSentence",
  protect,
  savedSentencesController.deleteSavedSentence
);

router.get("/myProfile", protect, userController.userProfile);
router.patch(
  "/updateUser",
  protect,
  uploadUserPhoto,
  userController.updateUserProfile
);

router.patch("/changeMyPassword", protect, userController.changePassword);
router.post("/forgotPassword", userController.forgotPassword);
router.patch("/resetPassword/:token", userController.resetPassword);
module.exports = router;
