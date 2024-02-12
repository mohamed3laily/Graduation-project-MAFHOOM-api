const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const express = require("express");
const User = require("../models/userModel");
require("dotenv").config();
const { sendToken } = require("./JWTHandler");
const router = express.Router();

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/login/facebook/callback",
      profileFields: ["emails", "displayName", "photos"],
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        let user = await User.findOne({
          accountId: profile.id,
          provider: "facebook",
        });

        if (!user) {
          console.log("Adding new facebook user to DB..");
          user = new User({
            accountId: profile.id,
            fullName: profile.displayName,
            provider: "facebook",
            email:
              profile.emails && profile.emails.length > 0
                ? profile.emails[0].value
                : null,
            photo:
              profile.photos && profile.photos.length > 0
                ? profile.photos[0].value
                : null,
          });
          await user.save();
        } else {
          console.log("Facebook User already exists in DB..");
        }

        return cb(null, user);
      } catch (error) {
        return cb(error);
      }
    }
  )
);

router.get(
  "/login/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get("/facebook", passport.authenticate("facebook"), (req, res) => {
  res.redirect("/");
});

passport.serializeUser((user, done) => {
  done(null, user.id); // Serialize user ID
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user); // Deserialize user by ID
  } catch (err) {
    done(err);
  }
});

router.get(
  "/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/auth/facebook/error",
  }),
  function (req, res) {
    // Successful authentication, redirect to success screen.
    res.redirect("/login/facebook/success");
  }
);

router.get("/success", async (req, res) => {
  sendToken(req.user, 201, res);
  console.log(req.user.id);
});

router.get("/error", (req, res) => res.send("Error logging in via Facebook.."));

router.get("/signout", (req, res) => {
  try {
    req.logout(); // Logout user
    req.session.destroy(); // Destroy session
    res.status(200).send({ message: "Signed out successfully" });
  } catch (err) {
    res.status(400).send({ message: "Failed to sign out fb user" });
  }
});

module.exports = router;
