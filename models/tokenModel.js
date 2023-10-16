const mongoose = require('mongoose'); // Erase if already required

var tokenSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    token:{
        type:String,
        required:true,
    },
    createAt:{
        type: Date,
        required:true
    },
    expiresAt:{
        type:String,
        required:true,
    },
});

//Export the model
module.exports = mongoose.model('Token', tokenSchema);