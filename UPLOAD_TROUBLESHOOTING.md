# Video and PDF Upload Troubleshooting Guide

## Issues Fixed

### Backend Issues (Server)
1. ✅ **File validation** - Now checks if files exist before accessing
2. ✅ **Error logging** - Added console logs to track upload progress
3. ✅ **Individual error handling** - Separate try-catch for video, resources, and captions
4. ✅ **Better error messages** - More descriptive error responses to frontend

### Frontend Issues (Client)
1. ✅ **Missing header** - Added `Content-Type: multipart/form-data` to API calls
2. ✅ **Form validation** - Now validates that video is selected before submission
3. ✅ **Error display** - Better error messages shown to user via toast notifications
4. ✅ **FormData logging** - Now logs what's being sent for debugging

## Quick Verification Steps

### Step 1: Check Environment Variables
Make sure your `.env` file in the server directory contains:
```
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
FOLDER_NAME=edtech_video  # or whatever folder name you use
```

### Step 2: Test Video Upload
1. Go to course builder
2. Add a section
3. Add a lecture to the section
4. **Important**: Select a video file (MP4 format)
5. Fill in title and description
6. Click "Save"

### Step 3: Monitor Server Logs
When you click save, you should see in your server console:
```
Uploading video file: your_video_name.mp4
Video uploaded successfully: {...cloudinary response...}
```

If you see an error, check:
- Is the file actually being selected? (Check browser console)
- Is the file an MP4? (Check Upload.jsx - it only accepts .mp4)
- Is Cloudinary configured correctly? (Check CLOUD_NAME, API_KEY, API_SECRET)

### Step 4: Check Browser Network Tab
1. Open Developer Tools (F12)
2. Go to Network tab
3. Try uploading a video
4. Look for the `POST /api/v1/course/addSubSection` request
5. Check the Request tab to see if the file is being sent
6. Check the Response to see the error message (if any)

### Step 5: Check FormData Contents
Open browser console and look for the message:
```
FormData contents:
sectionId: [id]
title: [title]
description: [description]
video: [filename.mp4]
```

If video shows `undefined` or `null`, the file wasn't selected properly.

## Common Issues and Solutions

### Issue 1: "All Fields are Required" Error
**Cause**: Video file not being sent or validated
**Solutions**:
1. Ensure you clicked on the Upload area and selected a file
2. Make sure file is MP4 format
3. Check browser console for any JavaScript errors
4. Clear browser cache and try again

### Issue 2: "Video uploaded successfully" but lecture not created
**Cause**: Database error when creating SubSection after upload
**Solutions**:
1. Check server logs for the full error message
2. Verify section ID is correct
3. Ensure MongoDB is running and connected
4. Check disk space if using local storage

### Issue 3: Request hangs or times out
**Cause**: File size too large or network issue
**Solutions**:
1. Ensure video file is not too large (Cloudinary limit: 2GB, but recommend < 500MB for faster upload)
2. Check internet connection
3. Check if Cloudinary API is accessible from your server
4. Increase timeout in axios if needed

### Issue 4: "Signature mismatch" or "Invalid credentials" from Cloudinary
**Cause**: Wrong or missing Cloudinary credentials
**Solutions**:
1. Go to your Cloudinary account and get API credentials
2. Update `.env` file with correct CLOUD_NAME, API_KEY, API_SECRET
3. Restart the server: `npm start`
4. Test again

### Issue 5: File uploads but doesn't show in course view
**Cause**: This was the previous issue - now fixed!
**Solution**: Update your code with the latest fixes from this troubleshooting guide

## PDF Upload Process

### For Resources (PDF):
1. When adding/editing a lecture
2. In "Attach Resource" field, select a PDF file
3. File will be uploaded along with the video
4. For edit mode: uploading a new resource adds it to existing ones (doesn't replace)

### For Captions:
1. When adding/editing a lecture
2. In "Video Captions/Subtitles" field, select .vtt or .srt file
3. For edit mode: uploading a new caption will replace the existing one

## Debugging Tips

### Enable Detailed Logging
In `server/controllers/Subsection.js`, logs are already added. Open server console and wait for upload progress messages.

### Test with Postman
1. Create a POST request to `http://localhost:4000/api/v1/course/addSubSection`
2. Set headers: `Authorization: Bearer YOUR_TOKEN`
3. Go to Body tab, select "form-data"
4. Add fields:
   - `sectionId`: [copy from your database or UI]
   - `title`: Test Lecture
   - `description`: Test Description
   - `video`: [select your MP4 file]
5. Send and check response

### Check Cloudinary Dashboard
1. Log in to Cloudinary
2. Go to Media Library
3. Look for uploaded files in the folder you specified
4. This confirms if the file reached Cloudinary

## Performance Tips

1. **Compress videos before upload** - Use tools like HandBrake
2. **Use lower resolution** - 1080p instead of 4K when possible
3. **Optimal format**: MP4 with H.264 codec
4. **Upload during off-peak hours** if possible

## Still Having Issues?

1. Check all server logs (both console and any log files)
2. Check browser console for JavaScript errors
3. Verify all environment variables are set
4. Check Cloudinary credentials and account status
5. Try uploading a small test file first
6. Check firewall/network settings if upload fails consistently
