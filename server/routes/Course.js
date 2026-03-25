// Import the required modules
const express = require("express")
const router = express.Router()

// Import the Controllers

// Course Controllers Import
const {
  createCourse,
  getAllCourses,
  getCourseDetails,
  getFullCourseDetails,
  editCourse,
  getInstructorCourses,
  deleteCourse,
} = require("../controllers/Course")


// Categories Controllers Import
const {
  showAllCategories,
  createCategory,
  categoryPageDetails,
} = require("../controllers/Category")

// Sections Controllers Import
const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/Section")

// Sub-Sections Controllers Import
const {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} = require("../controllers/Subsection")

// Rating Controllers Import
const {
  createRating,
  getAverageRating,
  getAllRating,
} = require("../controllers/RatingAndReview")

const {
  updateCourseProgress
} = require("../controllers/courseProgress");

// Importing Middlewares
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth")

// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************

// Courses can Only be Created by Instructors
router.post("/createCourse", auth, isInstructor, createCourse)
//Add a Section to a Course
router.post("/addSection", auth, isInstructor, createSection)
// Update a Section
router.post("/updateSection", auth, isInstructor, updateSection)
// Delete a Section
router.post("/deleteSection", auth, isInstructor, deleteSection)
// Edit Sub Section
router.post("/updateSubSection", auth, isInstructor, updateSubSection)
// Delete Sub Section
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection)
// Add a Sub Section to a Section
router.post("/addSubSection", auth, isInstructor, createSubSection)
// Get all Registered Courses
router.get("/getAllCourses", getAllCourses)
// Get Details for a Specific Courses
router.post("/getCourseDetails", getCourseDetails)
// Get Details for a Specific Courses
router.post("/getFullCourseDetails", auth, getFullCourseDetails)
// Edit Course routes
router.post("/editCourse", auth, isInstructor, editCourse)
// Get all Courses Under a Specific Instructor
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses)
// Delete a Course
router.delete("/deleteCourse", deleteCourse)

router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);

// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************
// Category can Only be Created by Admin
// TODO: Put IsAdmin Middleware here
router.post("/createCategory", auth, isAdmin, createCategory)
router.get("/showAllCategories", showAllCategories)
router.post("/getCategoryPageDetails", categoryPageDetails)

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
router.post("/createRating", auth, isStudent, createRating)
router.get("/getAverageRating", getAverageRating)
router.get("/getReviews", getAllRating)

const {
  createLiveClass,
  getInstructorLiveClasses,
  updateLiveClass,
  deleteLiveClass,
  getAllPublicLiveClasses,
} = require("../controllers/LiveClass");

// ********************************************************************************************************
//                                      Live Class Routes
// ********************************************************************************************************
router.post("/liveClass/create", auth, isInstructor, createLiveClass);
router.get("/liveClass/instructor", auth, isInstructor, getInstructorLiveClasses);
router.put("/liveClass/update", auth, isInstructor, updateLiveClass);
router.delete("/liveClass/delete", auth, isInstructor, deleteLiveClass);
router.get("/liveClass/public", getAllPublicLiveClasses);

const {
  createTestSeries,
  getInstructorTestSeries,
  updateTestSeries,
  deleteTestSeries,
  getAllPublicTestSeries,
  addTestToSeries,
  evaluateTest,
} = require("../controllers/TestSeries");

// ********************************************************************************************************
//                                      Test Series Routes
// ********************************************************************************************************
router.post("/testSeries/create", auth, isInstructor, createTestSeries);
router.get("/testSeries/instructor", auth, isInstructor, getInstructorTestSeries);
router.put("/testSeries/update", auth, isInstructor, updateTestSeries);
router.delete("/testSeries/delete", auth, isInstructor, deleteTestSeries);
router.get("/testSeries/public", getAllPublicTestSeries);
router.post("/testSeries/addTest", auth, isInstructor, addTestToSeries);
router.post("/testSeries/evaluate", auth, isStudent, evaluateTest);

module.exports = router