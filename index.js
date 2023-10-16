const express = require("express")
const dotenv = require("dotenv").config();
const cors = require("cors")
const mongoose = require("mongoose")
const bodyParser= require("body-parser")
const cookieParser = require("cookie-parser")

const app = express();



// middleware
app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.use(express.urlencoded({extended :false}))
app.use(bodyParser.json())


// routes
app.use("/api/users" , require("./routes/userRoutes"))


// connect to DB
const connectToDB = ()=>{
    try {
        mongoose.connect(process.env.MONGO_URL)
        console.log("mongoDb connected successfully ^_^");
    } 
    catch (error) {
        console.log("mongoDb connected failed");
    }
}

const port = process.env.PORT || 3000
app.listen(port, ()=>{
    console.log(`server running on port ${port}`);
    connectToDB()
})