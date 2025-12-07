const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,      // your Gmail address
        pass: process.env.EMAIL_PASS,  // your Gmail App Password (NOT your Gmail login password)
    },
});

const sendEmail = async ({ to, subject, text }) => {
    try {
        const info = await transporter.sendMail({
            from: `"Campus Tracker" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
        });

        console.log("Email sent:", info.messageId);
    } catch (err) {
        console.error("Email Sending Error:", err);
        throw err;
    }
};

module.exports = sendEmail;
