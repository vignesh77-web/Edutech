const Course = require("../models/Course")
const Category = require("../models/Category")
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const User = require("../models/User")
const { uploadImageToCloudinary } = require("../utils/imageUploader")
const CourseProgress = require("../models/CourseProgress")
const { convertSecondsToDuration } = require("../utils/secToDuration")
// Function to create a new course
exports.createCourse = async (req, res) => {
  try {
    // Get user ID from request object
    const userId = req.user.id

    // Get all required fields from request body
    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag: _tag,
      category,
      status,
      instructions: _instructions,
    } = req.body
    // Get thumbnail image from request files
    const thumbnail = req.files.thumbnailImage

    // Convert the tag and instructions from stringified Array to Array
    const tag = JSON.parse(_tag)
    const instructions = JSON.parse(_instructions)

    console.log("tag", tag)
    console.log("instructions", instructions)

    // Check if any of the required fields are missing
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag.length ||
      !thumbnail ||
      !category ||
      !instructions.length
    ) {
      return res.status(400).json({
        success: false,
        message: "All Fields are Mandatory",
      })
    }
    if (!status || status === undefined) {
      status = "Draft"
    }
    // Check if the user is an instructor
    const instructorDetails = await User.findById(userId, {
      accountType: "Instructor",
    })

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor Details Not Found",
      })
    }

    // Check if the tag given is valid
    const categoryDetails = await Category.findById(category)
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category Details Not Found",
      })
    }
    // Upload the Thumbnail to Cloudinary
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    )
    console.log(thumbnailImage)
    // Create a new course with the given details
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn: whatYouWillLearn,
      price,
      tag,
      category: categoryDetails._id,
      thumbnail: thumbnailImage.secure_url,
      status: status,
      instructions,
    })

    // Add the new course to the User Schema of the Instructor
    await User.findByIdAndUpdate(
      {
        _id: instructorDetails._id,
      },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    )
    // Add the new course to the Categories
    const categoryDetails2 = await Category.findByIdAndUpdate(
      { _id: category },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    )
    console.log("HEREEEEEEEE", categoryDetails2)
    // Return the new course and a success message
    res.status(200).json({
      success: true,
      data: newCourse,
      message: "Course Created Successfully",
    })
  } catch (error) {
    // Handle any errors that occur during the creation of the course
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message,
    })
  }
}
// Edit Course Details
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = req.user.id
    const updates = req.body
    
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ 
        success: false,
        error: "Course not found" 
      })
    }

    // Verify instructor owns this course
    if (course.instructor.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this course"
      })
    }

    // Whitelist the fields that can be updated
    const allowedFields = [
      'courseName',
      'courseDescription',
      'price',
      'tag',
      'instructions',
      'whatYouWillLearn',
      'category',
      'status'
    ]

    // Update thumbnail if provided
    if (req.files && req.files.thumbnailImage) {
      try {
        console.log("Updating thumbnail image")
        const thumbnail = req.files.thumbnailImage
        const thumbnailImage = await uploadImageToCloudinary(
          thumbnail,
          process.env.FOLDER_NAME
        )
        course.thumbnail = thumbnailImage.secure_url
        console.log("Thumbnail updated successfully")
      } catch (error) {
        console.error("Error uploading thumbnail:", error)
        // Continue without thumbnail update if it fails
      }
    }

    // Update only the whitelisted fields from the request body
    let hasChanges = false
    for (const key of allowedFields) {
      if (updates.hasOwnProperty(key) && updates[key] !== undefined) {
        try {
          if (key === "tag" || key === "instructions") {
            // Parse JSON arrays
            course[key] = JSON.parse(updates[key])
            console.log(`Updated ${key}:`, course[key])
            hasChanges = true
          } else if (key === "category") {
            // Ensure category is a valid ObjectId
            course[key] = updates[key]
            console.log(`Updated ${key}:`, course[key])
            hasChanges = true
          } else {
            course[key] = updates[key]
            console.log(`Updated ${key}:`, updates[key])
            hasChanges = true
          }
        } catch (error) {
          console.error(`Error updating ${key}:`, error)
          return res.status(400).json({
            success: false,
            message: `Error updating ${key}: ${error.message}`
          })
        }
      }
    }

    if (!hasChanges && !req.files) {
      return res.status(400).json({
        success: false,
        message: "No changes to update"
      })
    }

    // Save the updated course
    await course.save()
    console.log("Course saved successfully with ID:", courseId)

    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "title description timeDuration videoUrl resources captionUrl subSectionType questions",
        },
      })
      .exec()

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}
// Get Course List
exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      { status: "Published" },
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
      }
    )
      .populate("instructor")
      .exec()

    return res.status(200).json({
      success: true,
      data: allCourses,
    })
  } catch (error) {
    console.log(error)
    return res.status(404).json({
      success: false,
      message: `Can't Fetch Course Data`,
      error: error.message,
    })
  }
}
// Get One Single Course Details
// exports.getCourseDetails = async (req, res) => {
//   try {
//     const { courseId } = req.body
//     const courseDetails = await Course.findOne({
//       _id: courseId,
//     })
//       .populate({
//         path: "instructor",
//         populate: {
//           path: "additionalDetails",
//         },
//       })
//       .populate("category")
//       .populate("ratingAndReviews")
//       .populate({
//         path: "courseContent",
//         populate: {
//           path: "subSection",
//         },
//       })
//       .exec()
//     // console.log(
//     //   "###################################### course details : ",
//     //   courseDetails,
//     //   courseId
//     // );
//     if (!courseDetails || !courseDetails.length) {
//       return res.status(400).json({
//         success: false,
//         message: `Could not find course with id: ${courseId}`,
//       })
//     }

//     if (courseDetails.status === "Draft") {
//       return res.status(403).json({
//         success: false,
//         message: `Accessing a draft course is forbidden`,
//       })
//     }

//     return res.status(200).json({
//       success: true,
//       data: courseDetails,
//     })
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     })
//   }
// }
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "title description timeDuration resources captionUrl subSectionType questions",
        },
      })
      .exec()

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    // Recommendations (Algorithmic: Frequently Bought Together / Similar)
    const similarCourses = await Course.find({
      category: courseDetails.category._id,
      _id: { $ne: courseId },
      status: "Published",
    })
    .sort({ "studentsEnrolled": -1 }) // Sort by popularity
    .limit(3)
    .populate("instructor")
    .populate("ratingAndReviews")
    .exec()

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        similarCourses,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
exports.getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = req.user.id
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "title description timeDuration videoUrl resources captionUrl subSectionType questions",
        },
      })
      .exec()

    let courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })

    console.log("courseProgressCount : ", courseProgressCount)

    // Check if course access has expired
    const user = await User.findById(userId);
    const userCourse = user.courses.find(c => (c.courseId?.toString() || c.toString()) === courseId);

    if (userCourse && userCourse.expiresAt && new Date(userCourse.expiresAt) < new Date()) {
      return res.status(403).json({
        success: false,
        message: "Course membership has expired. Please renew to access content.",
        isExpired: true,
      });
    }

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos
          ? courseProgressCount?.completedVideos
          : [],
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user or request body
    const instructorId = req.user.id

    // Find all courses belonging to the instructor
    const instructorCourses = await Course.find({
      instructor: instructorId,
    }).sort({ createdAt: -1 })

    // Return the instructor's courses
    res.status(200).json({
      success: true,
      data: instructorCourses,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    })
  }
}
// Delete the Course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body

    // Find the course
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Unenroll students from the course
    const studentsEnrolled = course?.studentsEnrolled
    for (const studentId of studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      })
    }

    // Delete sections and sub-sections
    const courseSections = course?.courseContent
    for (const sectionId of courseSections) {
      // Delete sub-sections of the section
      const section = await Section.findById(sectionId)
      if (section) {
        const subSections = section?.subSection
        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId)
        }
      }

      // Delete the section
      await Section.findByIdAndDelete(sectionId)
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId)

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

exports.submitForReview = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    if (course.instructor.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    course.status = "Under Review";
    await course.save();

    return res.status(200).json({
      success: true,
      message: "Course submitted for review",
      data: course,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

exports.approveCourse = async (req, res) => {
  try {
    const { courseId, approve } = req.body; // approve: boolean

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    course.status = approve ? "Published" : "Draft";
    await course.save();

    return res.status(200).json({
      success: true,
      message: approve ? "Course Published" : "Course Rejected (returned to Draft)",
      data: course,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

exports.addCoInstructor = async (req, res) => {
  try {
    const { courseId, coInstructorEmail, sharePercentage } = req.body;
    const userId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (course.instructor.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Only the primary instructor can add co-instructors" });
    }

    const coInstructor = await User.findOne({ email: coInstructorEmail, accountType: "Instructor" });
    if (!coInstructor) {
      return res.status(404).json({ success: false, message: "Co-instructor not found or not an instructor" });
    }

    // Check if total percentage exceeds 100
    const currentShares = course.coInstructors.reduce((acc, curr) => acc + curr.sharePercentage, 0);
    if (currentShares + sharePercentage > 100) {
      return res.status(400).json({ success: false, message: "Total revenue share cannot exceed 100%" });
    }

    course.coInstructors.push({ user: coInstructor._id, sharePercentage });
    await course.save();

    // Add course to co-instructor's courses array
    await User.findByIdAndUpdate(coInstructor._id, { $push: { courses: courseId } });

    return res.status(200).json({
      success: true,
      message: "Co-instructor added successfully",
      course,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}