import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { markLectureAsComplete } from '../../../services/operations/courseDetailsAPI';
import { updateCompletedLectures } from '../../../slices/viewCourseSlice';
import { BigPlayButton, Player } from 'video-react';
import 'video-react/dist/video-react.css';
import IconBtn from '../../common/IconBtn';
import LectureQA from './LectureQA';
import VideoNotes from './VideoNotes';
import LectureResources from './LectureResources';

const VideoDetails = () => {

    const { courseId, sectionId, subSectionId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const playerRef = useRef();
    const { token } = useSelector((state) => state.auth);
    const { courseSectionData, courseEntireData, completedLectures } = useSelector((state) => state.viewCourse);

    const [videoData, setVideoData] = useState([]);
    const [videoEnded, setVideoEnded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [previewSource, setPreviewSource] = useState("")
    const [activeTab, setActiveTab] = useState("overview"); // "overview" | "qa" | "notes"

    useEffect(() => {

        const setVideoSpecificDetails = async () => {
            if (!courseSectionData.length)
                return;
            if (!courseId && !sectionId && !subSectionId) {
                navigate("/dashboard/enrolled-courses");
            }
            else {
                //all 3 fields are present

                const filteredData = courseSectionData.filter(
                    (course) => course._id === sectionId
                )

                const filteredVideoData = filteredData?.[0].subSection.filter(
                    (data) => data._id === subSectionId
                )

                setVideoData(filteredVideoData[0]);
                setPreviewSource(courseEntireData.thumbnail)
                setVideoEnded(false);

            }
        }
        setVideoSpecificDetails();

    }, [courseSectionData, courseEntireData, location.pathname, courseId, sectionId, subSectionId, navigate])

    const isFirstVideo = () => {
        const currentSectionIndex = courseSectionData.findIndex(
            (data) => data._id === sectionId
        )

        const currentSubSectionIndex = courseSectionData[currentSectionIndex].subSection.findIndex(
            (data) => data._id === subSectionId
        )
        if (currentSectionIndex === 0 && currentSubSectionIndex === 0) {
            return true;
        }
        else {
            return false;
        }
    }

    const isLastVideo = () => {
        const currentSectionIndex = courseSectionData.findIndex(
            (data) => data._id === sectionId
        )

        const noOfSubSections = courseSectionData[currentSectionIndex].subSection.length;

        const currentSubSectionIndex = courseSectionData[currentSectionIndex].subSection.findIndex(
            (data) => data._id === subSectionId
        )

        if (currentSectionIndex === courseSectionData.length - 1 &&
            currentSubSectionIndex === noOfSubSections - 1) {
            return true;
        }
        else {
            return false;
        }
    }

    const goToNextVideo = () => {
        const currentSectionIndex = courseSectionData.findIndex(
            (data) => data._id === sectionId
        )

        const noOfSubSections = courseSectionData[currentSectionIndex].subSection.length;

        const currentSubSectionIndex = courseSectionData[currentSectionIndex].subSection.findIndex(
            (data) => data._id === subSectionId
        )

        if (currentSubSectionIndex !== noOfSubSections - 1) {
            //same section ki next video me jao
            const nextSubSectionId = courseSectionData[currentSectionIndex].subSection[currentSectionIndex + 1]._id;
            //next video pr jao
            navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`)
        }
        else {
            //different section ki first video
            const nextSectionId = courseSectionData[currentSectionIndex + 1]._id;
            const nextSubSectionId = courseSectionData[currentSectionIndex + 1].subSection[0]._id;
            ///iss voide par jao 
            navigate(`/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`)
        }
    }

    const goToPrevVideo = () => {

        const currentSectionIndex = courseSectionData.findIndex(
            (data) => data._id === sectionId
        )



        const currentSubSectionIndex = courseSectionData[currentSectionIndex].subSection.findIndex(
            (data) => data._id === subSectionId
        )

        if (currentSubSectionIndex !== 0) {
            //same section , prev video
            const prevSubSectionId = courseSectionData[currentSectionIndex].subSection[currentSubSectionIndex - 1];
            //iss video par chalge jao
            navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubSectionId}`)
        }
        else {
            //different section , last video
            const prevSectionId = courseSectionData[currentSectionIndex - 1]._id;
            const prevSubSectionLength = courseSectionData[currentSectionIndex - 1].subSection.length;
            const prevSubSectionId = courseSectionData[currentSectionIndex - 1].subSection[prevSubSectionLength - 1]._id
            //iss video par chalge jao
            navigate(`/view-course/${courseId}/section/${prevSectionId}/sub-section/${prevSubSectionId}`)

        }
    }

    const handleLectureCompletion = async () => {

        ///dummy code, baad me we will replace it witht the actual call
        setLoading(true);
        //PENDING - > Course Progress PENDING
        const res = await markLectureAsComplete({ courseId: courseId, subSectionId: subSectionId }, token);
        //state update
        if (res) {
            dispatch(updateCompletedLectures(subSectionId));
        }
        setLoading(false);
    }
    return (
        <div className="flex flex-col gap-5 text-white">
            {
                !videoData ? (
                    <img
                        src={previewSource}
                        alt="Preview"
                        className="h-full w-full rounded-md object-cover"
                    />
                ) : (
                    <Player
                        ref={playerRef}
                        aspectRatio="16:9"
                        playsInline
                        onEnded={() => setVideoEnded(true)}
                        src={videoData?.videoUrl}
                        crossOrigin="anonymous"
                    >

                        {videoData?.captionUrl && (
                            <track
                                kind="subtitles"
                                src={videoData.captionUrl}
                                srcLang="en"
                                label="English"
                                default
                            />
                        )}

                        <BigPlayButton position="center" />

                        {
                            videoEnded && (
                                <div style={{
                                    backgroundImage:
                                        "linear-gradient(to top, rgb(0, 0, 0), rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.1)",
                                }}
                                    className="full absolute inset-0 z-[100] grid h-full place-content-center font-inter">
                                    {
                                        !completedLectures.includes(subSectionId) && (
                                            <IconBtn
                                                disabled={loading}
                                                onclick={() => handleLectureCompletion()}
                                                text={!loading ? "Mark As Completed" : "Loading..."}
                                                customClasses="text-xl max-w-max px-4 mx-auto"
                                            />
                                        )
                                    }

                                    <IconBtn
                                        disabled={loading}
                                        onclick={() => {
                                            if (playerRef?.current) {
                                                playerRef.current?.seek(0);
                                                setVideoEnded(false);
                                            }
                                        }}
                                        text="Rewatch"
                                        customClasses="text-xl max-w-max px-4 mx-auto mt-2"
                                    />

                                    <div className="mt-10 flex min-w-[250px] justify-center gap-x-4 text-xl">
                                        {!isFirstVideo() && (
                                            <button
                                                disabled={loading}
                                                onClick={goToPrevVideo}
                                                className='blackButton'
                                            >
                                                Prev
                                            </button>
                                        )}
                                        {!isLastVideo() && (
                                            <button
                                                disabled={loading}
                                                onClick={goToNextVideo}
                                                className='blackButton'>
                                                Next
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        }
                    </Player>
                )
            }
            <h1 className="mt-4 text-3xl font-semibold">
                {videoData?.title}
            </h1>

            {/* TABS MENU */}
            <div className="mt-6 flex gap-4 border-b border-richblack-700">
                {["overview", "qa", "notes"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-1 font-semibold text-lg transition-all ${
                            activeTab === tab 
                            ? "text-yellow-50 border-b-2 border-yellow-50" 
                            : "text-richblack-300 hover:text-richblack-100"
                        }`}
                    >
                        {tab === "overview" ? "Overview" : tab === "qa" ? "Q&A" : "My Notes"}
                    </button>
                ))}
            </div>

            {/* TAB PANES */}
            {activeTab === "overview" && (
                <div className="mt-4">
                    <p className="pt-2 pb-6 text-richblack-100">
                        {videoData?.description}
                    </p>
                    <LectureResources resources={videoData?.resources} />
                </div>
            )}

            {activeTab === "qa" && (
                <LectureQA 
                    courseId={courseId} 
                    sectionId={sectionId} 
                    subSectionId={subSectionId} 
                />
            )}

            {activeTab === "notes" && (
                <VideoNotes 
                    courseId={courseId} 
                    subSectionId={subSectionId} 
                    playerRef={playerRef}
                />
            )}
        </div>
    )
}

export default VideoDetails
