import { toast } from "react-hot-toast";
import { apiConnector } from "../apiconnector";
import { videoNotesEndpoints } from "../apis";

const { ADD_VIDEO_NOTE_API, GET_VIDEO_NOTES_API, DELETE_VIDEO_NOTE_API } = videoNotesEndpoints;

export const addVideoNote = async (data, token) => {
    let result = null;
    try {
        const response = await apiConnector("POST", ADD_VIDEO_NOTE_API, data, {
            Authorization: `Bearer ${token}`
        });

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        toast.success("Note added successfully");
        result = response?.data?.data;
    } catch (error) {
        console.log("ADD_VIDEO_NOTE_API API ERROR............", error);
        toast.error(error.response?.data?.message || "Could not add note");
    }
    return result;
}

export const getVideoNotes = async (subSectionId, token) => {
    let result = [];
    try {
        const response = await apiConnector("GET", `${GET_VIDEO_NOTES_API}?subSectionId=${subSectionId}`, null, {
            Authorization: `Bearer ${token}`
        });

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        result = response?.data?.data;
    } catch (error) {
        console.log("GET_VIDEO_NOTES_API API ERROR............", error);
    }
    return result;
}

export const deleteVideoNote = async (noteId, token) => {
    let success = false;
    try {
        const response = await apiConnector("DELETE", DELETE_VIDEO_NOTE_API, { noteId }, {
            Authorization: `Bearer ${token}`
        });

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        toast.success("Note deleted");
        success = true;
    } catch (error) {
        console.log("DELETE_VIDEO_NOTE_API API ERROR............", error);
        toast.error(error.response?.data?.message || "Could not delete note");
    }
    return success;
}
