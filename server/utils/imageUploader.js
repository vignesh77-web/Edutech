const cloudinary = require('cloudinary').v2

/**
 * Determine resource type based on file extension
 */
const getResourceType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    
    // Image formats
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico'].includes(ext)) {
        return 'image';
    }
    
    // Video formats
    if (['mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'webm', 'ogv'].includes(ext)) {
        return 'video';
    }
    
    // Raw formats (PDFs, documents, etc.)
    // Includes: pdf, doc, docx, xls, xlsx, ppt, pptx, txt, csv, zip, rar, etc.
    return 'raw';
};

exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
    const options = { folder };
    if (height) {
        options.height = height;
    }
    if (quality) {
        options.quality = quality;
    }
    
    // IMPORTANT: Set correct resource_type based on file extension
    // This prevents "auto" detection issues that cause 401/404 errors on download
    options.resource_type = getResourceType(file.name);
    
    console.log(`[Upload] File: ${file.name}, Resource Type: ${options.resource_type}`);

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_large(file.tempFilePath, {
            ...options,
            chunk_size: 6000000, // Chunk size set to 6MB
        }, (error, result) => {
            if (error) {
                console.error(`[Upload] Error uploading ${file.name}:`, error.message);
                return reject(error);
            }
            console.log(`[Upload] Success: ${file.name} uploaded as ${options.resource_type}`);
            resolve(result);
        });
    });
}