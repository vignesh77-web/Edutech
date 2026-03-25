const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

//auth
exports.auth = async (req, res, next) => {
    try {
        console.log("BEFORE TOKEN EXTRACTION");
        console.log("Authorization Header:", req.header("Authorization"));
        console.log("JWT_SECRET (first 4):", process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 4) : "MISSING");
        //extract token
        const token = req.cookies.token
            || req.body.token
            || (req.header("Authorization") && req.header("Authorization").replace("Bearer ", ""));

        console.log("TOKEN EXTRACTED:", token ? (token.substring(0, 10) + "...") : "NO");

        //if token missing, then return response
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token is missing',
            });
        }

        //verify the token
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log("DECODED TOKEN:", decode);
            req.user = decode;
        }
        catch (err) {
            //verification - issue
            console.log("TOKEN VERIFICATION FAILED:", err.message);
            return res.status(401).json({
                success: false,
                message: `token is invalid: ${err.message}`,
            });
        }
        next();
    }
    catch (error) {
        console.log("AUTH MIDDLEWARE ERROR:", error.message);
        return res.status(401).json({
            success: false,
            message: 'Something went wrong while validating the token',
        });
    }
}

//isStudent
exports.isStudent = async (req, res, next) => {
    try {
        console.log("USER ACCOUNT TYPE FROM TOKEN:", req.user?.accountType);
        if (req.user.accountType !== "Student") {
            return res.status(401).json({
                success: false,
                message: 'This is a protected route for Students only',
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'User role cannot be verified, please try again'
        })
    }
}


//isInstructor
exports.isInstructor = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: 'This is a protected route for Instructor only',
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'User role cannot be verified, please try again'
        })
    }
}


//isAdmin
exports.isAdmin = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: 'This is a protected route for Admin only',
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'User role cannot be verified, please try again'
        })
    }
}
