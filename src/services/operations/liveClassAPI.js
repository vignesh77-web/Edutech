import { apiConnector } from "../apiconnector";
import { liveClassEndpoints } from "../apis";
import toast from "react-hot-toast";

const {
    CREATE_LIVE_CLASS_API,
    GET_INSTRUCTOR_LIVE_CLASSES_API,
    UPDATE_LIVE_CLASS_API,
    DELETE_LIVE_CLASS_API,
    GET_PUBLIC_LIVE_CLASSES_API,
} = liveClassEndpoints;

// Create a new live class
export const createLiveClass = async (token, data) => {
    const toastId = toast.loading("Scheduling live class...");
    try {
        const response = await apiConnector("POST", CREATE_LIVE_CLASS_API, data, {
            Authorization: `Bearer ${token}`,
        });
        if (!response?.data?.success) throw new Error(response?.data?.message);
        toast.success("Live class scheduled!");
        return response.data.data;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to schedule live class");
        return null;
    } finally {
        toast.dismiss(toastId);
    }
};

// Get all live classes for the logged-in instructor
export const getInstructorLiveClasses = async (token) => {
    try {
        const response = await apiConnector("GET", GET_INSTRUCTOR_LIVE_CLASSES_API, null, {
            Authorization: `Bearer ${token}`,
        });
        if (!response?.data?.success) throw new Error(response?.data?.message);
        return response.data.data;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Could not fetch live classes");
        return [];
    }
};

// Update a live class
export const updateLiveClass = async (token, data) => {
    const toastId = toast.loading("Updating live class...");
    try {
        const response = await apiConnector("PUT", UPDATE_LIVE_CLASS_API, data, {
            Authorization: `Bearer ${token}`,
        });
        if (!response?.data?.success) throw new Error(response?.data?.message);
        toast.success("Live class updated!");
        return response.data.data;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to update live class");
        return null;
    } finally {
        toast.dismiss(toastId);
    }
};

// Delete a live class
export const deleteLiveClass = async (token, liveClassId) => {
    const toastId = toast.loading("Deleting live class...");
    try {
        const response = await apiConnector("DELETE", DELETE_LIVE_CLASS_API, { liveClassId }, {
            Authorization: `Bearer ${token}`,
        });
        if (!response?.data?.success) throw new Error(response?.data?.message);
        toast.success("Live class deleted");
        return true;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to delete live class");
        return false;
    } finally {
        toast.dismiss(toastId);
    }
};

// Get all public live classes (for students)
export const getPublicLiveClasses = async () => {
    try {
        const response = await apiConnector("GET", GET_PUBLIC_LIVE_CLASSES_API);
        if (!response?.data?.success) throw new Error(response?.data?.message);
        return response.data.data;
    } catch (error) {
        toast.error("Could not fetch live classes");
        return [];
    }
};
