#!/usr/bin/env node

/**
 * Environment Configuration Validator
 * 
 * Checks for required environment variables and provides
 * helpful error messages for missing configurations.
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const envPath = path.join(__dirname, ".env");

log("\n" + "=".repeat(70), "cyan");
log("ENVIRONMENT CONFIGURATION VALIDATOR", "cyan");
log("=".repeat(70) + "\n", "cyan");

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  log("✗ .env file not found at: " + envPath, "red");
  log("\nPlease create a .env file in the server directory with the following:", "yellow");
  log("", "blue");
  log("## Database", "blue");
  log("MONGODB_URL=", "blue");
  log("", "blue");
  log("## Cloudinary (for PDF/Media uploads)", "blue");
  log("CLOUD_NAME=", "blue");
  log("API_KEY=", "blue");
  log("API_SECRET=", "blue");
  log("", "blue");
  log("## JWT", "blue");
  log("JWT_SECRET=", "blue");
  log("JWT_EXPIRY=", "blue");
  log("", "blue");
  log("## Razorpay (for payments)", "blue");
  log("RAZORPAY_KEY_ID=", "blue");
  log("RAZORPAY_KEY_SECRET=", "blue");
  log("", "blue");
  log("## Email (for notifications)", "blue");
  log("MAIL_USER=", "blue");
  log("MAIL_PASS=", "blue");
  log("", "blue");
  log("## Server", "blue");
  log("PORT=4000", "blue");
  log("NODE_ENV=development", "blue");
  log("", "blue");
  process.exit(1);
}

log("✓ .env file found\n", "green");

const requiredVars = {
  // Database
  MONGODB_URL: "MongoDB connection string",
  
  // Cloudinary
  CLOUD_NAME: "Cloudinary cloud name",
  API_KEY: "Cloudinary API key",
  API_SECRET: "Cloudinary API secret",
  
  // JWT
  JWT_SECRET: "JWT signing secret (should be long and random)",
  JWT_EXPIRY: "JWT expiry time (e.g., '2d')",
  
  // Razorpay
  RAZORPAY_KEY_ID: "Razorpay key ID for payments",
  RAZORPAY_KEY_SECRET: "Razorpay key secret for payments",
  
  // Email
  MAIL_USER: "Email address for sending notifications",
  MAIL_PASS: "Email password or app-specific password",
  
  // Server
  PORT: "Server port (default: 4000)",
  NODE_ENV: "Environment mode (development/production)",
};

log("CHECKING REQUIRED VARIABLES:", "cyan");
log("=".repeat(70) + "\n", "cyan");

let missingVars = [];
let warnings = [];

Object.entries(requiredVars).forEach(([varName, description]) => {
  const value = process.env[varName];
  
  if (value) {
    // Mask sensitive values
    let displayValue = value;
    if (["API_KEY", "API_SECRET", "JWT_SECRET", "RAZORPAY_KEY_SECRET", "MAIL_PASS"].includes(varName)) {
      displayValue = value.substring(0, 4) + "****" + (value.length > 8 ? "(" + value.length + " chars)" : "");
    }
    
    log(`✓ ${varName}`, "green");
    log(`  └─ ${displayValue}`, "blue");
  } else {
    log(`✗ ${varName}`, "red");
    log(`  └─ ${description}`, "yellow");
    missingVars.push({ name: varName, description });
  }
});

if (missingVars.length > 0) {
  log("\n" + "=".repeat(70), "red");
  log("MISSING VARIABLES", "red");
  log("=".repeat(70) + "\n", "red");
  
  log("The following environment variables are not set:\n", "yellow");
  
  missingVars.forEach((item, index) => {
    log(`${index + 1}. ${item.name}`, "cyan");
    log(`   → ${item.description}\n`, "yellow");
  });
  
  log("Please add these to your .env file and try again.", "yellow");
  process.exit(1);
}

// Additional validations
log("\n" + "=".repeat(70), "cyan");
log("ADDITIONAL VALIDATIONS", "cyan");
log("=".repeat(70) + "\n", "cyan");

// Check JWT_SECRET length
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  log("⚠ JWT_SECRET is too short (< 32 characters)", "yellow");
  log("  → Recommendation: Use a longer, random string for security\n", "yellow");
  warnings.push("Short JWT_SECRET");
}

// Check MONGODB_URL format
if (process.env.MONGODB_URL && !process.env.MONGODB_URL.includes("mongodb")) {
  log("⚠ MONGODB_URL doesn't look like a valid MongoDB connection string", "yellow");
  log("  → Expected format: mongodb+srv://user:pass@host/dbname?...\n", "yellow");
  warnings.push("Invalid MONGODB_URL format");
}

// Check email format
if (process.env.MAIL_USER && !process.env.MAIL_USER.includes("@")) {
  log("⚠ MAIL_USER doesn't look like a valid email address", "yellow");
  log("  → Example: your-email@gmail.com\n", "yellow");
  warnings.push("Invalid MAIL_USER format");
}

// Summary
log("=" .repeat(70), "cyan");
if (warnings.length === 0) {
  log("✓ ALL CHECKS PASSED - YOUR ENVIRONMENT IS READY!", "green");
} else {
  log(`⚠ Configuration OK with ${warnings.length} warning(s)`, "yellow");
}
log("=" .repeat(70) + "\n", "cyan");

log("QUICK START GUIDE:\n", "cyan");
log("1. Start the server:", "blue");
log("   cd server && npm run dev\n", "yellow");
log("2. In another terminal, start the frontend:", "blue");
log("   npm run dev\n", "yellow");
log("3. Visit http://localhost:3000\n", "yellow");

log("PDF DOWNLOAD WORKFLOW:", "cyan");
log("1. Instructor uploads PDF resource to course", "blue");
log("2. PDF URL is stored in MongoDB", "blue");
log("3. Student visits course and clicks 'Download PDF'", "blue");
log("4. Frontend sends request to /api/v1/course/download-resource", "blue");
log("5. Backend validates JWT token and generates signed Cloudinary URL", "blue");
log("6. Browser redirects to Cloudinary and downloads PDF\n", "blue");

log("If PDFs aren't downloading:", "cyan");
log("• Check MongoDB connection: MONGODB_URL is valid", "yellow");
log("• Check Cloudinary config: CLOUD_NAME, API_KEY, API_SECRET", "yellow");
log("• Check JWT: JWT_SECRET is set and long (32+ chars)", "yellow");
log("• Run diagnostic: node server/verify_pdf_setup.js\n", "yellow");

process.exit(0);
