const express = require("express");
const passport = require("passport");
const router = express.Router();
const { sendToken } = require("../controllers/JWTHandler");

// @desc    Auth with Google
// @route   GET /auth/google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
// @desc    Google auth callback
// @route   GET /auth/google/callback
router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    return sendToken(user, 201, res);
  })(req, res, next);
});

module.exports = router;
