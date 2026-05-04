/**
 * Verify Cloudinary Credentials
 * Run this script to check if Cloudinary is properly configured
 * Usage: node server/verify_cloudinary_creds.js
 */

require('dotenv').config();
const cloudinary = require('cloudinary').v2;

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

console.log('\n' + '='.repeat(60));
log('CLOUDINARY CREDENTIALS VERIFICATION', 'cyan');
console.log('='.repeat(60) + '\n');

// Check environment variables
log('1. Environment Variables Check:', 'blue');
console.log('-'.repeat(60));

const requiredVars = ['CLOUD_NAME', 'API_KEY', 'API_SECRET'];
let allVarsPresent = true;

requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        const masked = varName === 'API_SECRET' 
            ? value.substring(0, 5) + '*'.repeat(Math.max(0, value.length - 5))
            : varName === 'API_KEY'
            ? value.substring(0, 5) + '*'.repeat(Math.max(0, value.length - 5))
            : value;
        log(`✓ ${varName}: ${masked}`, 'green');
    } else {
        log(`✗ ${varName}: NOT SET`, 'red');
        allVarsPresent = false;
    }
});

if (!allVarsPresent) {
    log('\n⚠️  Missing environment variables!', 'red');
    log('Please add the following to your .env file:', 'yellow');
    log('  CLOUD_NAME=your_cloud_name', 'yellow');
    log('  API_KEY=your_api_key', 'yellow');
    log('  API_SECRET=your_api_secret', 'yellow');
    process.exit(1);
}

console.log();

// Configure Cloudinary
log('2. Configuring Cloudinary:', 'blue');
console.log('-'.repeat(60));

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

// Test configuration
log('3. Testing Cloudinary Configuration:', 'blue');
console.log('-'.repeat(60));

const config = cloudinary.config();
log(`✓ Cloud Name: ${config.cloud_name}`, 'green');
log(`✓ API Key configured: ${config.api_key ? 'YES' : 'NO'}`, 'green');
log(`✓ API Secret configured: ${config.api_secret ? 'YES' : 'NO'}`, 'green');

console.log();

// Test URL generation
log('4. Testing URL Generation:', 'blue');
console.log('-'.repeat(60));

try {
    // Test unsigned URL
    const unsignedUrl = cloudinary.url('test/sample', {
        resource_type: 'raw',
        secure: true,
    });
    log(`✓ Unsigned URL generated:`, 'green');
    log(`  ${unsignedUrl}`, 'cyan');

    // Test signed URL
    const signedUrl = cloudinary.url('test/sample', {
        resource_type: 'raw',
        secure: true,
        sign_url: true,
    });
    log(`\n✓ Signed URL generated:`, 'green');
    log(`  ${signedUrl.substring(0, 100)}...`, 'cyan');

} catch (error) {
    log(`✗ Error generating URLs: ${error.message}`, 'red');
    process.exit(1);
}

console.log();

// Test API connectivity
log('5. Testing API Connectivity:', 'blue');
console.log('-'.repeat(60));

cloudinary.api.resources({ max_results: 1 })
    .then(result => {
        log('✓ Connected to Cloudinary API successfully!', 'green');
        log(`✓ Total resources in account: ${result.total_count}`, 'green');
        console.log();
        log('SUCCESS: Cloudinary is properly configured!', 'green');
        process.exit(0);
    })
    .catch(error => {
        log(`✗ API Connection Error: ${error.message}`, 'red');
        log('\nPossible causes:', 'yellow');
        log('  1. Invalid API_KEY or API_SECRET', 'yellow');
        log('  2. Invalid CLOUD_NAME', 'yellow');
        log('  3. Cloudinary account not active', 'yellow');
        log('  4. Network connectivity issues', 'yellow');
        console.log();
        log('Please verify your credentials and try again.', 'yellow');
        process.exit(1);
    });
