import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getWishlist } from "../../../../services/operations/wishlistAPI"
import { setWishlist } from "../../../../slices/wishlistSlice"
import Course_Card from "../../Catalog/Course_Card"

export default function Wishlist() {
  const { token } = useSelector((state) => state.auth)
  const { wishlist, totalItems } = useSelector((state) => state.wishlist)
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchWishlist = async () => {
      const res = await getWishlist(token)
      dispatch(setWishlist(res))
    }
    fetchWishlist()
  }, [])

  return (
    <>
      <h1 className="mb-14 text-3xl font-medium text-richblack-5">Your Wishlist</h1>
      <p className="border-b border-b-richblack-400 pb-2 font-semibold text-richblack-400">
        {totalItems} Courses in Wishlist
      </p>
      {totalItems > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {wishlist.map((course, ind) => (
            <Course_Card course={course} key={ind} Height={"h-[250px]"} />
          ))}
        </div>
      ) : (
        <p className="mt-14 text-center text-3xl text-richblack-100">
          Your wishlist is empty
        </p>
      )}
    </>
  )
}
