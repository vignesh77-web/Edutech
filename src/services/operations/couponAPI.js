import { toast } from "react-hot-toast";
import { apiConnector } from "../apiconnector";
import { couponEndpoints } from "../apis";

const { CREATE_COUPON_API, GET_INSTRUCTOR_COUPONS_API, DELETE_COUPON_API, APPLY_COUPON_API } = couponEndpoints;

export const createCoupon = async (data, token) => {
  const toastId = toast.loading("Creating Coupon...");
  let result = null;
  try {
    const response = await apiConnector("POST", CREATE_COUPON_API, data, {
      Authorization: `Bearer ${token}`,
    });
    if (!response?.data?.success) {
      throw new Error(response.data.message);
    }
    toast.success("Coupon Created Successfully");
    result = response?.data?.data;
  } catch (error) {
    console.log("CREATE_COUPON_API ERROR............", error);
    toast.error(error.response?.data?.message || "Could Not Create Coupon");
  }
  toast.dismiss(toastId);
  return result;
};

export const fetchInstructorCoupons = async (token) => {
  let result = [];
  try {
    const response = await apiConnector("GET", GET_INSTRUCTOR_COUPONS_API, null, {
      Authorization: `Bearer ${token}`,
    });
    if (!response?.data?.success) {
      throw new Error(response.data.message);
    }
    result = response?.data?.data;
  } catch (error) {
    console.log("GET_INSTRUCTOR_COUPONS_API ERROR............", error);
    toast.error(error.response?.data?.message || "Could Not Fetch Coupons");
  }
  return result;
};

export const deleteCoupon = async (couponId, token) => {
  const toastId = toast.loading("Deleting Coupon...");
  let success = false;
  try {
    const response = await apiConnector("DELETE", DELETE_COUPON_API, { couponId }, {
      Authorization: `Bearer ${token}`,
    });
    if (!response?.data?.success) {
      throw new Error(response.data.message);
    }
    toast.success("Coupon Deleted");
    success = true;
  } catch (error) {
    console.log("DELETE_COUPON_API ERROR............", error);
    toast.error(error.response?.data?.message || "Could Not Delete Coupon");
  }
  toast.dismiss(toastId);
  return success;
};

export const applyCoupon = async (code, courseIds, token) => {
  const toastId = toast.loading("Verifying Coupon...");
  let result = null;
  try {
    const response = await apiConnector("POST", APPLY_COUPON_API, { code, courseIds }, {
      Authorization: `Bearer ${token}`,
    });
    if (!response?.data?.success) {
      throw new Error(response.data.message);
    }
    toast.success("Coupon Applied Successfully!");
    result = response?.data;
  } catch (error) {
    console.log("APPLY_COUPON_API ERROR............", error);
    toast.error(error.response?.data?.message || "Invalid or Expired Coupon");
  }
  toast.dismiss(toastId);
  return result;
};
