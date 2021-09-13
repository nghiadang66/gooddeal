const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASSWORD,
    },
});

// Allow less secure apps to access account
// Change tag a for front-end
module.exports.sendConfirmationEmail = (name, email, email_code) => {
    console.log('---SEND EMAIL---');
    transport.sendMail({
        from: process.env.ADMIN_EMAIL,
        to: email,
        subject: "GoodDeal Ecommerce - Verify your email address",
        html: `<div>
                <h2>GOODDEAL</h2>
                <h1>Verify your email address</h1>
                <p>Hi ${name},</p>
                <p>Thank you for registration.</p>
                <p>To get access to your account please verify your email address by clicking the link below.</p>
                <a href=http://localhost:${process.env.PORT}/api/auth/confirm/${email_code}> Click here</a>
          </div>`,
    }).catch(err => console.log(err));
};