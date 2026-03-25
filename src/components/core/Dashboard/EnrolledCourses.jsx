import { useEffect, useState } from "react"
import ProgressBar from "@ramonak/react-progress-bar"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { FiLock, FiCalendar, FiAlertTriangle } from "react-icons/fi"
import { getUserEnrolledCourses } from "../../../services/operations/profileAPI"

export default function EnrolledCourses() {
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [enrolledCourses, setEnrolledCourses] = useState(null)

  useEffect(() => {
    const getEnrolledCourses = async () => {
      try {
        const res = await getUserEnrolledCourses(token)
        setEnrolledCourses(res)
      } catch (error) {
        console.log("Could not fetch enrolled courses.")
      }
    }
    getEnrolledCourses()
  }, [token])

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A"
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <>
      <div className="text-3xl text-richblack-50 mb-2">Enrolled Courses</div>
      <p className="text-richblack-400 text-sm mb-6">
        All purchases include <span className="text-yellow-50 font-semibold">2 years</span> of access. Courses are automatically deactivated after expiry.
      </p>

      {!enrolledCourses ? (
        <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
          <div className="spinner"></div>
        </div>
      ) : !enrolledCourses.length ? (
        <p className="grid h-[10vh] w-full place-content-center text-richblack-5">
          You have not enrolled in any course yet.
        </p>
      ) : (
        <div className="my-4 text-richblack-5">
          {/* Table Header */}
          <div className="hidden md:flex rounded-t-lg bg-richblack-700 text-richblack-50 text-sm font-semibold">
            <p className="w-[40%] px-5 py-3">Course Name</p>
            <p className="w-[15%] px-2 py-3">Duration</p>
            <p className="w-[20%] px-2 py-3 flex items-center gap-1"><FiCalendar /> Purchased</p>
            <p className="w-[20%] px-2 py-3">Valid Till</p>
            <p className="flex-1 px-2 py-3">Progress</p>
          </div>

          {enrolledCourses.map((course, i, arr) => {
            const isExpired = course.expiresAt && new Date(course.expiresAt) < new Date()
            const isLast = i === arr.length - 1

            return (
              <div
                key={i}
                className={`flex flex-col md:flex-row md:items-center border border-richblack-700 relative
                  ${isLast ? "rounded-b-lg" : ""}
                  ${isExpired ? "opacity-70 bg-richblack-800" : "bg-richblack-900 hover:bg-richblack-800"}
                  transition-all`}
              >
                {/* Expired overlay badge */}
                {isExpired && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-pink-700 text-white text-xs px-2 py-0.5 rounded-full font-semibold z-10">
                    <FiLock size={10} /> Access Expired
                  </div>
                )}

                {/* Course Info */}
                <div
                  className={`flex w-full md:w-[40%] items-center gap-4 px-5 py-3 ${isExpired ? "cursor-not-allowed" : "cursor-pointer"}`}
                  onClick={() => {
                    if (isExpired) return
                    navigate(
                      `/view-course/${course?._id}/section/${course?.courseContent?.[0]?._id}/sub-section/${course?.courseContent?.[0]?.subSection?.[0]?._id}`
                    )
                  }}
                >
                  <div className="relative shrink-0">
                    <img
                      src={course.thumbnail}
                      alt="course_img"
                      className={`h-14 w-24 rounded-lg object-cover ${isExpired ? "grayscale" : ""}`}
                    />
                    {isExpired && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                        <FiLock className="text-white text-xl" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className={`font-semibold text-sm ${isExpired ? "text-richblack-400" : "text-richblack-5"}`}>
                      {course.courseName}
                    </p>
                    <p className="text-xs text-richblack-400">
                      {course.courseDescription?.length > 50
                        ? `${course.courseDescription.slice(0, 50)}...`
                        : course.courseDescription}
                    </p>
                    {isExpired && (
                      <p className="text-xs text-pink-400 font-medium">
                        Renew to regain access
                      </p>
                    )}
                  </div>
                </div>

                {/* Duration */}
                <div className="hidden md:block w-[15%] px-2 py-3 text-sm text-richblack-300">
                  {course?.totalDuration}
                </div>

                {/* Purchased Date */}
                <div className="hidden md:block w-[20%] px-2 py-3">
                  <p className="text-sm text-richblack-300">
                    {course.enrolledAt ? formatDate(course.enrolledAt) : "—"}
                  </p>
                </div>

                {/* Valid Till */}
                <div className="hidden md:block w-[20%] px-2 py-3">
                  {course.expiresAt ? (
                    <div>
                      <p className={`text-sm font-semibold 
                        ${isExpired ? "text-pink-400" :
                          course.isExpiringSoon ? "text-yellow-100" : "text-caribbeangreen-300"}`}>
                        {isExpired ? "Expired" : formatDate(course.expiresAt)}
                      </p>

                      {course.isExpiringSoon && !isExpired && (
                        <div className="flex items-center gap-1 text-[10px] text-yellow-100 font-bold mt-1 bg-yellow-900/30 px-2 py-0.5 rounded-full w-fit">
                          <FiAlertTriangle size={12} /> Expiring Soon
                        </div>
                      )}

                      {!isExpired && (
                        <p className={`text-xs mt-0.5 ${course.isExpiringSoon ? "text-yellow-200 font-medium" : "text-richblack-400"}`}>
                          {course.isExpiringSoon ? "Only " : ""}{course.daysLeft} days left
                        </p>
                      )}

                      {isExpired && (
                        <p className="text-xs text-richblack-500 mt-0.5">
                          Expired on {formatDate(course.expiresAt)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-richblack-500 text-sm">—</span>
                  )}
                </div>

                {/* Progress */}
                <div className="flex w-full md:w-auto md:flex-1 flex-col gap-2 px-5 md:px-2 py-3">
                  <p className="text-sm text-richblack-300">
                    {isExpired ? (
                      <span className="text-pink-400">Access Deactivated</span>
                    ) : (
                      `Progress: ${course.progressPercentage || 0}%`
                    )}
                  </p>
                  <ProgressBar
                    completed={course.progressPercentage || 0}
                    height="8px"
                    isLabelVisible={false}
                    bgColor={isExpired ? "#f87171" : "#00C8A0"}
                    baseBgColor="#2C333F"
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}