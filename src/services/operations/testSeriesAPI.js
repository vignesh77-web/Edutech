import { toast } from "react-hot-toast"
import { apiConnector } from "../apiconnector"

const BASE_URL = process.env.REACT_APP_BASE_URL

export const testSeriesEndpoints = {
    // TEST SERIES ENDPOINTS
    CREATE_TEST_SERIES_API: BASE_URL + "/course/testSeries/create",
    GET_INSTRUCTOR_TEST_SERIES_API: BASE_URL + "/course/testSeries/instructor",
    UPDATE_TEST_SERIES_API: BASE_URL + "/course/testSeries/update",
    DELETE_TEST_SERIES_API: BASE_URL + "/course/testSeries/delete",
    GET_ALL_PUBLIC_TEST_SERIES_API: BASE_URL + "/course/testSeries/public",
    ADD_TEST_TO_SERIES_API: BASE_URL + "/course/testSeries/addTest",
    EVALUATE_TEST_API: BASE_URL + "/course/testSeries/evaluate",
}

const {
    CREATE_TEST_SERIES_API,
    GET_INSTRUCTOR_TEST_SERIES_API,
    UPDATE_TEST_SERIES_API,
    DELETE_TEST_SERIES_API,
    GET_ALL_PUBLIC_TEST_SERIES_API,
    ADD_TEST_TO_SERIES_API,
    EVALUATE_TEST_API,
} = testSeriesEndpoints

export const createTestSeries = async (data, token) => {
    const toastId = toast.loading("Creating Test Series...")
    let result = null
    try {
        const response = await apiConnector("POST", CREATE_TEST_SERIES_API, data, {
            Authorization: `Bearer ${token}`,
        })
        if (!response?.data?.success) {
            throw new Error("Could Not Create Test Series")
        }
        toast.success("Test Series Created Successfully")
        result = response?.data?.data
    } catch (error) {
        console.log("CREATE TEST SERIES API ERROR............", error)
        toast.error(error.message)
    }
    toast.dismiss(toastId)
    return result
}

export const getInstructorTestSeries = async (token) => {
    let result = []
    try {
        const response = await apiConnector("GET", GET_INSTRUCTOR_TEST_SERIES_API, null, {
            Authorization: `Bearer ${token}`,
        })
        if (!response?.data?.success) {
            throw new Error("Could Not Fetch Instructor Test Series")
        }
        result = response?.data?.data
    } catch (error) {
        console.log("GET INSTRUCTOR TEST SERIES API ERROR............", error)
        toast.error(error.message)
    }
    return result
}

export const updateTestSeries = async (data, token) => {
    const toastId = toast.loading("Updating Test Series...")
    let result = null
    try {
        const response = await apiConnector("PUT", UPDATE_TEST_SERIES_API, data, {
            Authorization: `Bearer ${token}`,
        })
        if (!response?.data?.success) {
            throw new Error("Could Not Update Test Series")
        }
        toast.success("Test Series Updated Successfully")
        result = response?.data?.data
    } catch (error) {
        console.log("UPDATE TEST SERIES API ERROR............", error)
        toast.error(error.message)
    }
    toast.dismiss(toastId)
    return result
}

export const deleteTestSeries = async (data, token) => {
    const toastId = toast.loading("Deleting Test Series...")
    let result = false
    try {
        const response = await apiConnector("DELETE", DELETE_TEST_SERIES_API, data, {
            Authorization: `Bearer ${token}`,
        })
        if (!response?.data?.success) {
            throw new Error("Could Not Delete Test Series")
        }
        toast.success("Test Series Deleted")
        result = true
    } catch (error) {
        console.log("DELETE TEST SERIES API ERROR............", error)
        toast.error(error.message)
    }
    toast.dismiss(toastId)
    return result
}

export const getAllPublicTestSeries = async () => {
    let result = []
    try {
        const response = await apiConnector("GET", GET_ALL_PUBLIC_TEST_SERIES_API)
        if (!response?.data?.success) {
            throw new Error("Could Not Fetch Public Test Series")
        }
        result = response?.data?.data
    } catch (error) {
        console.log("GET ALL PUBLIC TEST SERIES API ERROR............", error)
    }
    return result
}

export const addTestToSeries = async (data, token) => {
    const toastId = toast.loading("Adding Test...")
    let result = null
    try {
        const response = await apiConnector("POST", ADD_TEST_TO_SERIES_API, data, {
            Authorization: `Bearer ${token}`,
        })
        if (!response?.data?.success) {
            throw new Error("Could Not Add Test")
        }
        toast.success("Test Added Successfully")
        result = response?.data?.data
    } catch (error) {
        console.log("ADD TEST TO SERIES API ERROR............", error)
        toast.error(error.message)
    }
    toast.dismiss(toastId)
    return result
}

export const evaluateTest = async (data, token) => {
    const toastId = toast.loading("Evaluating Test...")
    let result = null
    try {
        const response = await apiConnector("POST", EVALUATE_TEST_API, data, {
            Authorization: `Bearer ${token}`,
        })
        if (!response?.data?.success) {
            throw new Error("Could Not Evaluate Test")
        }
        toast.success("Test Submitted Successfully")
        result = response?.data?.data
    } catch (error) {
        console.log("EVALUATE TEST API ERROR............", error)
        toast.error(error.message)
    }
    toast.dismiss(toastId)
    return result
}
