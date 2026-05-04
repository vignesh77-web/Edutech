const BASE_URL = process.env.REACT_APP_BASE_URL

// AUTH ENDPOINTS
export const endpoints = {
  SENDOTP_API: BASE_URL + "/auth/sendotp",
  SIGNUP_API: BASE_URL + "/auth/signup",
  LOGIN_API: BASE_URL + "/auth/login",
  RESETPASSTOKEN_API: BASE_URL + "/auth/reset-password-token",
  RESETPASSWORD_API: BASE_URL + "/auth/reset-password",
}

// PROFILE ENDPOINTS
export const profileEndpoints = {
  GET_USER_DETAILS_API: BASE_URL + "/profile/getUserDetails",
  GET_USER_ENROLLED_COURSES_API: BASE_URL + "/profile/getEnrolledCourses",
  GET_INSTRUCTOR_DATA_API: BASE_URL + "/profile/instructorDashboard",
}

// STUDENTS ENDPOINTS
export const studentEndpoints = {
  COURSE_PAYMENT_API: BASE_URL + "/payment/capturePayment",
  COURSE_VERIFY_API: BASE_URL + "/payment/verifyPayment",
  SEND_PAYMENT_SUCCESS_EMAIL_API: BASE_URL + "/payment/sendPaymentSuccessEmail",
  SETUP_FEE_CAPTURE_API: BASE_URL + "/payment/captureSetupFee",
  SETUP_FEE_VERIFY_API: BASE_URL + "/payment/verifySetupFee",
  TEST_SERIES_CAPTURE_API: BASE_URL + "/payment/captureTestSeriesPayment",
  TEST_SERIES_VERIFY_API: BASE_URL + "/payment/verifyTestSeriesPayment",
  SUBSCRIPTION_CAPTURE_API: BASE_URL + "/payment/captureSubscriptionPayment",
  SUBSCRIPTION_VERIFY_API: BASE_URL + "/payment/verifySubscriptionPayment",
  ADDON_CAPTURE_API: BASE_URL + "/payment/captureAddOnPayment",
  ADDON_VERIFY_API: BASE_URL + "/payment/verifyAddOnPayment",
  REQUEST_REFUND_API: BASE_URL + "/course/requestRefund",
}

// COURSE ENDPOINTS
export const courseEndpoints = {
  GET_ALL_COURSE_API: BASE_URL + "/course/getAllCourses",
  COURSE_DETAILS_API: BASE_URL + "/course/getCourseDetails",
  EDIT_COURSE_API: BASE_URL + "/course/editCourse",
  COURSE_CATEGORIES_API: BASE_URL + "/course/showAllCategories",
  CREATE_COURSE_API: BASE_URL + "/course/createCourse",
  CREATE_SECTION_API: BASE_URL + "/course/addSection",
  CREATE_SUBSECTION_API: BASE_URL + "/course/addSubSection",
  UPDATE_SECTION_API: BASE_URL + "/course/updateSection",
  UPDATE_SUBSECTION_API: BASE_URL + "/course/updateSubSection",
  DELETE_SUBSECTION_RESOURCE_API: BASE_URL + "/course/deleteSubSectionResource",
  GET_ALL_INSTRUCTOR_COURSES_API: BASE_URL + "/course/getInstructorCourses",
  DELETE_SECTION_API: BASE_URL + "/course/deleteSection",
  DELETE_SUBSECTION_API: BASE_URL + "/course/deleteSubSection",
  DELETE_COURSE_API: BASE_URL + "/course/deleteCourse",
  GET_FULL_COURSE_DETAILS_AUTHENTICATED:
    BASE_URL + "/course/getFullCourseDetails",
  LECTURE_COMPLETION_API: BASE_URL + "/course/updateCourseProgress",
  CREATE_RATING_API: BASE_URL + "/course/createRating",
  DOWNLOAD_RESOURCE_API: BASE_URL + "/course/download-resource",
}

// RATINGS AND REVIEWS
export const ratingsEndpoints = {
  REVIEWS_DETAILS_API: BASE_URL + "/course/getReviews",
  GET_AVERAGE_RATING_API: BASE_URL + "/course/getAverageRating",
  GET_INSTRUCTOR_REVIEWS_API: BASE_URL + "/course/getInstructorReviews",
  ADD_REPLY_TO_REVIEW_API: BASE_URL + "/course/replyToReview",
  TOGGLE_HELPFUL_API: BASE_URL + "/course/toggleHelpful",
  TOGGLE_NOT_HELPFUL_API: BASE_URL + "/course/toggleNotHelpful",
}

// CATAGORIES API
export const categories = {
  CATEGORIES_API: BASE_URL + "/course/showAllCategories",
}

// CATALOG PAGE DATA
export const catalogData = {
  CATALOGPAGEDATA_API: BASE_URL + "/course/getCategoryPageDetails",
}
// CONTACT-US API
export const contactusEndpoint = {
  CONTACT_US_API: BASE_URL + "/reach/contact",
}

// SETTINGS PAGE API
export const settingsEndpoints = {
  UPDATE_DISPLAY_PICTURE_API: BASE_URL + "/profile/updateDisplayPicture",
  UPDATE_PROFILE_API: BASE_URL + "/profile/updateProfile",
  CHANGE_PASSWORD_API: BASE_URL + "/auth/changepassword",
  DELETE_PROFILE_API: BASE_URL + "/profile/deleteProfile",
}

// LIVE CLASS API
export const liveClassEndpoints = {
  CREATE_LIVE_CLASS_API: BASE_URL + "/course/liveClass/create",
  GET_INSTRUCTOR_LIVE_CLASSES_API: BASE_URL + "/course/liveClass/instructor",
  UPDATE_LIVE_CLASS_API: BASE_URL + "/course/liveClass/update",
  DELETE_LIVE_CLASS_API: BASE_URL + "/course/liveClass/delete",
  GET_PUBLIC_LIVE_CLASSES_API: BASE_URL + "/course/liveClass/public",
}

// WISHLIST ENDPOINTS
export const wishlistEndpoints = {
  ADD_TO_WISHLIST_API: BASE_URL + "/course/addToWishlist",
  REMOVE_FROM_WISHLIST_API: BASE_URL + "/course/removeFromWishlist",
  GET_WISHLIST_API: BASE_URL + "/course/getWishlist",
}

// COUPON ENDPOINTS
export const couponEndpoints = {
  CREATE_COUPON_API: BASE_URL + "/course/createCoupon",
  GET_INSTRUCTOR_COUPONS_API: BASE_URL + "/course/getInstructorCoupons",
  DELETE_COUPON_API: BASE_URL + "/course/deleteCoupon",
  APPLY_COUPON_API: BASE_URL + "/course/applyCoupon",
}

// LECTURE Q&A ENDPOINTS
export const lectureQaEndpoints = {
  ASK_QUESTION_API: BASE_URL + "/course/askQuestion",
  GET_QUESTIONS_API: BASE_URL + "/course/getQuestionsForLecture",
  ANSWER_QUESTION_API: BASE_URL + "/course/answerQuestion",
}

// VIDEO NOTES ENDPOINTS
export const videoNotesEndpoints = {
  ADD_VIDEO_NOTE_API: BASE_URL + "/course/addVideoNote",
  GET_VIDEO_NOTES_API: BASE_URL + "/course/getVideoNotes",
  DELETE_VIDEO_NOTE_API: BASE_URL + "/course/deleteVideoNote",
}