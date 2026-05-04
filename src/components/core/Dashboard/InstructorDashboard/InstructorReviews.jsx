import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { apiConnector } from "../../../../services/apiconnector"
import { courseEndpoints } from "../../../../services/apis"
import { addReplyToReview } from "../../../../services/operations/courseDetailsAPI"
import ReactStars from "react-rating-stars-component"
import { FaStar } from "react-icons/fa"

export default function InstructorReviews() {
  const { token } = useSelector((state) => state.auth)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState({})
  const [submitting, setSubmitting] = useState({})

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await apiConnector("GET", courseEndpoints.GET_INSTRUCTOR_REVIEWS_API || (process.env.REACT_APP_BASE_URL + "/course/getInstructorReviews"), null, {
          Authorization: `Bearer ${token}`,
        })
        if (res?.data?.success) {
          setReviews(res.data.data)
        }
      } catch (error) {
        console.log("Error fetching reviews", error)
      }
      setLoading(false)
    }
    fetchReviews()
  }, [token])

  const handleReplyChange = (reviewId, text) => {
    setReplyText((prev) => ({ ...prev, [reviewId]: text }))
  }

  const submitReply = async (reviewId) => {
    const text = replyText[reviewId]
    if (!text || text.trim() === "") return

    setSubmitting((prev) => ({ ...prev, [reviewId]: true }))
    const res = await addReplyToReview(reviewId, text, token)
    if (res) {
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId ? { ...r, instructorReply: text } : r
        )
      )
      setReplyText((prev) => ({ ...prev, [reviewId]: "" }))
    }
    setSubmitting((prev) => ({ ...prev, [reviewId]: false }))
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <>
      <h1 className="mb-14 text-3xl font-medium text-richblack-5">Course Reviews</h1>
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-center text-richblack-200">No reviews found.</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="rounded-lg border border-richblack-700 bg-richblack-800 p-6">
              <div className="flex items-center gap-4">
                <img
                  src={
                    review?.user?.image ||
                    `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName}`
                  }
                  alt="user"
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-semibold text-richblack-5">
                    {review?.user?.firstName} {review?.user?.lastName}
                  </h3>
                  <p className="text-sm text-richblack-200">
                    Course: <span className="text-yellow-50">{review?.course?.courseName}</span>
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <ReactStars
                  count={5}
                  value={review.rating}
                  size={20}
                  edit={false}
                  activeColor="#ffd700"
                  emptyIcon={<FaStar />}
                  fullIcon={<FaStar />}
                />
                <p className="mt-2 text-richblack-5">{review.review}</p>
              </div>

              {review.instructorReply ? (
                <div className="mt-4 rounded-md bg-richblack-700 p-4 border-l-4 border-caribbeangreen-200">
                  <p className="text-sm font-semibold text-caribbeangreen-100">Your Reply:</p>
                  <p className="mt-1 text-sm text-richblack-50">{review.instructorReply}</p>
                </div>
              ) : (
                <div className="mt-4 rounded-md bg-richblack-900 p-4">
                  <label htmlFor={`reply-${review._id}`} className="text-sm text-richblack-200">
                    Write a reply to this review
                  </label>
                  <textarea
                    id={`reply-${review._id}`}
                    value={replyText[review._id] || ""}
                    onChange={(e) => handleReplyChange(review._id, e.target.value)}
                    className="form-style mt-2 w-full resize-none"
                    rows={3}
                    placeholder="Thank the student or address their feedback..."
                  ></textarea>
                  <button
                    disabled={submitting[review._id] || !replyText[review._id]}
                    onClick={() => submitReply(review._id)}
                    className="mt-3 cursor-pointer rounded-md bg-yellow-50 py-2 px-5 font-semibold text-richblack-900 duration-200 hover:scale-95 disabled:opacity-50"
                  >
                    {submitting[review._id] ? "Posting..." : "Post Reply"}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  )
}
