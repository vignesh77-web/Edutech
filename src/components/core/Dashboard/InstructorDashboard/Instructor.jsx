import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { fetchInstructorCourses } from '../../../../services/operations/courseDetailsAPI';
import { getInstructorData } from '../../../../services/operations/profileAPI';
import { paySetupFee } from '../../../../services/operations/revenueAPI';
import InstructorChart from './InstructorChart';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiUsers, FiDollarSign, FiBookOpen, FiActivity } from 'react-icons/fi';

export default function Instructor() {
  const { token } = useSelector((state) => state?.auth)
  const { user } = useSelector((state) => state.profile)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [instructorData, setInstructorData] = useState(null)
  const [recentTransactions, setRecentTransactions] = useState([])
  const [courses, setCourses] = useState([])

  useEffect(() => {
    ; (async () => {
      setLoading(true)
      const instructorApiData = await getInstructorData(token)
      const result = await fetchInstructorCourses(token)

      if (instructorApiData) {
        if (instructorApiData.courses) setInstructorData(instructorApiData.courses)
        if (instructorApiData.recentTransactions) setRecentTransactions(instructorApiData.recentTransactions)
      }

      if (result) {
        setCourses(result)
      }
      setLoading(false)
    })()
  }, [token])

  const totalAmount = instructorData?.reduce((acc, curr) => acc + curr?.totalAmountGenerated, 0)
  const totalEarnings = instructorData?.reduce((acc, curr) => acc + (curr?.instructorEarnings || 0), 0)
  const totalStudents = instructorData?.reduce((acc, curr) => acc + curr?.totalStudentsEnrolled, 0)

  return (
    <div className="relative min-h-[600px] pb-10">
      {/* Setup Fee Blocking Overlay */}
      {user?.accountType === "Instructor" && user?.instructorStatus === "PENDING_SETUP_PAYMENT" && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center rounded-2xl bg-richblack-900/80 backdrop-blur-md border border-richblack-700">
          <div className="max-w-[500px] p-8 text-center bg-richblack-800 rounded-3xl border border-richblack-600 shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 flex items-center justify-center rounded-full bg-yellow-50/10 text-yellow-50 text-4xl border border-yellow-50/20">
                <FiDollarSign />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-richblack-5 mb-4">Complete Your Setup</h2>
            <p className="text-richblack-300 mb-8 leading-relaxed">
              To start creating courses and reaching students, a one-time non-refundable platform setup fee of <b>₹5,000</b> is required. This unlocks your full instructor dashboard and premium tools.
            </p>
            <button
              onClick={() => paySetupFee(token, user, navigate, dispatch)}
              className="w-full py-4 rounded-xl bg-yellow-50 text-richblack-900 font-bold text-lg transition-all hover:scale-[0.98] hover:shadow-[0_0_20px_rgba(255,214,10,0.3)]"
            >
              Pay Setup Fee (₹5,000)
            </button>
            <p className="mt-4 text-xs text-richblack-500 uppercase tracking-widest font-bold">
              Secure Payment via Razorpay
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-richblack-5">
            Welcome back, {user?.firstName} 👋
          </h1>
          <p className="text-richblack-300">
            Monitor your course performance and student engagement.
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            to="/dashboard/add-course"
            className="flex items-center gap-2 rounded-md bg-yellow-50 px-5 py-2.5 font-semibold text-richblack-900 transition-all hover:scale-95"
          >
            <FiPlus /> Create Course
          </Link>
          <Link
            to="/dashboard/add-test-series"
            className="flex items-center gap-2 rounded-md bg-richblack-700 px-5 py-2.5 font-semibold text-richblack-50 border border-richblack-600 transition-all hover:bg-richblack-800"
          >
            Add Test Series
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[400px] items-center justify-center">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={<FiBookOpen className="text-blue-200" />}
              title="Total Courses"
              value={courses?.length}
              gradient="from-blue-600/20 to-blue-400/5"
            />
            <StatCard
              icon={<FiUsers className="text-caribbeangreen-200" />}
              title="Total Students"
              value={totalStudents}
              gradient="from-caribbeangreen-600/20 to-caribbeangreen-400/5"
            />
            <StatCard
              icon={<FiDollarSign className="text-yellow-200" />}
              title="Total Revenue"
              value={`Rs. ${totalAmount}`}
              gradient="from-yellow-600/20 to-yellow-400/5"
            />
            <StatCard
              icon={<FiDollarSign className="text-pink-200" />}
              title="Your Earnings"
              value={`Rs. ${totalEarnings}`}
              badge="After Commission"
              gradient="from-pink-600/20 to-pink-400/5"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visualization and Courses Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-richblack-700 bg-richblack-800/50 p-6 backdrop-blur-sm">
                {totalAmount > 0 || totalStudents > 0 ? (
                  <InstructorChart courses={instructorData} />
                ) : (
                  <div className="flex h-[300px] flex-col items-center justify-center text-center">
                    <FiActivity className="text-5xl text-richblack-600 mb-4" />
                    <p className="text-xl font-bold text-richblack-5">Visualization</p>
                    <p className="text-richblack-400">Establish your presence to see insights.</p>
                  </div>
                )}
              </div>

              {/* Your Courses */}
              <div className="rounded-2xl border border-richblack-700 bg-richblack-800/50 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-xl font-bold text-white">Top Performing Courses</p>
                  <Link to="/dashboard/my-courses" className="text-sm font-semibold text-yellow-100 hover:underline">
                    View All
                  </Link>
                </div>
                {courses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {courses.slice(0, 3).map((course) => (
                      <div key={course._id} className="group overflow-hidden rounded-xl bg-richblack-900 transition-all hover:scale-[1.02]">
                        <img
                          src={course?.thumbnail}
                          alt={course?.courseName}
                          className="aspect-video w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="p-4">
                          <p className="font-semibold text-richblack-5 line-clamp-1">{course?.courseName}</p>
                          <div className="flex items-center justify-between mt-2 text-xs text-richblack-400">
                            <span>{course?.studentsEnrolled?.length} Students</span>
                            <span className="text-yellow-50 font-bold">Rs. {course.price}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-richblack-400 py-10">No courses created yet.</p>
                )}
              </div>
            </div>

            {/* Sidebar Stats & Recent Activity */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-richblack-700 bg-richblack-800/50 p-6 backdrop-blur-sm">
                <p className="text-xl font-bold text-white mb-6">Recent Activity</p>
                {recentTransactions.length > 0 ? (
                  <div className="space-y-4">
                    {recentTransactions.map((tx, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-richblack-900/50 border border-richblack-700/50">
                        <img
                          src={tx.userId?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${tx.userId?.firstName}`}
                          className="h-10 w-10 rounded-full object-cover"
                          alt="user"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-richblack-5">{tx.userId?.firstName} {tx.userId?.lastName}</p>
                          <p className="text-[11px] text-richblack-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-caribbeangreen-200">+Rs.{tx.instructorEarnings}</p>
                          <p className="text-[10px] text-richblack-500 capitalize">{tx.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-richblack-500 py-10">No recent sales data.</p>
                )}
              </div>

              {/* Quick Tips */}
              <div className="rounded-2xl border-l-4 border-yellow-50 bg-richblack-800/50 p-6 backdrop-blur-sm">
                <p className="font-bold text-yellow-50 flex items-center gap-2">
                  <FiActivity size={18} /> Pro Tip
                </p>
                <p className="mt-2 text-sm text-richblack-200">
                  Courses with video subtitles and active doubt solving receive 40% more positive ratings.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, title, value, badge, gradient }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-richblack-700 bg-richblack-800 p-6 transition-all hover:translate-y-[-4px] hover:shadow-xl`}>
      <div className={`absolute top-0 right-0 h-24 w-24 translate-x-12 translate-y-[-12px] bg-gradient-to-br ${gradient} blur-2xl rounded-full`} />
      <div className="flex flex-col gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-richblack-900 text-2xl border border-richblack-700">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-richblack-400 capitalize">{title}</p>
          <p className="text-2xl font-bold text-richblack-5 mt-1">{value}</p>
          {badge && <p className="text-[10px] text-richblack-500 mt-1 uppercase font-bold tracking-wider">{badge}</p>}
        </div>
      </div>
    </div>
  )
}