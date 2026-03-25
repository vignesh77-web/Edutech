const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
    try {
        let transporter = nodemailer?.createTransport({
            host: process.env.MAIL_HOST,
            port: parseInt(process.env.MAIL_PORT) || 587,
            secure: false, // true for 465, false for 587
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        })


        let info = await transporter?.sendMail({
            from: 'EduTech || Best E-Learning Platform',
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        })
        console.log(info);
        return info;
    }
    catch (error) {
        console.log(error.message);
    }
}


module.exports = mailSender;