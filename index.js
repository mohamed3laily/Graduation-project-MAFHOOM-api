const express = require("express");
require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoutes");
const app = express();
const facebookLogin = require("./controllers/facebookLogin");
const session = require("express-session");
const passport = require("passport");
require("./config/passport-setup")(passport);
const googleAuthRoutes = require("./routes/googleAuthRoutes");

app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

// routes
app.use("/users", userRoutes);
app.use("/login/facebook", facebookLogin);
app.use("/auth", googleAuthRoutes);

// Connect to MongoDB
const dbName = "GraduationProject";
mongoose
  .connect(process.env.DATABASE_URL, {
    dbName,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected!"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

app.get("/", (req, res) => {
  res.send("Hello World! ta7eya 5asa");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
