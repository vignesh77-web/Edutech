# Course Edit Troubleshooting Checklist

## Quick Test: Does Course Edit Work?

### For Instructors:
1. **Test 1: Edit Course Title**
   - [ ] Go to Instructor Dashboard
   - [ ] Click "Edit" on a course
   - [ ] Change the title
   - [ ] Click "Save Changes"
   - [ ] See success toast message
   - [ ] Go back to dashboard
   - [ ] Verify course title changed in the list

2. **Test 2: Check Server Logs**
   - [ ] Open server terminal
   - [ ] Look for message: `Course saved successfully with ID: `
   - [ ] Look for: `Updated courseName: [new title]`
   - [ ] No error messages should appear

3. **Test 3: Edit Price**
   - [ ] Edit same course again
   - [ ] Change the price
   - [ ] Save
   - [ ] Verify in dashboard

### For Students:
1. **Test 1: View Enrolled Course**
   - [ ] Login as student
   - [ ] Go to "My Learning" (enrolled courses)
   - [ ] Click on the course
   - [ ] Verify course title shows the NEW title (not old)
   - [ ] Check course description is updated

2. **Test 2: Hard Refresh**
   - [ ] If old title shows, hard refresh (Ctrl+F5 or Cmd+Shift+R)
   - [ ] Verify new title appears

3. **Test 3: View Course in Catalog**
   - [ ] Go to Courses / Catalog
   - [ ] Search for the course
   - [ ] Click course preview
   - [ ] Verify updated details show

## If Changes Don't Show

### Browser Issues:
- [ ] Clear browser cache: Settings > Clear browsing data > All time > Cookies and cache
- [ ] Try in incognito/private mode
- [ ] Try different browser
- [ ] Restart browser

### Application Issues:
- [ ] Check browser console (F12 > Console tab) for red errors
- [ ] Check Network tab to see if API responded with 200 OK
- [ ] Restart the application (restart server and frontend dev server)

### Database Issues:
- [ ] Connect to MongoDB and verify the course document was updated
- [ ] Check MongoDB timestamps to see when document was last modified
- [ ] Verify all fields are present in the document

## Expected Behavior

### What Should Work:
✅ Changing course title
✅ Changing course description
✅ Changing course price
✅ Changing course category
✅ Changing course tags
✅ Changing course learning outcomes
✅ Changing course requirements
✅ Changing course thumbnail

### What Needs Different Process:
❌ Adding/removing lectures - Use Course Builder (Section/SubSection operations)
❌ Publishing/unpublishing - Use PublishCourse component
❌ Changing instructor - Not allowed (security)
❌ Removing students - Not allowed here (use enrollment system)

## Server Log Messages

### Success Scenario:
```
Updating thumbnail image
Thumbnail updated successfully
Updated courseName: JavaScript Fundamentals Pro
Updated courseDescription: Learn advanced JS
Updated price: 4999
Updated category: 64abcd1234567890
Updated tag: ["javascript","advanced","web"]
Course saved successfully with ID: 64xyz9876543210
```

### Error Scenarios:

**Instructor not authorized:**
```
You are not authorized to edit this course
```

**Course not found:**
```
Course not found
```

**Invalid JSON in tags:**
```
Error updating tag: Unexpected token in JSON at position 0
```

**MongoDB connection error:**
```
Internal server error
```

## API Debugging

### Using Browser DevTools:
1. Open DevTools (F12)
2. Go to Network tab
3. Edit course
4. Look for POST request to `/api/v1/course/editCourse`
5. Click on it
6. Check Response tab:
   - Should see `"success": true`
   - Should see updated course data in `data` field
   - Should see course content and sections

### Using Postman:
```
POST /api/v1/course/editCourse
Headers:
  Authorization: Bearer [YOUR_TOKEN]
  Content-Type: multipart/form-data

Body (form-data):
  courseId: [course_id]
  courseName: JavaScript Advanced
  courseDescription: Updated description
  price: 4999
  category: [category_id]
  tag: ["javascript","advanced"]
  instructions: ["Requirement 1","Requirement 2"]
```

## Common Issues and Solutions

### Issue 1: Edits Save But Don't Show for Students
**Cause**: Browser cache or Redux state not updated
**Solution**: 
- Students need to hard refresh (Ctrl+F5)
- Instructor needs to reload page to see updated Redux state

### Issue 2: Getting "Not Authorized" Error
**Cause**: Trying to edit someone else's course
**Solution**: 
- Only course instructor can edit
- Verify you're logged in as the course creator

### Issue 3: Changes Save but Keep Getting Reverted
**Cause**: Multiple edits happening simultaneously
**Solution**:
- Only one person edit at a time
- Save completely before closing

### Issue 4: Thumbnail Doesn't Update
**Cause**: Image upload failure to Cloudinary
**Solution**:
- Check Cloudinary credentials in .env
- Verify image file is valid (JPG, PNG)
- Check server logs for upload error
- Can still edit other fields even if image fails

### Issue 5: Price Shows as NaN or 0
**Cause**: Price being sent as string instead of number
**Solution**:
- Ensure price field is treated as number
- Server should validate and convert price to number

## Performance Expectations

- Edit save should take 2-5 seconds
- If taking longer, might be image upload to Cloudinary
- Students should see changes within 1 minute of edit
- Published courses should cache minimally (refresh to see latest)

## Asking for Help

When reporting issues, provide:
1. What you tried to edit (title? price? category?)
2. Did you see success message?
3. Server log messages (full error if any)
4. Browser console errors (if any)
5. Network tab response from `/api/v1/course/editCourse`
6. Verified in MongoDB that document changed? (yes/no)
7. Which browser and version?
