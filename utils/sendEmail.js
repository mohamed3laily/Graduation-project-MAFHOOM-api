const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

const sendEmail = asyncHandler(async (option) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.Email_USER,
            pass: process.env.Email_PASSWORD,
        },
    });

    // define email options
    const emailOption ={
        from: '"SignLanguage_Project " <abc@gmail.com>', // sender address
        to: option.email, // list of receivers
        subject: option.subject, // Subject line
        message: option.message, // plain text body
    };

    await transporter.sendMail(emailOption);

//   // send mail with defined transport object
//   let info = await transporter.sendMail({
//     from: '"inventory_Api " <abc@gmail.com>', // sender address
//     to: data.to, // list of receivers
//     subject: data.subject, // Subject line
//     text: data.text, // plain text body
//     html: data.htm, // html body
//   });

//   console.log("Message sent: %s", info.messageId);
//   // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
});

module.exports = sendEmail;
