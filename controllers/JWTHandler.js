var jwt = require("jsonwebtoken");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN_SECRET, {
    expiresIn: process.env.Token_EXPIRES_IN,
  });
};

exports.sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookiesOptions = {
    expires: new Date(
      Date.now() + process.env.Token_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookiesOptions.secure = true;

  user.password = undefined;
  res.cookie("jwt", token, cookiesOptions);
<<<<<<< HEAD
  res
    .status(statusCode)
    .json({ message: "Successful Login", token, data: user });
=======
  res.status(statusCode).json({ message: "Successful Login", token, data: user });
>>>>>>> 4c37835ae0a63f4d288e48a088579945c917b13f
};
