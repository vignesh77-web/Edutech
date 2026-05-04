const { URL } = require("url");
const cloudinary = require("cloudinary").v2;
const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

const configureCloudinary = () => {
  if (!cloudinary.config().api_key) {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });
  }
};

const parseCloudinaryPublicId = (fileUrl) => {
  try {
    const parsed = new URL(fileUrl);
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    const resourceTypeFromUrl = pathParts.length > 1 ? pathParts[1] : pathParts[0];
    const uploadIndex = pathParts.indexOf("upload");
    const versionIndex = pathParts.findIndex(
      (part, index) => index > uploadIndex && /^v\d+$/.test(part)
    );
    const publicIdStartIndex = versionIndex !== -1
      ? versionIndex + 1
      : (uploadIndex !== -1 ? uploadIndex + 1 : 3);
    const publicIdWithExt = pathParts.slice(publicIdStartIndex).join("/");
    const lastDotIndex = publicIdWithExt.lastIndexOf(".");
    const publicId = lastDotIndex !== -1
      ? publicIdWithExt.substring(0, lastDotIndex)
      : publicIdWithExt;
    const resourceType = ["image", "video", "raw"].includes(resourceTypeFromUrl)
      ? resourceTypeFromUrl
      : "raw";
    return { publicId, resourceType };
  } catch (error) {
    return null;
  }
};

// Create a new sub-section for a given section
exports.createSubSection = async (req, res) => {
  try {
    // Extract necessary information from the request body
    const { sectionId, title, description } = req.body

    // Check if req.files exists and has a video
    if (!req.files || !req.files.video) {
      console.error("Video file not found in request. req.files:", req.files)
      return res
        .status(400)
        .json({ success: false, message: "Video file is required" })
    }

    const video = req.files.video

    // Check if all necessary fields are provided
    if (!sectionId || !title || !description) {
      return res
        .status(400)
        .json({ success: false, message: "Section ID, Title, and Description are required" })
    }

    // Upload the video file to Cloudinary
    console.log("Uploading video file:", video.name)
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    )
    console.log("Video uploaded successfully:", uploadDetails)

    let resources = []
    if (req.files && req.files.courseResource) {
      try {
        const resourceFile = req.files.courseResource
        console.log("Uploading resource file:", resourceFile.name)
        const resourceUploadDetails = await uploadImageToCloudinary(
          resourceFile,
          process.env.FOLDER_NAME
        )
        
        // IMPORTANT: Validate that upload actually succeeded
        if (!resourceUploadDetails || !resourceUploadDetails.secure_url) {
          console.error("Resource upload failed: No secure_url returned", resourceUploadDetails)
          return res.status(500).json({ 
            success: false, 
            message: "Failed to upload resource file. Please try again.",
            details: "Upload service returned no valid URL"
          })
        }
        
        resources.push({
          name: resourceFile.name,
          fileUrl: resourceUploadDetails.secure_url,
        })
        console.log("Resource uploaded successfully:", resourceFile.name, "URL:", resourceUploadDetails.secure_url)
      } catch (resourceError) {
        console.error("Error uploading resource file:", resourceError.message)
        console.error("Stack:", resourceError.stack)
        // If user provided a resource but upload failed, return error
        return res.status(500).json({ 
          success: false, 
          message: "Failed to upload resource file. Please try again.",
          details: resourceError.message
        })
      }
    }

    let captionUrl = null
    if (req.files && req.files.captionFile) {
      try {
        const cFile = req.files.captionFile
        console.log("Uploading caption file:", cFile.name)
        const captionUploadDetails = await uploadImageToCloudinary(
          cFile,
          process.env.FOLDER_NAME
        )
        captionUrl = captionUploadDetails.secure_url
        console.log("Caption uploaded successfully:", cFile.name)
      } catch (captionError) {
        console.error("Error uploading caption file:", captionError)
        // Continue without caption if upload fails (caption is optional)
      }
    }

    // Create a new sub-section with the necessary information
    const SubSectionDetails = await SubSection.create({
      title: title,
      timeDuration: `${uploadDetails.duration}`,
      description: description,
      videoUrl: uploadDetails.secure_url,
      resources: resources,
      captionUrl: captionUrl,
    })

    // Update the corresponding section with the newly created sub-section
    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      { $push: { subSection: SubSectionDetails._id } },
      { new: true }
    ).populate("subSection")

    // Return the updated section in the response
    return res.status(200).json({ success: true, data: updatedSection })
  } catch (error) {
    // Handle any errors that may occur during the process
    console.error("Error creating new sub-section:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

//Update subsection
exports.updateSubSection = async (req, res) => {
    try {
      const { sectionId, subSectionId, title, description } = req.body
      const subSection = await SubSection.findById(subSectionId)
  
      if (!subSection) {
        return res.status(404).json({
          success: false,
          message: "SubSection not found",
        })
      }
  
      if (title !== undefined) {
        subSection.title = title
      }
  
      if (description !== undefined) {
        subSection.description = description
      }

      // Handle video upload
      if (req.files && req.files.video) {
        try {
          const video = req.files.video
          console.log("Uploading updated video:", video.name)
          const uploadDetails = await uploadImageToCloudinary(
            video,
            process.env.FOLDER_NAME
          )
          subSection.videoUrl = uploadDetails.secure_url
          subSection.timeDuration = `${uploadDetails.duration}`
          console.log("Video updated successfully")
        } catch (videoError) {
          console.error("Error uploading video:", videoError)
          return res.status(400).json({
            success: false,
            message: "Error uploading video file",
            error: videoError.message,
          })
        }
      }

      // Handle resource upload
      if (req.files && req.files.courseResource) {
        try {
          const resourceFile = req.files.courseResource
          console.log("Uploading new resource:", resourceFile.name)
          const resourceUploadDetails = await uploadImageToCloudinary(
            resourceFile,
            process.env.FOLDER_NAME
          )
          
          // IMPORTANT: Validate that upload actually succeeded
          if (!resourceUploadDetails || !resourceUploadDetails.secure_url) {
            console.error("Resource upload failed: No secure_url returned", resourceUploadDetails)
            return res.status(500).json({ 
              success: false, 
              message: "Failed to upload resource file. Please try again.",
              details: "Upload service returned no valid URL"
            })
          }
          
          subSection.resources.push({
            name: resourceFile.name,
            fileUrl: resourceUploadDetails.secure_url,
          })
          console.log("Resource uploaded successfully, URL:", resourceUploadDetails.secure_url)
        } catch (resourceError) {
          console.error("Error uploading resource:", resourceError.message)
          console.error("Stack:", resourceError.stack)
          // If user provided a resource but upload failed, return error
          return res.status(500).json({ 
            success: false, 
            message: "Failed to upload resource file. Please try again.",
            details: resourceError.message
          })
        }
      }

      // Handle caption upload
      if (req.files && req.files.captionFile) {
        try {
          const cFile = req.files.captionFile
          console.log("Uploading caption file:", cFile.name)
          const captionUploadDetails = await uploadImageToCloudinary(
            cFile,
            process.env.FOLDER_NAME
          )
          subSection.captionUrl = captionUploadDetails.secure_url
          console.log("Caption updated successfully")
        } catch (captionError) {
          console.error("Error uploading caption:", captionError)
          // Continue without caption if upload fails (caption is optional)
        }
      }
  
      await subSection.save()

      const updatedSection = await Section.findById(sectionId).populate("subSection")

      return res.json({
        success: true,
        data: updatedSection,
        message: "Section updated successfully",
      })
    } catch (error) {
      console.error("Error updating sub-section:", error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the section",
        error: error.message,
      })
    }
  }

  exports.deleteSubSectionResource = async (req, res) => {
    try {
      const { subSectionId, sectionId, fileUrl } = req.body
      if (!subSectionId || !sectionId || !fileUrl) {
        return res.status(400).json({
          success: false,
          message: "subSectionId, sectionId, and fileUrl are required",
        })
      }

      const subSection = await SubSection.findById(subSectionId)
      if (!subSection) {
        return res.status(404).json({
          success: false,
          message: "SubSection not found",
        })
      }

      const resources = Array.isArray(subSection.resources)
        ? subSection.resources
        : []
      const resourceIndex = resources.findIndex(
        (resource) => resource.fileUrl === fileUrl
      )
      if (resourceIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Resource not found in subsection",
        })
      }

      const [removedResource] = resources.splice(resourceIndex, 1)
      subSection.resources = resources
      await subSection.save()

      const parsed = parseCloudinaryPublicId(fileUrl)
      if (parsed?.publicId) {
        try {
          configureCloudinary()
          await cloudinary.uploader.destroy(parsed.publicId, {
            resource_type: parsed.resourceType,
            type: "upload",
          })
          console.log("Deleted resource from Cloudinary:", parsed.publicId)
        } catch (cloudError) {
          console.error("Error deleting resource from Cloudinary:", cloudError)
        }
      } else {
        console.warn("Could not parse Cloudinary public_id for:", fileUrl)
      }

      const updatedSection = await Section.findById(sectionId).populate("subSection")

      return res.json({
        success: true,
        data: updatedSection,
        message: "Resource deleted successfully",
        removedResource: removedResource?.name || null,
      })
    } catch (error) {
      console.error("Error deleting resource from subsection:", error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the resource",
        error: error.message,
      })
    }
  }
  
  //delete subsection
  exports.deleteSubSection = async (req, res) => {
    try {
      const { subSectionId, sectionId } = req.body
      await Section.findByIdAndUpdate(
        { _id: sectionId },
        {
          $pull: {
            subSection: subSectionId,
          },
        }
      )
      const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })
  
      if (!subSection) {
        return res
          .status(404)
          .json({ success: false, message: "SubSection not found" })
      }

      const updatedSection = await Section.findById(sectionId).populate("subSection")
  
      return res.json({
        success: true,
        data:updatedSection,
        message: "SubSection deleted successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the SubSection",
      })
    }
  }