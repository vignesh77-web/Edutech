import { toast } from "react-hot-toast";
import { apiConnector } from "../apiconnector";
import { lectureQaEndpoints } from "../apis";

const { ASK_QUESTION_API, GET_QUESTIONS_API, ANSWER_QUESTION_API } = lectureQaEndpoints;

export const askQuestion = async (data, token) => {
    let result = null;
    try {
        const response = await apiConnector("POST", ASK_QUESTION_API, data, {
            Authorization: `Bearer ${token}`
        });

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        toast.success("Question posted successfully");
        result = response?.data?.data;
    } catch (error) {
        console.log("ASK_QUESTION_API API ERROR............", error);
        toast.error(error.response?.data?.message || "Could not post question");
    }
    return result;
}

export const getQuestionsForLecture = async (subSectionId, token) => {
    let result = [];
    try {
        const response = await apiConnector("GET", `${GET_QUESTIONS_API}?subSectionId=${subSectionId}`, null, {
            Authorization: `Bearer ${token}`
        });

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        result = response?.data?.data;
    } catch (error) {
        console.log("GET_QUESTIONS_API API ERROR............", error);
    }
    return result;
}

export const answerQuestion = async (data, token) => {
    let result = null;
    try {
        const response = await apiConnector("POST", ANSWER_QUESTION_API, data, {
            Authorization: `Bearer ${token}`
        });

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        toast.success("Answer posted successfully");
        result = response?.data?.data;
    } catch (error) {
        console.log("ANSWER_QUESTION_API API ERROR............", error);
        toast.error(error.response?.data?.message || "Could not post answer");
    }
    return result;
}
