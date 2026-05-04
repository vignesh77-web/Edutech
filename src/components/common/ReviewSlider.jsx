import React, { useEffect, useState } from "react"
import ReactStars from "react-rating-stars-component"
import Img from './Img';

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, FreeMode, Pagination } from "swiper"
import "swiper/css"
import "swiper/css/free-mode"
import "swiper/css/pagination"
import "swiper/css/autoplay"

// Icons
import { FaStar, FaRegThumbsUp, FaRegThumbsDown, FaThumbsUp, FaThumbsDown } from "react-icons/fa"
import { useSelector } from "react-redux"

// Get apiFunction and the endpoint
import { apiConnector } from "../../services/apiconnector";
import { ratingsEndpoints } from "../../services/apis"
import { toggleHelpful, toggleNotHelpful } from "../../services/operations/courseDetailsAPI"


function ReviewSlider() {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const [reviews, setReviews] = useState([])
  const truncateWords = 15

  useEffect(() => {
    ; (async () => {
      const { data } = await apiConnector(
        "GET",
        ratingsEndpoints.REVIEWS_DETAILS_API
      )
      if (data?.success) {
        setReviews(data?.data)
      }
    })()
  }, [])

  const handleVote = async (reviewId, type) => {
    if (!token) return;
    
    const result = type === "helpful" 
      ? await toggleHelpful(reviewId, token) 
      : await toggleNotHelpful(reviewId, token);

    if (result) {
      setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, helpfulVotes: result.helpfulVotes, notHelpfulVotes: result.notHelpfulVotes } : r));
    }
  }

 

  return (
    <div className="text-white">
      <div className="my-[50px] h-[184px] max-w-maxContentTab lg:max-w-maxContent">
        <Swiper
          breakpoints={{
            // Configure the number of slides per view for different screen sizes
            640: {
              slidesPerView: 1, // Show 1 slide at a time on smaller screens
            },
            768: {
              slidesPerView: 2, // Show 2 slides at a time on screens wider than 768px
            },
            1024: {
              slidesPerView: 4, // Show 4 slides at a time on screens wider than 1024px
            },
          }}
          spaceBetween={25}
          loop={true}
          freeMode={true}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          modules={[FreeMode, Pagination, Autoplay]}
          className="w-full "
        >
          {reviews.map((review, i) => {
            return (
              <SwiperSlide key={i}>
                <div className="flex flex-col gap-3 bg-richblack-800 p-3 text-[14px] text-richblack-25 min-h-[180px] max-h-[180px] glass-bg">
                  <div className="flex items-center gap-4">
                    <Img
                      src={
                        review?.user?.image
                          ? review?.user?.image
                          : `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
                      }
                      alt=""
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <h1 className="font-semibold text-richblack-5 capitalize">{`${review?.user?.firstName} ${review?.user?.lastName}`}</h1>
                      <h2 className="text-[12px] font-medium text-richblack-500">
                        {review?.course?.courseName}
                      </h2>
                    </div>
                  </div>

                  <p className="font-medium text-richblack-25">
                    {review?.review.split(" ").length > truncateWords
                      ? `${review?.review
                        .split(" ")
                        .slice(0, truncateWords)
                        .join(" ")} ...`
                      : `${review?.review}`}
                  </p>

                  <div className="flex items-center gap-2 ">
                    <h3 className="font-semibold text-yellow-100">
                      {review.rating}
                    </h3>
                    <ReactStars
                      count={5}
                      value={parseInt(review.rating)} // Convert to a number
                      size={20}
                      edit={false}
                      activeColor="#ffd700"
                      emptyIcon={<FaStar />}
                      fullIcon={<FaStar />}
                    />
                  </div>

                  {/* Voting Section */}
                  <div className="flex items-center gap-4 mt-auto pt-2 border-t border-richblack-700">
                    <button 
                      onClick={() => handleVote(review._id, "helpful")}
                      className={`flex items-center gap-1.5 transition-all hover:scale-110 ${review.helpfulVotes?.includes(user?._id) ? "text-yellow-50" : "text-richblack-400"}`}
                      title="Helpful"
                    >
                      {review.helpfulVotes?.includes(user?._id) ? <FaThumbsUp /> : <FaRegThumbsUp />}
                      <span className="text-xs">{review.helpfulVotes?.length || 0}</span>
                    </button>
                    
                    <button 
                      onClick={() => handleVote(review._id, "nothelpful")}
                      className={`flex items-center gap-1.5 transition-all hover:scale-110 ${review.notHelpfulVotes?.includes(user?._id) ? "text-pink-200" : "text-richblack-400"}`}
                      title="Not Helpful"
                    >
                      {review.notHelpfulVotes?.includes(user?._id) ? <FaThumbsDown /> : <FaRegThumbsDown />}
                      <span className="text-xs">{review.notHelpfulVotes?.length || 0}</span>
                    </button>
                  </div>

                  {review?.instructorReply && (
                    <div className="mt-2 text-xs italic text-caribbeangreen-200 border-l-2 border-caribbeangreen-200 pl-2">
                      <span className="font-semibold text-caribbeangreen-100">Instructor Reply:</span>{" "}
                      {review.instructorReply.split(" ").length > truncateWords
                        ? `${review.instructorReply.split(" ").slice(0, truncateWords).join(" ")} ...`
                        : review.instructorReply}
                    </div>
                  )}
                </div>
              </SwiperSlide>
            )
          })}
          {/* <SwiperSlide>Slide 1</SwiperSlide> */}
        </Swiper>
      </div>
    </div>
  )
}

export default ReviewSlider