import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { createCoupon, deleteCoupon, fetchInstructorCoupons } from "../../../../services/operations/couponAPI"
import { fetchInstructorCourses } from "../../../../services/operations/courseDetailsAPI"
import { RiDeleteBin6Line } from "react-icons/ri"

export default function InstructorCoupons() {
  const { token } = useSelector((state) => state.auth)
  const [coupons, setCoupons] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    code: "",
    discountPercentage: "",
    courseId: "",
    expiryDate: "",
    maxUses: 1,
  })

  useEffect(() => {
    const getData = async () => {
      setLoading(true)
      const resCoupons = await fetchInstructorCoupons(token)
      if (resCoupons) setCoupons(resCoupons)

      const resCourses = await fetchInstructorCourses(token)
      if (resCourses) setCourses(resCourses)
      setLoading(false)
    }
    getData()
  }, [token])

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }))
  }

  const handleOnSubmit = async (e) => {
    e.preventDefault()
    const result = await createCoupon(formData, token)
    if (result) {
      setCoupons((prev) => [result, ...prev])
      setFormData({
        code: "",
        discountPercentage: "",
        courseId: "",
        expiryDate: "",
        maxUses: 1,
      })
    }
  }

  const handleDelete = async (couponId) => {
    const success = await deleteCoupon(couponId, token)
    if (success) {
      setCoupons(coupons.filter((c) => c._id !== couponId))
    }
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
      <h1 className="mb-14 text-3xl font-medium text-richblack-5">Manage Coupons</h1>

      <div className="flex flex-col gap-10 xl:flex-row">
        {/* Create Coupon Form */}
        <div className="flex flex-col gap-y-6 rounded-md border border-richblack-700 bg-richblack-800 p-8 xl:w-1/3 h-fit">
          <h2 className="text-lg font-semibold text-richblack-5">Create New Coupon</h2>
          <form onSubmit={handleOnSubmit} className="flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-2">
              <label htmlFor="code" className="text-sm text-richblack-5">
                Coupon Code <sup className="text-pink-200">*</sup>
              </label>
              <input
                type="text"
                name="code"
                id="code"
                placeholder="e.g. SUMMER50"
                value={formData.code}
                onChange={handleOnChange}
                className="form-style"
                required
              />
            </div>
            
            <div className="flex flex-col gap-y-2">
              <label htmlFor="discountPercentage" className="text-sm text-richblack-5">
                Discount Percentage (%) <sup className="text-pink-200">*</sup>
              </label>
              <input
                type="number"
                name="discountPercentage"
                id="discountPercentage"
                min="1"
                max="100"
                placeholder="e.g. 20"
                value={formData.discountPercentage}
                onChange={handleOnChange}
                className="form-style"
                required
              />
            </div>

            <div className="flex flex-col gap-y-2">
              <label htmlFor="courseId" className="text-sm text-richblack-5">
                Applicable Course
              </label>
              <select
                name="courseId"
                id="courseId"
                value={formData.courseId}
                onChange={handleOnChange}
                className="form-style"
              >
                <option value="">All My Courses</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.courseName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-y-2">
              <label htmlFor="expiryDate" className="text-sm text-richblack-5">
                Expiry Date <sup className="text-pink-200">*</sup>
              </label>
              <input
                type="date"
                name="expiryDate"
                id="expiryDate"
                value={formData.expiryDate}
                onChange={handleOnChange}
                className="form-style"
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="flex flex-col gap-y-2">
              <label htmlFor="maxUses" className="text-sm text-richblack-5">
                Max Uses <sup className="text-pink-200">*</sup>
              </label>
              <input
                type="number"
                name="maxUses"
                id="maxUses"
                min="1"
                value={formData.maxUses}
                onChange={handleOnChange}
                className="form-style"
                required
              />
            </div>

            <button type="submit" className="mt-4 rounded-md bg-yellow-50 px-6 py-3 font-semibold text-richblack-900 transition-all hover:scale-95">
              Generate Coupon
            </button>
          </form>
        </div>

        {/* Coupons List */}
        <div className="xl:w-2/3">
          <table className="w-full rounded-xl border border-richblack-800 bg-richblack-800 text-left">
            <thead>
              <tr className="border-b border-richblack-800 bg-richblack-700/50">
                <th className="px-6 py-4 text-sm font-medium text-richblack-100">Code</th>
                <th className="px-6 py-4 text-sm font-medium text-richblack-100">Discount</th>
                <th className="px-6 py-4 text-sm font-medium text-richblack-100">Course</th>
                <th className="px-6 py-4 text-sm font-medium text-richblack-100">Usage</th>
                <th className="px-6 py-4 text-sm font-medium text-richblack-100">Expiry</th>
                <th className="px-6 py-4 text-sm font-medium text-richblack-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-richblack-300">
                    No active coupons found.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon._id} className="border-b border-richblack-800">
                    <td className="px-6 py-4 text-sm font-semibold text-yellow-50">{coupon.code}</td>
                    <td className="px-6 py-4 text-sm text-richblack-5">{coupon.discountPercentage}%</td>
                    <td className="px-6 py-4 text-sm text-richblack-5">
                      {coupon.courseId ? coupon.courseId.courseName : "All Courses"}
                    </td>
                    <td className="px-6 py-4 text-sm text-richblack-5">
                      {coupon.usedCount} / {coupon.maxUses}
                    </td>
                    <td className="px-6 py-4 text-sm text-richblack-5">
                      {new Date(coupon.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-richblack-5">
                      <button
                        onClick={() => handleDelete(coupon._id)}
                        className="text-pink-200 hover:text-pink-300"
                        title="Delete"
                      >
                        <RiDeleteBin6Line size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
