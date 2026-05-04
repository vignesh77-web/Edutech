import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { RxCross2 } from "react-icons/rx"
import { useDispatch, useSelector } from "react-redux"

import {
  createSubSection,
  updateSubSection,
  deleteSubSectionResource,
} from "../../../../../services/operations/courseDetailsAPI"
import { setCourse } from "../../../../../slices/courseSlice"
import IconBtn from "../../../../common/IconBtn"
import Upload from "../Upload"

export default function SubSectionModal({
  modalData,
  setModalData,
  add = false,
  view = false,
  edit = false,
}) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    getValues,
  } = useForm()

  // console.log("view", view)
  // console.log("edit", edit)
  // console.log("add", add)

  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const { token } = useSelector((state) => state.auth)
  const { course } = useSelector((state) => state.course)

  useEffect(() => {
    if (view || edit) {
      // console.log("modalData", modalData)
      setValue("lectureTitle", modalData.title)
      setValue("lectureDesc", modalData.description)
      setValue("lectureVideo", modalData.videoUrl)
    }
  }, [view, edit, modalData, setValue])

  // detect whether form is updated or not
  const isFormUpdated = () => {
    const currentValues = getValues()
    if (
      currentValues.lectureTitle !== modalData.title ||
      currentValues.lectureDesc !== modalData.description ||
      currentValues.lectureVideo !== modalData.videoUrl ||
      (currentValues.courseResource && currentValues.courseResource.length > 0) ||
      (currentValues.captionFile && currentValues.captionFile.length > 0)
    ) {
      return true
    }
    return false
  }

  // handle the editing of subsection
  const handleEditSubsection = async () => {
    const currentValues = getValues()
    const formData = new FormData()
    formData.append("sectionId", modalData.sectionId)
    formData.append("subSectionId", modalData._id)
    
    if (currentValues.lectureTitle !== modalData.title) {
      formData.append("title", currentValues.lectureTitle)
    }
    if (currentValues.lectureDesc !== modalData.description) {
      formData.append("description", currentValues.lectureDesc)
    }
    if (currentValues.lectureVideo && currentValues.lectureVideo !== modalData.videoUrl) {
      formData.append("video", currentValues.lectureVideo)
    }
    if (currentValues.courseResource && currentValues.courseResource.length > 0) {
      formData.append("courseResource", currentValues.courseResource[0])
    }
    if (currentValues.captionFile && currentValues.captionFile.length > 0) {
      formData.append("captionFile", currentValues.captionFile[0])
    }

    // Log FormData contents for debugging
    console.log("Edit FormData contents:")
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value instanceof File ? value.name : value)
    }

    setLoading(true)
    const result = await updateSubSection(formData, token)
    if (result) {
      const updatedCourseContent = course.courseContent.map((section) =>
        section._id === modalData.sectionId ? result : section
      )
      const updatedCourse = { ...course, courseContent: updatedCourseContent }
      dispatch(setCourse(updatedCourse))
    }
    setModalData(null)
    setLoading(false)
  }

  const handleDeleteResource = async () => {
    if (!modalData?.resources?.length) {
      toast.error("No resource to delete")
      return
    }

    const resource = modalData.resources[0]
    const confirmDelete = window.confirm(
      `Delete resource "${resource.name}"? This cannot be undone.`
    )
    if (!confirmDelete) return

    setLoading(true)
    const result = await deleteSubSectionResource(
      {
        sectionId: modalData.sectionId,
        subSectionId: modalData._id,
        fileUrl: resource.fileUrl,
      },
      token
    )
    if (result) {
      const updatedCourseContent = course.courseContent.map((section) =>
        section._id === modalData.sectionId ? result : section
      )
      const updatedCourse = { ...course, courseContent: updatedCourseContent }
      dispatch(setCourse(updatedCourse))
      setModalData(null)
    }
    setLoading(false)
  }

  const onSubmit = async (data) => {
    // console.log(data)
    if (view) return

    // Validate that video file is present for new lectures
    if (!edit && !data.lectureVideo) {
      toast.error("Lecture video is required")
      return
    }

    if (edit) {
      if (!isFormUpdated()) {
        toast.error("No changes made to the form")
      } else {
        handleEditSubsection()
      }
      return
    }

    const formData = new FormData()
    formData.append("sectionId", modalData)
    formData.append("title", data.lectureTitle)
    formData.append("description", data.lectureDesc)
    
    // Only append video if it exists
    if (data.lectureVideo) {
      formData.append("video", data.lectureVideo)
    }
    
    if (data.courseResource && data.courseResource.length > 0) {
      formData.append("courseResource", data.courseResource[0])
    }
    if (data.captionFile && data.captionFile.length > 0) {
      formData.append("captionFile", data.captionFile[0])
    }

    // Log FormData contents for debugging
    console.log("FormData contents:")
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value instanceof File ? value.name : value)
    }

    setLoading(true)
    const result = await createSubSection(formData, token)
    if (result) {
      // update the structure of course
      const updatedCourseContent = course.courseContent.map((section) =>
        section._id === modalData ? result : section
      )
      const updatedCourse = { ...course, courseContent: updatedCourseContent }
      dispatch(setCourse(updatedCourse))
    }
    setModalData(null)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
      <div className="my-10 w-11/12 max-w-[700px] rounded-lg border border-richblack-400 bg-richblack-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between rounded-t-lg bg-richblack-700 p-5">
          <p className="text-xl font-semibold text-richblack-5">
            {view && "Viewing"} {add && "Adding"} {edit && "Editing"} Lecture
          </p>
          <button onClick={() => (!loading ? setModalData(null) : {})}>
            <RxCross2 className="text-2xl text-richblack-5" />
          </button>
        </div>
        {/* Modal Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8 px-8 py-10"
        >
          {/* Lecture Video Upload */}
          <Upload
            name="lectureVideo"
            label="Lecture Video"
            register={register}
            setValue={setValue}
            errors={errors}
            video={true}
            viewData={view ? modalData.videoUrl : null}
            editData={edit ? modalData.videoUrl : null}
          />
          {/* Resource Upload */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor="courseResource">
              Attach Resource (Optional PDF, ZIP, etc)
            </label>
            <input
              type="file"
              id="courseResource"
              disabled={view || loading}
              {...register("courseResource")}
              className="form-style w-full file:bg-richblack-700 file:text-richblack-5 file:border-none file:rounded-md file:px-4 file:py-2"
            />
            {modalData?.resources?.length > 0 && view && (
              <p className="text-xs text-caribbeangreen-200">
                Resource Attached: {modalData.resources[0].name}
              </p>
            )}
            {modalData?.resources?.length > 0 && edit && (
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-yellow-50">
                  Existing Resource: {modalData.resources[0].name} (Uploading a new one will add to it)
                </p>
                <button
                  type="button"
                  onClick={handleDeleteResource}
                  disabled={loading}
                  className="rounded-md border border-pink-200 px-3 py-1 text-xs font-semibold text-pink-200 transition-colors hover:bg-pink-200 hover:text-richblack-900 disabled:opacity-50"
                >
                  Delete Resource
                </button>
              </div>
            )}
          </div>
          {/* Captions Upload */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor="captionFile">
              Video Captions / Subtitles (Optional .vtt, .srt)
            </label>
            <input
              type="file"
              id="captionFile"
              accept=".vtt,.srt"
              disabled={view || loading}
              {...register("captionFile")}
              className="form-style w-full file:bg-richblack-700 file:text-richblack-5 file:border-none file:rounded-md file:px-4 file:py-2"
            />
            {modalData?.captionUrl && view && (
              <p className="text-xs text-caribbeangreen-200">
                Captions are attached.
              </p>
            )}
            {modalData?.captionUrl && edit && (
              <p className="text-xs text-yellow-50">
                Existing Captions will be replaced if you upload a new file.
              </p>
            )}
          </div>
          {/* Lecture Title */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor="lectureTitle">
              Lecture Title {!view && <sup className="text-pink-200">*</sup>}
            </label>
            <input
              disabled={view || loading}
              id="lectureTitle"
              placeholder="Enter Lecture Title"
              {...register("lectureTitle", { required: true })}
              className="form-style w-full"
            />
            {errors.lectureTitle && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Lecture title is required
              </span>
            )}
          </div>
          {/* Lecture Description */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor="lectureDesc">
              Lecture Description{" "}
              <span className="text-richblack-400 text-xs">(Optional)</span>
            </label>
            <textarea
              disabled={view || loading}
              id="lectureDesc"
              placeholder="Enter Lecture Description (optional)"
              {...register("lectureDesc")}
              className="form-style resize-x-none min-h-[130px] w-full"
            />
          </div>
          {!view && (
            <div className="flex justify-end">
              <IconBtn
                disabled={loading}
                text={loading ? "Loading.." : edit ? "Save Changes" : "Save"}
              />
            </div>
          )}
        </form>
      </div>
    </div>
  )
}