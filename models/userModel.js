const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

function validateSentencesLength(val) {
  return val.length <= 20;
}

var userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
    },
    accountId: {
      type: String,
      default: "",
    },
    fullName: {
      type: String,
      required: [true, "please add a name"],
    },
    email: {
      type: String,
      required: [true, "please add an email"],
      unique: true,
      trim: true,
      default: "",
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        " add a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "please add a password"],
      minLength: [6, "password must be more than 6 character"],
    },
    passwordConfirm: {
      type: String,
      minlenght: 6,
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same!",
      },
      select: false,
    },
    photo: {
      type: String,
      //required: [true, "please add a photo"],
      default:
        "https://www.pngall.com/wp-content/uploads/5/User-Profile-PNG-Image.png",
    },
    phone: {
      type: String,
      // required:[true,"please add a phone number"],
    },
    bio: {
      type: String,
      maxLength: [250, "bio must be less than 250 character"],
      default: "",
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    changedPasswordAt: Date,
    sentences: {
      type: [String],
      validate: [
        validateSentencesLength,
        "sentences must be less than or equal to 20",
      ],
    },
    provider: {
      type: String,
      default: "local",
    },
  },
  {
    timestamp: true,
  }
);

// Hash the password before saving the user to the database
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next(); // If the password hasn't changed, no need to hash it again
    }
    this.password = await bcrypt.hash(this.password, 10);
    this.passwordConfirm = undefined;
    next();
  } catch (error) {
    next(error);
  }
});
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.changedPasswordAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// instance methode Compare the entered password with the password in the database
userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  try {
    return await bcrypt.compare(candidatePassword, userPassword);
  } catch (error) {
    throw new Error(error);
  }
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(6).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
