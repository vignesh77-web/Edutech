const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

//auth
exports.auth = async (req, res, next) => {
    try {
        console.log("[AUTH] BEFORE TOKEN EXTRACTION");
        console.log("[AUTH] Authorization Header:", req.header("Authorization"));
        console.log("[AUTH] JWT_SECRET (first 4):", process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 4) : "MISSING");
        
        //extract token from multiple sources
        // Priority: Authorization header > request query > request body > cookies
        const token = req.header("Authorization") && req.header("Authorization").replace("Bearer ", "")
            || req.query.token
            || req.body.token
            || req.cookies.token;

        console.log("[AUTH] TOKEN EXTRACTED:", token ? (token.substring(0, 10) + "...") : "NO TOKEN FOUND");

        //if token missing, then return response
        if (!token) {
            console.log("[AUTH] ERROR: Token is missing");
            return res.status(401).json({
                success: false,
                message: 'Token is missing',
            });
        }

        //verify the token
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log("[AUTH] DECODED TOKEN:", {
                email: decode.email,
                id: decode.id,
                accountType: decode.accountType,
                iat: decode.iat,
                exp: decode.exp
            });
            
            // Attach decoded token to request for downstream handlers
            req.user = decode;
            next();
        }
        catch (err) {
            //verification - issue
            console.log("[AUTH] TOKEN VERIFICATION FAILED:", err.message);
            return res.status(401).json({
                success: false,
                message: `token is invalid: ${err.message}`,
            });
        }

    }
    catch (error) {
        console.log("[AUTH] MIDDLEWARE ERROR:", error.message);
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
