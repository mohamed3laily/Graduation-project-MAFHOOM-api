const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require("bcryptjs")


var userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "please add a name"],
    },
    email:{
        type:String,
        required:[true, "please add an email"],
        unique:true,
        trim : true,
        match :[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ , " add a valid email"]
    },
    password:{
        type:String,
        required:[true, "please add a password"],
        minLength :[6,"password must be more than 6 character"]
    },
    photo :{
        type:String,
        required:[true, "please add a photo"],
        default : "https://www.google.com/imgres?imgurl=https%3A%2F%2Ficon2.cleanpng.com%2F20180319%2Fepw%2Fkisspng-india-login-computer-icons-emoticon-medicine-user-login-icon-5ab05c8bc2f8d1.4479395815215074677986.jpg&tbnid=yunYLuUtWvCsGM&vet=12ahUKEwj08v7mpvKBAxXwsCcCHUC3D4sQMyg1egUIARDFAQ..i&imgrefurl=https%3A%2F%2Fwww.cleanpng.com%2Ffree%2Flogin.html&docid=z5gzLO3qaSV5eM&w=260&h=260&q=login%20photo&ved=2ahUKEwj08v7mpvKBAxXwsCcCHUC3D4sQMyg1egUIARDFAQ"
    },
    phone:{
        type:String,
        // required:[true,"please add a phone number"],
        default : ""
    },
    bio:{
        type:String,
        maxLength:[250,"bio must be less than 250 character"],
        default : ""
    },
    sentences:[String]
    
},{
    timestamp:true
});

userSchema.pre("save" ,async function (next) {
    if (!this.isModified("password")) {
        return next()
    }

    const salt =await bcrypt.genSalt(10)
    const hashedPassword= await bcrypt.hashSync(this.password,salt)//change to bcrypt hash
    this.password = hashedPassword
})


module.exports = mongoose.model('User', userSchema);
