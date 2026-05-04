import { toast } from "react-hot-toast"
import { apiConnector } from "../apiconnector"
import { wishlistEndpoints } from "../apis"

const {
  ADD_TO_WISHLIST_API,
  REMOVE_FROM_WISHLIST_API,
  GET_WISHLIST_API,
} = wishlistEndpoints

export const addToWishlist = async (courseId, token) => {
  let result = false
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", ADD_TO_WISHLIST_API, { courseId }, {
      Authorization: `Bearer ${token}`,
    })

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    toast.success("Added to Wishlist")
    result = true
  } catch (error) {
    console.log("ADD_TO_WISHLIST_API API ERROR............", error)
    toast.error(error.response?.data?.message || "Could not add to wishlist")
  }
  toast.dismiss(toastId)
  return result
}

export const removeFromWishlist = async (courseId, token) => {
  let result = false
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", REMOVE_FROM_WISHLIST_API, { courseId }, {
      Authorization: `Bearer ${token}`,
    })

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    toast.success("Removed from Wishlist")
    result = true
  } catch (error) {
    console.log("REMOVE_FROM_WISHLIST_API API ERROR............", error)
    toast.error(error.response?.data?.message || "Could not remove from wishlist")
  }
  toast.dismiss(toastId)
  return result
}

export const getWishlist = async (token) => {
  let result = []
  try {
    const response = await apiConnector("GET", GET_WISHLIST_API, null, {
      Authorization: `Bearer ${token}`,
    })

    if (!response.data.success) {
      throw new Error(response.data.message)
    }

    result = response.data.data
  } catch (error) {
    console.log("GET_WISHLIST_API ERROR............", error)
    toast.error(error.response?.data?.message || "Could not fetch wishlist")
  }
  return result
}
