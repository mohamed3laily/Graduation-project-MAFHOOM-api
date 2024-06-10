const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const User = require("../models/userModel");

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL}/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          if (!profile.emails || profile.emails.length === 0) {
            return done(new Error("No email found in Google profile"), null);
          }

          const newUser = {
            accountId: profile.id,
            password: process.env.GOOGLE_USER_PASSWORD,
            fullName: profile.displayName,
            email: profile.emails[0].value,
            photo: profile.photos[0].value,
            provider: "google",
          };

          let user = await User.findOne({ accountId: profile.id });

          if (user) {
            return done(null, user);
          }

          user = await User.findOne({ email: newUser.email });
          if (user) {
            return done(new Error("Email already exists"), null);
          }

          user = await User.create(newUser);
          return done(null, user);
        } catch (err) {
          console.error("Error during Google authentication", err);
          return done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      if (err) {
        console.error("Error deserializing user", err);
      }
      done(err, user);
    });
  });
};
