import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { MdLiveTv } from 'react-icons/md'
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi'
import { getPublicLiveClasses } from '../../../services/operations/liveClassAPI'
import { buyAddOn } from '../../../services/operations/revenueAPI'

const STATUS_LABELS = {
    upcoming: { label: "Upcoming", cls: "bg-blue-500 text-white" },
    live: { label: "🔴 LIVE NOW", cls: "bg-caribbeangreen-300 text-richblack-900 animate-pulse" },
    completed: { label: "Completed", cls: "bg-richblack-500 text-richblack-50" },
}

export default function LiveClasses() {
    const { token } = useSelector((state) => state.auth)
    const { user } = useSelector((state) => state.profile)
    const navigate = useNavigate()

    const [liveClasses, setLiveClasses] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState("all")

    useEffect(() => {
        loadClasses()
    }, [])

    const loadClasses = async () => {
        setLoading(true)
        const data = await getPublicLiveClasses()
        setLiveClasses(data || [])
        setLoading(false)
    }

    const filtered = filter === "all"
        ? liveClasses
        : liveClasses.filter((lc) => lc.status === filter)

    return (
        <div className="text-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-richblack-5 flex items-center gap-3">
                        <MdLiveTv className="text-yellow-50" /> Live Classes
                    </h1>
                    <p className="text-richblack-300 mt-1 text-sm">Join live sessions from our expert instructors</p>
                </div>
                {/* Filter tabs */}
                <div className="flex gap-2">
                    {["all", "upcoming", "live"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${filter === tab
                                ? "bg-yellow-50 text-richblack-900"
                                : "bg-richblack-700 text-richblack-300 hover:bg-richblack-600"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-richblack-400">Loading live classes...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-richblack-700 rounded-xl">
                    <MdLiveTv className="text-6xl text-richblack-500 mx-auto mb-4" />
                    <p className="text-richblack-400">No live classes available right now</p>
                    <p className="text-richblack-500 text-sm mt-1">Check back soon!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((lc) => {
                        const statusInfo = STATUS_LABELS[lc.status] || STATUS_LABELS.upcoming
                        const instructor = lc.instructorId
                        return (
                            <div
                                key={lc._id}
                                className="rounded-xl border border-richblack-700 bg-richblack-800 p-5 flex flex-col hover:border-richblack-500 transition-all"
                            >
                                {/* Status badge */}
                                <span className={`self-start text-xs px-2.5 py-0.5 rounded-full font-semibold mb-3 ${statusInfo.cls}`}>
                                    {statusInfo.label}
                                </span>

                                {/* Course thumbnail */}
                                {lc.courseId?.thumbnail && (
                                    <img
                                        src={lc.courseId.thumbnail}
                                        alt={lc.courseId.courseName}
                                        className="w-full h-36 object-cover rounded-lg mb-3"
                                    />
                                )}

                                <h2 className="text-lg font-bold text-richblack-5 mb-1">{lc.title}</h2>
                                {lc.description && (
                                    <p className="text-richblack-400 text-sm mb-3 line-clamp-2">{lc.description}</p>
                                )}

                                {/* Meta */}
                                <div className="flex flex-col gap-1.5 text-sm text-richblack-400 mb-4">
                                    {instructor && (
                                        <span className="flex items-center gap-2">
                                            <FiUser className="text-yellow-50" />
                                            {instructor.firstName} {instructor.lastName}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-2">
                                        <FiCalendar className="text-yellow-50" />
                                        {new Date(lc.scheduledAt).toLocaleString()}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <FiClock className="text-yellow-50" />
                                        {lc.duration} minutes
                                    </span>
                                </div>

                                {/* Footer */}
                                <div className="mt-auto flex justify-between items-center gap-2 flex-wrap">
                                    <span className={`text-xl font-bold ${lc.price === 0 ? "text-caribbeangreen-300" : "text-yellow-50"}`}>
                                        {lc.price === 0 ? "Free" : `₹${lc.price}`}
                                    </span>
                                    <div>
                                        {/* LIVE + has link → Join Now */}
                                        {(lc.status === "live" || lc.status === "upcoming") && lc.meetingLink ? (
                                            <a
                                                href={lc.meetingLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={`px-4 py-2 rounded-lg font-bold hover:scale-95 transition-all text-sm inline-block ${lc.status === "live"
                                                        ? "bg-caribbeangreen-300 text-richblack-900"
                                                        : "bg-yellow-50 text-richblack-900"
                                                    }`}
                                            >
                                                {lc.status === "live" ? "🔴 Join Now" : "Join Class"}
                                            </a>
                                        ) : lc.status === "live" ? (
                                            <span className="text-caribbeangreen-300 text-sm font-semibold animate-pulse">Session in progress</span>
                                        ) : lc.status === "upcoming" && lc.price > 0 ? (
                                            // Upcoming paid → Register
                                            <button
                                                onClick={() =>
                                                    buyAddOn(token, "LiveClass", lc.price, lc.instructorId?._id, navigate)
                                                }
                                                className="bg-yellow-50 text-richblack-900 px-4 py-2 rounded-lg font-bold hover:scale-95 transition-all text-sm"
                                            >
                                                Register
                                            </button>
                                        ) : lc.status === "upcoming" ? (
                                            <span className="text-blue-300 text-sm font-medium">
                                                Starts {new Date(lc.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        ) : (
                                            <span className="text-richblack-500 text-sm">Ended</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
