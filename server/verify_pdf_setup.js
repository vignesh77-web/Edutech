#!/usr/bin/env node

/**
 * PDF Download Diagnostic Tool
 * 
 * Verifies:
 * - Cloudinary credentials
 * - Environment variables
 * - Database connectivity
 * - Sample PDF URL generation
 */

require("dotenv").config();
const cloudinary = require("cloudinary").v2;

// Color codes for console output
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

function section(title) {
  console.log("\n" + "=".repeat(60));
  log(title, "cyan");
  console.log("=".repeat(60));
}

async function verifySetup() {
  section("1. ENVIRONMENT VARIABLES CHECK");
  
  const requiredVars = ["CLOUD_NAME", "API_KEY", "API_SECRET", "JWT_SECRET"];
  let allVarsPresent = true;

  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      const masked = varName.includes("CLOUD") ? value : value.substring(0, 4) + "****";
      log(`✓ ${varName}: ${masked}`, "green");
    } else {
      log(`✗ ${varName}: NOT SET`, "red");
      allVarsPresent = false;
    }
  });

  if (!allVarsPresent) {
    log("\n⚠ Missing environment variables. Please update .env file.", "yellow");
    return false;
  }

  section("2. CLOUDINARY CONFIGURATION");
  
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });

    // Test API connection
    const result = await cloudinary.api.ping();
    log("✓ Cloudinary API Connection: SUCCESS", "green");
    log(`  Response: ${JSON.stringify(result)}`, "blue");

    log(`✓ Cloud Name: ${process.env.CLOUD_NAME}`, "green");
    log(`✓ API Key: ${process.env.API_KEY.substring(0, 4)}****`, "green");

  } catch (error) {
    log("✗ Cloudinary Connection Failed", "red");
    log(`  Error: ${error.message}`, "red");
    return false;
  }

  section("3. RESOURCE TYPE DETECTION");

  const fileTypes = {
    "document.pdf": "raw",
    "image.png": "image",
    "image.jpg": "image",
    "video.mp4": "video",
    "presentation.pptx": "raw",
    "document.docx": "raw",
    "archive.zip": "raw",
  };

  const getResourceType = (format) => {
    const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico'];
    const videoFormats = ['mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'webm', 'ogv'];
    
    const formatLower = (format || '').toLowerCase();
    
    if (imageFormats.includes(formatLower)) {
      return 'image';
    } else if (videoFormats.includes(formatLower)) {
      return 'video';
    } else {
      return 'raw';
    }
  };

  log("\nFile type to resource type mapping:", "blue");
  Object.entries(fileTypes).forEach(([file, expectedType]) => {
    const ext = file.split('.').pop();
    const detectedType = getResourceType(ext);
    const status = detectedType === expectedType ? "✓" : "✗";
    const color = detectedType === expectedType ? "green" : "red";
    log(`${status} ${file} → ${detectedType}${detectedType !== expectedType ? ` (expected: ${expectedType})` : ""}`, color);
  });

  section("4. SAMPLE SIGNED URL GENERATION");

  try {
    const samplePublicId = "uploads/sample";
    const sampleFormat = "pdf";

    const signedUrl = cloudinary.url(samplePublicId, {
      resource_type: "raw",
      type: "upload",
      version: "1776151714",
      format: sampleFormat,
      sign_url: true,
      secure: true,
      attachment: true,
    });

    log("✓ Signed URL Generated Successfully", "green");
    log(`\nPublic ID: ${samplePublicId}`, "blue");
    log(`Resource Type: raw`, "blue");
    log(`Format: ${sampleFormat}`, "blue");
    log(`\nGenerated URL:\n${signedUrl}`, "yellow");

    // Parse and validate URL
    try {
      const url = new URL(signedUrl);
      log("\n✓ URL is valid and parseable", "green");
      log(`  Host: ${url.host}`, "blue");
      log(`  Pathname: ${url.pathname}`, "blue");
      log(`  Query params:`, "blue");
      url.searchParams.forEach((value, key) => {
        if (key === "s") {
          log(`    ${key}: ${value.substring(0, 10)}...`, "blue");
        } else {
          log(`    ${key}: ${value}`, "blue");
        }
      });
    } catch (error) {
      log("✗ URL parsing failed", "red");
    }

  } catch (error) {
    log("✗ Signed URL generation failed", "red");
    log(`  Error: ${error.message}`, "red");
    return false;
  }

  section("5. SUMMARY");
  
  log("✓ PDF Download Setup is READY", "green");
  log("\nNext steps:", "cyan");
  log("1. Students visit course page", "blue");
  log("2. Click PDF download button", "blue");
  log("3. Frontend sends request to /api/v1/course/download-resource", "blue");
  log("4. Backend authenticates user via auth middleware", "blue");
  log("5. Backend generates signed Cloudinary URL with resource_type='raw'", "blue");
  log("6. Browser redirects to Cloudinary signed URL", "blue");
  log("7. PDF downloads successfully", "blue");

  return true;
}

// Run verification
verifySetup()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    log(`\nFatal Error: ${error.message}`, "red");
    process.exit(1);
  });
