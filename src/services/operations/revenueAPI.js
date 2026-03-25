import { toast } from "react-hot-toast";
import { studentEndpoints } from "../apis";
import { apiConnector } from "../apiconnector";
import { getUserDetails } from "./profileAPI";

const {
    SETUP_FEE_CAPTURE_API,
    SETUP_FEE_VERIFY_API,
    TEST_SERIES_CAPTURE_API,
    TEST_SERIES_VERIFY_API,
    SUBSCRIPTION_CAPTURE_API,
    SUBSCRIPTION_VERIFY_API,
    ADDON_CAPTURE_API,
    ADDON_VERIFY_API
} = studentEndpoints;

function loadScript(src) {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    })
}

export async function paySetupFee(token, userDetails, navigate, dispatch) {
    const toastId = toast.loading("Processing Setup Fee...");
    try {
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!res) {
            toast.error("RazorPay SDK failed to load");
            return;
        }

        const orderResponse = await apiConnector("POST", SETUP_FEE_CAPTURE_API, {}, {
            Authorization: `Bearer ${token}`,
        });

        if (!orderResponse.data.success) throw new Error(orderResponse.data.message);

        const { amount, currency, id: order_id } = orderResponse.data.data;
        const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY;

        const options = {
            key: razorpayKey,
            currency: currency,
            amount: `${amount}`,
            order_id: order_id,
            name: "EduTech Platform",
            description: "One-time Instructor Setup Fee",
            handler: function (response) {
                verifySetupFee(response, token, navigate, dispatch);
            }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    } catch (error) {
        toast.error(error.message || "Could not pay setup fee");
    }
    toast.dismiss(toastId);
}

async function verifySetupFee(bodyData, token, navigate, dispatch) {
    const toastId = toast.loading("Verifying Payment...");
    try {
        const response = await apiConnector("POST", SETUP_FEE_VERIFY_API, bodyData, {
            Authorization: `Bearer ${token}`,
        });

        if (!response.data.success) throw new Error(response.data.message);
        toast.success("Setup Fee Paid Successfully!");

        // Fetch fresh user details to update Redux and localStorage
        dispatch(getUserDetails(token, navigate))

        navigate("/dashboard/instructor");
    } catch (error) {
        toast.error("Could not verify Setup Fee Payment");
    }
    toast.dismiss(toastId);
}

export async function buyTestSeries(token, testSeriesId, userDetails, navigate) {
    const toastId = toast.loading("Processing...");
    try {
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!res) {
            toast.error("RazorPay SDK failed to load");
            return;
        }

        const orderResponse = await apiConnector("POST", TEST_SERIES_CAPTURE_API, { testSeriesId }, {
            Authorization: `Bearer ${token}`,
        });

        if (!orderResponse.data.success) throw new Error(orderResponse.data.message);

        const { amount, currency, id: order_id } = orderResponse.data.data;
        const options = {
            key: process.env.REACT_APP_RAZORPAY_KEY,
            currency: currency,
            amount: `${amount}`,
            order_id: order_id,
            name: "EduTech",
            description: "Test Series Purchase",
            handler: function (response) {
                verifyTestSeries(response, testSeriesId, token, navigate);
            }
        };
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    } catch (error) {
        toast.error(error.message);
    }
    toast.dismiss(toastId);
}

async function verifyTestSeries(bodyData, testSeriesId, token, navigate) {
    try {
        const response = await apiConnector("POST", TEST_SERIES_VERIFY_API, { ...bodyData, testSeriesId }, {
            Authorization: `Bearer ${token}`,
        });
        if (response.data.success) {
            toast.success("Test Series Purchased!");
            navigate("/dashboard/enrolled-courses");
        }
    } catch (error) {
        toast.error("Verification failed");
    }
}

export async function buySubscription(token, subscriptionId, navigate) {
    const toastId = toast.loading("Processing...");
    try {
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!res) {
            toast.error("RazorPay SDK failed to load");
            return;
        }

        const orderResponse = await apiConnector("POST", SUBSCRIPTION_CAPTURE_API, { subscriptionId }, {
            Authorization: `Bearer ${token}`,
        });

        if (!orderResponse.data.success) throw new Error(orderResponse.data.message);

        const { amount, currency, id: order_id } = orderResponse.data.data;
        const options = {
            key: process.env.REACT_APP_RAZORPAY_KEY,
            currency: currency,
            amount: `${amount}`,
            order_id: order_id,
            name: "EduTech",
            description: "Subscription Purchase",
            handler: function (response) {
                verifySubscription(response, subscriptionId, token, navigate);
            }
        };
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    } catch (error) {
        toast.error(error.message);
    }
    toast.dismiss(toastId);
}

async function verifySubscription(bodyData, subscriptionId, token, navigate) {
    try {
        const response = await apiConnector("POST", SUBSCRIPTION_VERIFY_API, { ...bodyData, subscriptionId }, {
            Authorization: `Bearer ${token}`,
        });
        if (response.data.success) {
            toast.success("Subscription Activated!");
            navigate("/dashboard/enrolled-courses");
        }
    } catch (error) {
        toast.error("Activation failed");
    }
}

export async function buyAddOn(token, type, amount, instructorId, navigate) {
    const toastId = toast.loading("Processing...");
    try {
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!res) {
            toast.error("RazorPay SDK failed to load");
            return;
        }

        const orderResponse = await apiConnector("POST", ADDON_CAPTURE_API, { type, amount }, {
            Authorization: `Bearer ${token}`,
        });

        if (!orderResponse.data.success) throw new Error(orderResponse.data.message);

        const { amount: orderAmount, currency, id: order_id } = orderResponse.data.data;
        const options = {
            key: process.env.REACT_APP_RAZORPAY_KEY,
            currency: currency,
            amount: `${orderAmount}`,
            order_id: order_id,
            name: "EduTech",
            description: `${type} Purchase`,
            handler: function (response) {
                verifyAddOn(response, type, amount, instructorId, token, navigate);
            }
        };
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    } catch (error) {
        toast.error(error.message);
    }
    toast.dismiss(toastId);
}

async function verifyAddOn(bodyData, type, amount, instructorId, token, navigate) {
    try {
        const response = await apiConnector("POST", ADDON_VERIFY_API, { ...bodyData, type, amount, instructorId }, {
            Authorization: `Bearer ${token}`,
        });
        if (response.data.success) {
            toast.success(`${type} Purchased!`);
            navigate("/dashboard/enrolled-courses");
        }
    } catch (error) {
        toast.error("Verification failed");
    }
}

