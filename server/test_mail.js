const mailSender = require("./utils/mailSender");
require("dotenv").config();

async function testMail() {
    try {
        console.log("Attempting to send email to:", process.env.MAIL_USER);
        const response = await mailSender(
            process.env.MAIL_USER,
            "Test Email from Debugger",
            "<h1>This is a test email to verify configuration.</h1>"
        );
        console.log("Email sent successfully:", response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

testMail();
