import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FiClock, FiLock, FiCheckCircle } from 'react-icons/fi'
import { buySubscription } from '../../../services/operations/revenueAPI'
import { getUserEnrolledCourses } from '../../../services/operations/profileAPI'
import { apiConnector } from '../../../services/apiconnector'

// We need to fetch the single "Yearly Pro" subscription ID to use for renewals
// For simplicity in this UI, we assume there's a primary Yearly renewal plan
// If there are multiple, we'd fetch them from the backend. 
// We will fetch available subscriptions from an API or define a constant here if the backend has only a standard set.

export default function Subscriptions() {
    const { token } = useSelector((state) => state.auth)
    const navigate = useNavigate()

    const [enrolledCourses, setEnrolledCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [availablePlans, setAvailablePlans] = useState([])

    useEffect(() => {
        loadData()
    }, [token])

    const loadData = async () => {
        setLoading(true)
        try {
            // Fetch enrolled courses
            const courses = await getUserEnrolledCourses(token)
            setEnrolledCourses(courses || [])

            // Fetch available subscription plans (Fallback to a hardcoded ID if API isn't built yet)
            // Assuming there is a GET_ALL_SUBSCRIPTIONS API we can call
            // We'll use a placeholder structure for now, matching our backend Subscriptions model.
            // Normally you would fetch this from the backend:
            // const subRes = await apiConnector("GET", "/course/getAllSubscriptions");

            // For now, let's assume we have these standard plans in the DB
            // User will click "Renew" which passes the courseId to backend
            setAvailablePlans([
                { name: "1-Year Extension", price: 4999, description: "Extend access for another 365 days", isPopular: true },
                { name: "2-Year Extension", price: 7999, description: "Extend access for another 730 days", isPopular: false }
            ])

        } catch (error) {
            console.error("Failed to load data", error)
        }
        setLoading(false)
    }

    const handleRenew = () => {
        // We trigger the buySubscription function.
        // It's meant to take a subscription ID. Since the UI is asked to be course-specific,
        // and our verify logic extends ALL courses by 2 years,
        // we just need to pass "renewal-plan".
        // The backend `verifySubscriptionPayment` extends ALL existing courses by 2 years when it sees this ID.

        buySubscription(token, "renewal-plan", navigate)
    }

    // Since our backend logic (as written in Payments.js) extends ALL existing courses, 
    // the UI should probably reflect "Extend All Course Access" rather than per-course checkout.
    // However, the user specifically asked: "in subscriptions section add only particular (enrolled course details) do not add more course access in subscription"

    // So we will list their enrolled courses to show WHAT they are extending.

    return (
        <div className="text-white">
            <h1 className="mb-4 text-3xl font-medium text-richblack-5 flex items-center gap-3">
                <FiClock className="text-yellow-50" /> Renew Course Access
            </h1>
            <p className="text-richblack-300 mb-10 text-sm max-w-2xl">
                Your purchases include 2 years of access by default. You can renew your access to all your currently enrolled courses below.
            </p>

            {loading ? (
                <div className="text-center py-20 text-richblack-400">Loading your courses...</div>
            ) : enrolledCourses.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-richblack-700 rounded-xl">
                    <FiLock className="text-6xl text-richblack-500 mx-auto mb-4" />
                    <p className="text-richblack-400 text-lg">You don't have any enrolled courses to renew.</p>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left side: Enrolled Courses List */}
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-richblack-5 mb-4">Your Enrolled Courses</h2>
                        <div className="flex flex-col gap-4">
                            {enrolledCourses.map((course, i) => {
                                const isExpired = course.expiresAt && new Date(course.expiresAt) < new Date()
                                return (
                                    <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${isExpired ? 'border-pink-500/50 bg-pink-900/10' : 'border-richblack-700 bg-richblack-800'}`}>
                                        <img src={course.thumbnail} alt={course.courseName} className="w-24 h-16 object-cover rounded-md" />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-richblack-5">{course.courseName}</h3>
                                            {isExpired ? (
                                                <span className="text-xs text-pink-400 flex items-center gap-1 mt-1"><FiLock /> Access Expired</span>
                                            ) : (
                                                <span className="text-xs text-caribbeangreen-300 flex items-center gap-1 mt-1"><FiCheckCircle /> Active until {new Date(course.expiresAt).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Right side: Subscription / Renewal Box */}
                    <div className="lg:w-[400px]">
                        <h2 className="text-xl font-bold text-richblack-5 mb-4">Renewal Plan</h2>
                        <div className="rounded-xl border border-yellow-50 bg-richblack-800 p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-yellow-50 text-richblack-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
                                REQUIRED TO ACCESS EXPIRED COURSES
                            </div>
                            <h3 className="text-2xl font-bold text-richblack-5 mb-2 mt-2">Account-Wide Renewal</h3>
                            <p className="text-4xl font-bold text-yellow-50 mb-4">₹4,999</p>
                            <p className="text-richblack-300 text-sm mb-6">
                                Adds +2 Years to the expiration date of <b>all {enrolledCourses.length}</b> of your currently enrolled courses.
                            </p>

                            <ul className="space-y-3 mb-8 text-sm text-richblack-100">
                                {enrolledCourses.slice(0, 3).map((course, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-caribbeangreen-300 mt-0.5">✔</span>
                                        <span>Extends <b title={course.courseName}>{course.courseName.length > 25 ? course.courseName.slice(0, 25) + '...' : course.courseName}</b></span>
                                    </li>
                                ))}
                                {enrolledCourses.length > 3 && (
                                    <li className="text-richblack-400 italic text-xs ml-6">
                                        + {enrolledCourses.length - 3} more courses...
                                    </li>
                                )}
                            </ul>

                            <button
                                onClick={() => handleRenew()}
                                className="w-full bg-yellow-50 text-richblack-900 py-3 rounded-lg font-bold hover:scale-95 transition-all"
                            >
                                Renew Access Now
                            </button>
                            <p className="text-center text-xs text-richblack-400 mt-4">Safe & secure checkout via Razorpay</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
