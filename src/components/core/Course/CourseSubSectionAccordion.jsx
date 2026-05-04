import React from "react"
import { HiOutlineVideoCamera, HiOutlineDocumentText } from "react-icons/hi"

function CourseSubSectionAccordion({ subSec }) {
  const formatDuration = (secondsStr) => {
    const seconds = parseInt(secondsStr, 10);
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' + s : s}`;
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between py-2">
        <div className={`flex items-center gap-2`}>
          <span>
            <HiOutlineVideoCamera className="text-xl" />
          </span>
          <p>{subSec?.title}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-richblack-100">
            {formatDuration(subSec?.timeDuration)}
          </span>
        </div>
      </div>
      {/* Resources Render */}
      {subSec?.resources?.map((res, idx) => (
        <div key={idx} className="flex justify-between py-2 pl-6">
          <div className={`flex items-center gap-2`}>
            <span>
              <HiOutlineDocumentText className="text-lg text-richblack-100" />
            </span>
            <p className="text-sm text-richblack-100">{res?.name}</p>
          </div>
          <div><span className="text-sm font-medium text-richblack-300">Resource</span></div>
        </div>
      ))}
    </div>
  )
}

export default CourseSubSectionAccordion