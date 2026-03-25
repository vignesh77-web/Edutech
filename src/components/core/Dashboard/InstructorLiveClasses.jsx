import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiVideo, FiCalendar, FiClock } from "react-icons/fi";
import { MdLiveTv } from "react-icons/md";
import {
    createLiveClass,
    getInstructorLiveClasses,
    updateLiveClass,
    deleteLiveClass,
} from "../../../services/operations/liveClassAPI";
import { fetchInstructorCourses } from "../../../services/operations/courseDetailsAPI";

const STATUS_COLORS = {
    upcoming: "bg-blue-500",
    live: "bg-caribbeangreen-400 animate-pulse",
    completed: "bg-richblack-400",
    cancelled: "bg-pink-400",
};

const emptyForm = {
    title: "",
    description: "",
    courseId: "",
    scheduledAt: "",
    duration: 60,
    price: 0,
    meetingLink: "",
};

export default function InstructorLiveClasses() {
    const { token } = useSelector((state) => state.auth);

    const [liveClasses, setLiveClasses] = useState([]);
    const [instructorCourses, setInstructorCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [classes, courses] = await Promise.all([
            getInstructorLiveClasses(token),
            fetchInstructorCourses(token),
        ]);
        setLiveClasses(classes || []);
        setInstructorCourses(courses || []);
        setLoading(false);
    };

    const handleOpenCreate = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(true);
    };

    const handleOpenEdit = (lc) => {
        setForm({
            title: lc.title,
            description: lc.description || "",
            courseId: lc.courseId?._id || lc.courseId || "",
            scheduledAt: new Date(lc.scheduledAt).toISOString().slice(0, 16),
            duration: lc.duration,
            price: lc.price,
            meetingLink: lc.meetingLink || "",
        });
        setEditingId(lc._id);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        let result;
        if (editingId) {
            result = await updateLiveClass(token, { liveClassId: editingId, ...form });
        } else {
            result = await createLiveClass(token, form);
        }
        if (result) {
            await loadData();
            setShowForm(false);
            setEditingId(null);
        }
        setSubmitting(false);
    };

    const handleDelete = async (id) => {
        const ok = await deleteLiveClass(token, id);
        if (ok) {
            setLiveClasses((prev) => prev.filter((lc) => lc._id !== id));
        }
        setDeleteConfirm(null);
    };

    return (
        <div className="text-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-richblack-5 flex items-center gap-3">
                        <MdLiveTv className="text-yellow-50" /> Manage Live Classes
                    </h1>
                    <p className="text-richblack-300 mt-1 text-sm">Schedule and manage all your live sessions</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 bg-yellow-50 text-richblack-900 px-5 py-2.5 rounded-lg font-semibold hover:scale-95 transition-all"
                >
                    <FiPlus /> Schedule New
                </button>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {["upcoming", "live", "completed", "cancelled"].map((s) => (
                    <div key={s} className="bg-richblack-800 rounded-xl p-4 border border-richblack-700 text-center">
                        <p className="text-2xl font-bold text-richblack-5">
                            {liveClasses.filter((lc) => lc.status === s).length}
                        </p>
                        <p className="text-richblack-300 text-sm capitalize">{s}</p>
                    </div>
                ))}
            </div>

            {/* Class list */}
            {loading ? (
                <div className="text-center py-20 text-richblack-400">Loading...</div>
            ) : liveClasses.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-richblack-700 rounded-xl">
                    <MdLiveTv className="text-6xl text-richblack-500 mx-auto mb-4" />
                    <p className="text-richblack-400">No live classes scheduled yet</p>
                    <button onClick={handleOpenCreate} className="mt-4 text-yellow-50 underline text-sm">
                        Schedule your first class
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {liveClasses.map((lc) => (
                        <div
                            key={lc._id}
                            className="bg-richblack-800 border border-richblack-700 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-richblack-500 transition-all"
                        >
                            <div className="flex gap-4 items-start">
                                <div className="p-3 bg-richblack-700 rounded-lg mt-1">
                                    <FiVideo className="text-yellow-50 text-xl" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-lg font-semibold text-richblack-5">{lc.title}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full text-white ${STATUS_COLORS[lc.status] || "bg-richblack-500"}`}>
                                            {lc.status}
                                        </span>
                                    </div>
                                    {lc.courseId && (
                                        <p className="text-richblack-400 text-sm mt-0.5">
                                            Course: {lc.courseId.courseName}
                                        </p>
                                    )}
                                    <div className="flex gap-4 mt-2 text-richblack-400 text-sm flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <FiCalendar />
                                            {new Date(lc.scheduledAt).toLocaleString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <FiClock />
                                            {lc.duration} min
                                        </span>
                                        {lc.price > 0 && (
                                            <span className="text-yellow-50 font-semibold">₹{lc.price}</span>
                                        )}
                                        {lc.price === 0 && (
                                            <span className="text-caribbeangreen-200 text-xs">Free</span>
                                        )}
                                    </div>
                                    {lc.meetingLink && (
                                        <a
                                            href={lc.meetingLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-400 text-xs underline mt-1 block"
                                        >
                                            {lc.meetingLink}
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2 items-center shrink-0">
                                <button
                                    onClick={() => handleOpenEdit(lc)}
                                    className="p-2 bg-richblack-700 hover:bg-richblack-600 rounded-lg transition-all"
                                    title="Edit"
                                >
                                    <FiEdit2 className="text-yellow-50" />
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(lc._id)}
                                    className="p-2 bg-richblack-700 hover:bg-pink-900 rounded-lg transition-all"
                                    title="Delete"
                                >
                                    <FiTrash2 className="text-pink-400" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Schedule / Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
                    <div className="bg-richblack-800 border border-richblack-600 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-richblack-5">
                                {editingId ? "Edit Live Class" : "Schedule Live Class"}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="text-richblack-400 hover:text-richblack-100">
                                <FiX className="text-2xl" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="text-sm text-richblack-200 mb-1 block">Title *</label>
                                <input
                                    required
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="e.g. React Hooks Deep Dive"
                                    className="w-full bg-richblack-700 border border-richblack-600 rounded-lg px-4 py-2.5 text-richblack-5 focus:outline-none focus:border-yellow-50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-richblack-200 mb-1 block">Linked Course (optional)</label>
                                <select
                                    value={form.courseId}
                                    onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                                    className="w-full bg-richblack-700 border border-richblack-600 rounded-lg px-4 py-2.5 text-richblack-5 focus:outline-none focus:border-yellow-50 transition-all"
                                >
                                    <option value="">-- No specific course --</option>
                                    {instructorCourses.map((c) => (
                                        <option key={c._id} value={c._id}>{c.courseName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-richblack-200 mb-1 block">Description</label>
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="What will you cover in this session?"
                                    className="w-full bg-richblack-700 border border-richblack-600 rounded-lg px-4 py-2.5 text-richblack-5 focus:outline-none focus:border-yellow-50 transition-all resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-richblack-200 mb-1 block">Date & Time *</label>
                                    <input
                                        required
                                        type="datetime-local"
                                        value={form.scheduledAt}
                                        onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                                        className="w-full bg-richblack-700 border border-richblack-600 rounded-lg px-3 py-2.5 text-richblack-5 focus:outline-none focus:border-yellow-50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-richblack-200 mb-1 block">Duration (minutes)</label>
                                    <input
                                        type="number"
                                        min={15}
                                        value={form.duration}
                                        onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 60 })}
                                        className="w-full bg-richblack-700 border border-richblack-600 rounded-lg px-4 py-2.5 text-richblack-5 focus:outline-none focus:border-yellow-50 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-richblack-200 mb-1 block">Price (₹) — 0 = Free</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={form.price}
                                        onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-richblack-700 border border-richblack-600 rounded-lg px-4 py-2.5 text-richblack-5 focus:outline-none focus:border-yellow-50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-richblack-200 mb-1 block">Meeting Link</label>
                                    <input
                                        type="url"
                                        value={form.meetingLink}
                                        onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
                                        placeholder="https://meet.google.com/..."
                                        className="w-full bg-richblack-700 border border-richblack-600 rounded-lg px-4 py-2.5 text-richblack-5 focus:outline-none focus:border-yellow-50 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 border border-richblack-600 rounded-lg py-2.5 text-richblack-300 hover:bg-richblack-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 bg-yellow-50 text-richblack-900 rounded-lg py-2.5 font-semibold hover:scale-95 transition-all disabled:opacity-60"
                                >
                                    {submitting ? "Saving..." : editingId ? "Save Changes" : "Schedule"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
                    <div className="bg-richblack-800 border border-pink-500 rounded-2xl p-6 w-full max-w-sm text-center">
                        <FiTrash2 className="text-pink-400 text-4xl mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-richblack-5 mb-1">Delete Live Class?</h3>
                        <p className="text-richblack-400 text-sm mb-6">This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 border border-richblack-600 rounded-lg py-2 text-richblack-300 hover:bg-richblack-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="flex-1 bg-pink-600 hover:bg-pink-700 rounded-lg py-2 text-white font-semibold transition-all"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
