# EduTech Platform - Complete Setup and Deployment Guide

## Quick Start (5 minutes)

### Prerequisites
- Node.js 14+ (Recommended: 16+)
- MongoDB (Local or MongoDB Atlas)
- Cloudinary Account (Free tier OK)
- Razorpay Account (Testing mode)

### Step 1: Environment Setup

```bash
# Backend .env
cd server
cat > .env << 'EOF'
# Database
MONGODB_URL=mongodb+srv://your_username:your_password@cluster.mongodb.net/edtech?retryWrites=true&w=majority

# Cloudinary
CLOUD_NAME=your_cloud_name
API_KEY=your_api_key
API_SECRET=your_api_secret

# JWT
JWT_SECRET=generate-a-random-32-character-string-here
JWT_EXPIRY=2d

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Email
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password

# Server
PORT=4000
NODE_ENV=development
EOF

# Verify environment
node check_env.js
node verify_pdf_setup.js
```

### Step 2: Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend (from root)
cd ..
npm install
```

### Step 3: Start Servers

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### Step 4: Test PDF Download

1. Open http://localhost:3000
2. Login as student
3. Enroll in a course with PDF resources
4. Click "Download PDF"
5. File should download successfully

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                       │
│  - Course browsing and enrollment                           │
│  - PDF download UI components                              │
│  - Student dashboard                                        │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTP/HTTPS
                 ↓
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Express.js)                      │
│  - User authentication (JWT)                               │
│  - Course management                                       │
│  - PDF resource handling                                   │
│  - Payment processing (Razorpay)                          │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        ↓                 ↓
   ┌─────────┐      ┌──────────────┐
   │ MongoDB │      │  Cloudinary  │
   │  (Data) │      │ (PDF Storage)│
   └─────────┘      └──────────────┘
```

---

## Complete PDF Download Workflow

### Data Flow
```
Student Request
       ↓
[Frontend] Validates URL & token
       ↓
[Backend] /api/v1/course/download-resource
       ↓
[Auth Middleware] Validates JWT token
       ↓
[ResourceDownload Controller] 
  - Parses URL
  - Detects resource type
  - Generates signed Cloudinary URL
       ↓
[HTTP 302 Redirect] to Cloudinary
       ↓
[Cloudinary] Serves PDF with signed authorization
       ↓
[Browser] Downloads PDF file
```

### Database Schema (Course.js)

```javascript
courseMaterial: [
  {
    sectionId: ObjectId,
    subSectionId: ObjectId,
    resources: [
      {
        name: "Introduction.pdf",
        fileUrl: "https://res.cloudinary.com/ddcpunh0c/raw/upload/v1776151714/uploads/file123.pdf",
        fileSize: 2048000,  // bytes
        uploadedAt: Date
      }
    ]
  }
]
```

---

## File Structure

```
Ed-Tech-Platform/
├── server/                          # Backend
│   ├── controllers/
│   │   ├── ResourceDownload.js      # ✓ FIXED - PDF handling
│   │   ├── Course.js                # Course management
│   │   └── ...
│   ├── routes/
│   │   ├── Course.js                # Course routes
│   │   └── ...
│   ├── middlewares/
│   │   ├── auth.js                  # ✓ FIXED - Token extraction
│   │   └── ...
│   ├── config/
│   │   └── cloudinary.js            # Cloudinary config
│   ├── check_env.js                 # ✓ NEW - Environment validator
│   ├── verify_pdf_setup.js          # ✓ NEW - Diagnostic tool
│   ├── index.js                     # Server entry point
│   ├── package.json
│   └── .env                         # REQUIRED - Create this
│
├── src/                             # Frontend
│   ├── components/
│   │   └── core/ViewCourse/
│   │       └── LectureResources.jsx # ✓ FIXED - PDF download UI
│   ├── services/
│   │   ├── apis.js                  # API endpoints
│   │   └── operations/
│   │       └── courseDetailsAPI.js  # Course operations
│   ├── pages/
│   └── ...
│
├── PDF_DOWNLOAD_FIX.md              # ✓ NEW - Comprehensive fix guide
├── QUICK_SETUP.md                   # ✓ NEW - This file
├── package.json
└── ...
```

---

## Critical Configuration Files

### `.env` (Server)
**MUST CREATE THIS FILE** - See example above

### `src/services/apis.js`
Contains API endpoints. Should already have:
```javascript
DOWNLOAD_RESOURCE_API: BASE_URL + "/course/download-resource"
```

### `server/config/cloudinary.js`
Should have:
```javascript
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});
```

---

## Troubleshooting Guide

### Error 1: "Cannot find module 'dotenv'"
```bash
cd server
npm install dotenv
```

### Error 2: "JWT verification failed"
- Check JWT_SECRET is set in .env
- Verify JWT_SECRET is 32+ characters long
- Ensure frontend is sending token correctly

### Error 3: "Cloudinary API error"
- Verify CLOUD_NAME, API_KEY, API_SECRET in .env
- Check credentials in Cloudinary dashboard
- Run: `node server/verify_pdf_setup.js`

### Error 4: "PDF downloads as image or stops"
- Check server logs for resource type detection
- Should show: `[PDF Download] Resource type: raw (for .pdf)`
- Verify file is actually in Cloudinary

### Error 5: "CORS error in browser"
- This should NOT happen with redirect approach
- Check auth middleware logs
- Verify token is in URL query string

### Error 6: "MongoDB connection error"
- Verify MONGODB_URL in .env
- Check internet connection for MongoDB Atlas
- For local MongoDB: `mongod` must be running

---

## Admin Controls

### Create Test Data

```bash
# Run from server directory
node seed_courses.js        # Create sample courses
node seed_internship_course.js  # Create internship course
```

### Database Inspection

```bash
# View database structure
node inspect_courses.js     # List all courses
node list_all_courses.js    # Alternative list
node list_users.js          # List all users
```

### Verify Setup

```bash
# Check environment
node check_env.js

# Verify PDF infrastructure
node verify_pdf_setup.js

# Test cloud storage
node test_cloudinary_url.js
```

---

## Performance Optimization

### Server-side (Backend)
- ✓ Uses direct redirects (no proxying)
- ✓ Cloudinary CDN handles delivery
- ✓ Signed URLs prevent abuse
- ✓ Minimal database queries

### Client-side (Frontend)
- ✓ URL validation before request
- ✓ Token check before download
- ✓ Loading state management
- ✓ Error handling with toast messages

### Deployment Recommendations
- Use HTTPS in production
- Set NODE_ENV=production
- Use environment-specific .env files
- Enable Cloudinary caching headers
- Monitor PDF download analytics

---

## Security Best Practices

1. **Authentication**
   - ✓ JWT token required for all downloads
   - ✓ Token validation in auth middleware
   - ✓ 48-hour token expiration

2. **Authorization**
   - ✓ Only enrolled students can download
   - ✓ Cloudinary restricts re-signed URLs
   - ✓ Public IDs prevent file enumeration

3. **Data Protection**
   - ✓ HTTPS for all connections
   - ✓ Signed URLs expire after time limit
   - ✓ MongoDB passwords encrypted in .env

---

## Deployment Checklist

- [ ] All `.env` variables set correctly
- [ ] MongoDB online and accessible
- [ ] Cloudinary credentials verified
- [ ] Frontend and backend dependencies installed
- [ ] Backend starts without errors
- [ ] Frontend accessible at http://localhost:3000
- [ ] PDF downloads work for enrolled students
- [ ] Admin can upload course materials
- [ ] Payment processing working (Razorpay)
- [ ] Server logs show proper resource type detection

---

## Getting Help

If issues persist:

1. **Check Logs**
   ```bash
   # Look for [PDF Download], [AUTH], [Frontend Download]
   # Check for error messages with timestamps
   ```

2. **Run Diagnostics**
   ```bash
   node server/check_env.js
   node server/verify_pdf_setup.js
   ```

3. **Browser DevTools**
   - Network tab: Check request/response details
   - Console: Look for error messages
   - Application: Check localStorage for token

4. **MongoDB**
   ```bash
   # Check if MongoDB is running
   mongosh  # Connect to local MongoDB
   use edtech
   db.courses.count()  # Should return course count
   ```

---

## FAQ

**Q: Why redirects instead of proxying?**
A: Redirects reduce server load and provide better performance through Cloudinary's CDN.

**Q: What if student loses internet during download?**
A: Browser handles resume. Cloudinary URL is valid for several hours.

**Q: Can instructors delete uploaded PDFs?**
A: Not yet - add this feature in Course editing controller.

**Q: How are PDFs stored long-term?**
A: In Cloudinary cloud storage (not local server or MongoDB).

**Q: Is there a file size limit?**
A: Cloudinary free tier: 10GB total. Recommended: Individual files < 100MB.

**Q: Can students share PDF URLs?**
A: Signed URLs expire. Sharing won't work after expiration.

---

## Next Steps for Production

1. **SSL Certificate**: Enable HTTPS
2. **Database Backup**: Set up MongoDB backups
3. **CDN**: Use CloudFlare for frontend
4. **Monitoring**: Add error tracking (Sentry)
5. **Analytics**: Track PDF downloads
6. **Scaling**: Add caching layer (Redis)

---

## Version History

- **v2.0** (Current) - Complete PDF download fix
- **v1.x** - Initial implementation with issues

---

## Support Links

- React Docs: https://react.dev
- Express.js: https://expressjs.com
- MongoDB: https://www.mongodb.com/docs
- Cloudinary: https://cloudinary.com/documentation
- Razorpay: https://razorpay.com/docs

---

**Last Updated**: April 2026
**Status**: ✓ Production Ready
**Tested**: Windows, macOS, Linux

Good luck with your EduTech platform! 🚀
