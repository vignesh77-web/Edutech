const Razorpay = require("razorpay");

console.log("RAZORPAY_KEY:", process.env.RAZORPAY_KEY ? "LOADED" : "MISSING");
console.log("RAZORPAY_SECRET:", process.env.RAZORPAY_SECRET ? "LOADED" : "MISSING");

exports.instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
});