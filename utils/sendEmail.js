// const nodemailer = require("nodemailer");

// const sendEmail = async (subject, sent_from, send_to ,message ,replay_to)=> {
//     const transporter = nodemailer.createTransport({
//         host: "smtp.gmail.com",
//         port: 587,
//         secure: true,
//         auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS
//         },
//         tls:{
//             rejectUnauthorized : false
//         } 
//     });

//     const options = {
//         from: sent_from,
//         to: send_to, 
//         subject: subject,
//         html: message
//     }
//     // console.log("Message sent: %s", info.messageId);

//     transporter.sendMail(options , function(err , info) {
//         if (err) {
//             console.log(err);
//         }
//         else{
//             console.log(info);
//         }
//     })
// }


// module.exports = sendEmail



const nodemailer = require("nodemailer");
const asyncHandler = require('express-async-handler')

const sendEmail = asyncHandler(async(data,req,res)=>{
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.PASSWORD ,
        },
    });
    

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"inventory_Api " <abc@gmail.com>', // sender address
      to: data.to , // list of receivers
      subject: data.subject, // Subject line
      text: data.text, // plain text body
      html: data.htm , // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    
})


module.exports = sendEmail