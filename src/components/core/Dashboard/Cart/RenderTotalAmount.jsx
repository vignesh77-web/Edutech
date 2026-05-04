import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { buyCourse } from "../../../../services/operations/studentFeaturesAPI"
import { applyCoupon } from "../../../../services/operations/couponAPI"
import IconBtn from "../../../common/IconBtn"

export default function RenderTotalAmount() {
  const { total, cart } = useSelector((state) => state.cart)
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [discountAmount, setDiscountAmount] = useState(0)

  const handleApplyCoupon = async () => {
    if (!couponCode) return
    const courseIds = cart.map((course) => course._id)
    const result = await applyCoupon(couponCode, courseIds, token)
    if (result) {
      setAppliedCoupon(couponCode)
      // Calculate total discount
      let dAmount = 0
      Object.values(result.discountDetails).forEach((val) => {
        dAmount += val.discountAmount
      })
      setDiscountAmount(dAmount)
    }
  }

  const handleBuyCourse = () => {
    const courses = cart.map((course) => course._id)
    buyCourse(token, courses, user, navigate, dispatch, appliedCoupon)
  }

  const finalTotal = Math.max(0, total - discountAmount)

  return (
    <div className="min-w-[280px] rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6">
      <p className="mb-1 text-sm font-medium text-richblack-300">Total:</p>
      
      {discountAmount > 0 ? (
        <div className="mb-6">
          <p className="text-xl font-medium text-richblack-300 line-through">₹ {total}</p>
          <p className="text-3xl font-medium text-yellow-100">₹ {finalTotal}</p>
          <p className="text-sm text-caribbeangreen-200 mt-2 border border-caribbeangreen-200 bg-caribbeangreen-700/20 px-2 py-1 rounded w-fit">
            Coupon {appliedCoupon} applied! (-₹{discountAmount})
          </p>
        </div>
      ) : (
        <p className="mb-6 text-3xl font-medium text-yellow-100">₹ {total}</p>
      )}

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Coupon Code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className="form-style w-full uppercase"
          disabled={appliedCoupon !== null}
        />
        {appliedCoupon ? (
          <button 
            onClick={() => { setAppliedCoupon(null); setDiscountAmount(0); setCouponCode(""); }}
            className="rounded-md bg-richblack-700 px-4 text-sm font-semibold text-pink-200 border border-richblack-600 hover:bg-richblack-800"
          >
            Remove
          </button>
        ) : (
          <button 
            onClick={handleApplyCoupon}
            className="rounded-md bg-richblack-700 px-4 text-sm font-semibold text-richblack-50 border border-richblack-600 hover:bg-richblack-800"
          >
            Apply
          </button>
        )}
      </div>

      <IconBtn
        text="Buy Now"
        onclick={handleBuyCourse}
        customClasses="w-full justify-center"
      />
    </div>
  )
}