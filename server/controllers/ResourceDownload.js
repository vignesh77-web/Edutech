const { URL } = require("url");
const cloudinary = require("cloudinary").v2;
const axios = require("axios");

/**
 * Configure Cloudinary locally.
 */
const configureCloudinary = () => {
    if (!cloudinary.config().api_key) {
        cloudinary.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.API_KEY,
            api_secret: process.env.API_SECRET,
        });
    }
};

/**
 * Determine the correct resource type for Cloudinary based on file format
 */
const getResourceType = (format) => {
    const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico'];
    const videoFormats = ['mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'webm', 'ogv'];
    
    const formatLower = (format || '').toLowerCase();
    
    if (imageFormats.includes(formatLower)) {
        return 'image';
    } else if (videoFormats.includes(formatLower)) {
        return 'video';
    } else {
        // PDF, PPTX, DOCX, and all other files use 'raw'
        return 'raw';
    }
};

/**
 * Get MIME type based on file format
 */
const getMimeType = (format) => {
    const mimeTypes = {
        'pdf': 'application/pdf',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'ppt': 'application/vnd.ms-powerpoint',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'doc': 'application/msword',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'xls': 'application/vnd.ms-excel',
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'mp4': 'video/mp4',
    };
    return mimeTypes[format.toLowerCase()] || 'application/octet-stream';
};

/**
 * Stream file from Cloudinary to client with proper headers
 * Returns: true if success, false if retryable error, or status code to specific error
 */
const streamFileFromCloudinary = async (fileUrl, filename, res, isFirstAttempt, isPreview = false) => {
    try {
        // Clean filename - remove double extensions
        let cleanFilename = filename;
        if (cleanFilename.includes('.pdf.pdf')) {
            cleanFilename = cleanFilename.replace('.pdf.pdf', '.pdf');
        }
        if (cleanFilename.includes('.pptx.pptx')) {
            cleanFilename = cleanFilename.replace('.pptx.pptx', '.pptx');
        }
        if (cleanFilename.includes('.docx.docx')) {
            cleanFilename = cleanFilename.replace('.docx.docx', '.docx');
        }

        const attemptLabel = isFirstAttempt ? "ORIGINAL" : "FALLBACK";
        console.log(`[PDF Download] [${attemptLabel}] Converting URL: ${fileUrl}`);
        console.log(`[PDF Download] [${attemptLabel}] Clean filename: ${cleanFilename}`);
        console.log(`[PDF Download] [${attemptLabel}] URL scheme:`, new URL(fileUrl).protocol);
        console.log(`[PDF Download] [${attemptLabel}] URL host:`, new URL(fileUrl).host);

        // Get file from Cloudinary with axios (handles streaming)
        const response = await axios.get(fileUrl, {
            responseType: 'stream',
            timeout: 30000,
            decompress: false,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': '*/*',
            },
            validateStatus: function(status) {
                // Accept all status codes to handle custom logic
                return true;
            }
        });

        // Check response status
        if (response.status !== 200) {
            console.error(`[PDF Download] [${attemptLabel}] Cloudinary returned status: ${response.status}`);
            console.error(`[PDF Download] [${attemptLabel}] Response text:`, response.statusText);
            console.error(`[PDF Download] [${attemptLabel}] Response headers:`, response.headers);
            
            if (response.status === 401) {
                console.error(`[PDF Download] [${attemptLabel}] 401 UNAUTHORIZED - Signed URL or credentials issue`);
                console.error(`[PDF Download] [${attemptLabel}] URL attempted: ${fileUrl.substring(0, 100)}...`);
                console.error(`[PDF Download] [${attemptLabel}] This usually means:`);
                console.error(`[PDF Download] [${attemptLabel}]   - Cloudinary credentials are missing or invalid`);
                console.error(`[PDF Download] [${attemptLabel}]   - API_KEY or API_SECRET environment variables not set properly`);
                console.error(`[PDF Download] [${attemptLabel}]   - The signed URL signature has expired`);
                
                if (!res.headersSent) {
                    res.status(401).json({
                        success: false,
                        message: 'Authentication error with file storage provider',
                        details: 'Please check Cloudinary credentials. Contact administrator.',
                        code: 'CLOUDINARY_AUTH_ERROR'
                    });
                }
                return 401; // Return status to indicate failure
            }
            
            if (response.status === 404) {
                console.error(`[PDF Download] [${attemptLabel}] 404 - File not found on Cloudinary`);
                console.error(`[PDF Download] [${attemptLabel}] URL attempted: ${fileUrl}`);
                
                // If this is the first attempt, return 404 to signal fallback
                if (isFirstAttempt) {
                    console.log(`[PDF Download] [${attemptLabel}] Returning 404 to trigger signed URL fallback`);
                    return 404; // Signal caller to try fallback
                }
                
                // If this is fallback and still 404, file truly doesn't exist
                if (!res.headersSent) {
                    res.status(404).json({
                        success: false,
                        message: 'File not found on Cloudinary',
                        details: 'The resource may have been deleted or the URL is incorrect. Try uploading the file again.'
                    });
                }
                return 404;
            }
            
            if (!res.headersSent) {
                res.status(response.status).json({
                    success: false,
                    message: `Cloudinary returned error: ${response.statusText}`,
                    status: response.status
                });
            }
            return response.status;
        }

        // Extract file extension
        const ext = cleanFilename.split('.').pop().toLowerCase();
        const mimeType = getMimeType(ext);
        const contentLength = response.headers['content-length'];

        // Set proper headers for download
        res.setHeader('Content-Type', mimeType);
        
        // Encode filename for safe headers (prevents crashes with special characters)
        const safeFilename = encodeURIComponent(cleanFilename).replace(/['()]/g, escape).replace(/\*/g, '%2A');
        
        if (isPreview) {
            res.setHeader('Content-Disposition', `inline; filename="${cleanFilename.replace(/"/g, '')}"; filename*=UTF-8''${safeFilename}`);
        } else {
            res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename.replace(/"/g, '')}"; filename*=UTF-8''${safeFilename}`);
        }
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('Accept-Ranges', 'bytes');

        console.log(`[PDF Download] [${attemptLabel}] Streaming: ${cleanFilename}`);
        console.log(`[PDF Download] [${attemptLabel}] MIME Type: ${mimeType}`);
        console.log(`[PDF Download] [${attemptLabel}] Content-Disposition: ${isPreview ? 'inline' : 'attachment'}`);
        
        // Pipe Cloudinary response to client
        response.data.pipe(res);

        // Handle errors during streaming
        response.data.on('error', (err) => {
            console.error(`[PDF Download] [${attemptLabel}] Stream error: ${err.message}`);
            if (!res.headersSent) {
                res.status(500).json({ success: false, message: 'Download failed during streaming' });
            } else {
                res.end();
            }
        });

        res.on('finish', () => {
            console.log(`[PDF Download] [${attemptLabel}] ✓ SUCCESS: File streamed successfully: ${cleanFilename}`);
        });

        res.on('error', (err) => {
            console.error(`[PDF Download] [${attemptLabel}] Response error: ${err.message}`);
        });

        return true; // Success

    } catch (error) {
        const attemptLabel = isFirstAttempt ? "ORIGINAL" : "FALLBACK";
        console.error(`[PDF Download] [${attemptLabel}] Streaming error: ${error.message}`);
        
        // Check if this is a 401 error
        if (error.response && error.response.status === 401) {
            console.error(`[PDF Download] [${attemptLabel}] 401 UNAUTHORIZED from Cloudinary`);
            console.error(`[PDF Download] [${attemptLabel}] URL attempted: ${fileUrl.substring(0, 100)}...`);
            console.error(`[PDF Download] [${attemptLabel}] Status: ${error.response.status}`);
            console.error(`[PDF Download] [${attemptLabel}] Cloudinary credentials check needed!`);
            return 401;
        } else if (error.response && error.response.status === 404) {
            console.error(`[PDF Download] [${attemptLabel}] 404 Error - File not found on Cloudinary`);
            console.error(`[PDF Download] [${attemptLabel}] URL attempted: ${fileUrl}`);
            console.error(`[PDF Download] [${attemptLabel}] Status: ${error.response.status}`);
            if (isFirstAttempt) {
                return 404; // Signal to try fallback
            }
            if (!res.headersSent) {
                res.status(404).json({
                    success: false,
                    message: 'File not found on Cloudinary',
                    details: 'The resource may have been deleted or the URL is incorrect.'
                });
            }
            return 404;
        } else if (error.code === 'ENOTFOUND') {
            console.error(`[PDF Download] [${attemptLabel}] Network error - Cannot reach Cloudinary`);
        } else if (error.code === 'ETIMEDOUT') {
            console.error(`[PDF Download] [${attemptLabel}] Request timeout - Cloudinary took too long to respond`);
        } else if (error.code === 'ERR_TLS_CERT_ALTNAME_INVALID') {
            console.error(`[PDF Download] [${attemptLabel}] TLS/SSL Certificate error`);
        }
        
        if (!res.headersSent) {
            // If we got a specific error response, return it with appropriate status
            const statusCode = error.response?.status || 500;
            const message = error.response?.status === 401 
                ? 'Authentication error with file storage'
                : 'Failed to stream file from Cloudinary';
                
            res.status(statusCode).json({
                success: false,
                message: message,
                error: process.env.NODE_ENV === 'development' ? error.message : 'Server error',
                code: error.code
            });
        }
        return error.response?.status || 500; // Return error status
    }
};

/**
 * GET /api/v1/course/download-resource
 * 
 * HYBRID DOWNLOAD SYSTEM:
 * 1. Authenticates student on our server (via auth middleware).
 * 2. Validates and parses the Cloudinary URL to extract public_id.
 * 3. FIRST attempts to download from original URL as-is
 * 4. If 404 occurs, FALLBACK to generating signed URL (for auth failures)
 * 5. Returns appropriate error if file truly doesn't exist
 * 
 * Features:
 * - Proper resource type detection (image/video/raw for PDFs)
 * - Original URL first (no overhead if URL works)
 * - Fallback signed URLs with proper credentials (handles auth failures)
 * - Direct file streaming with proper headers
 * - Comprehensive error handling and logging
 * 
 * Why hybrid approach:
 * - Original URL works if file exists and user has access
 * - Signed URL fallback handles auth/credentials issues
 * - Identifies root cause: missing file vs auth problem
 * - Better diagnostics for debugging
 */
exports.downloadResource = async (req, res) => {
    try {
        const { url, filename, preview } = req.query;
        
        // Validate that URL is provided
        if (!url) {
            console.error("[PDF Download] Missing URL parameter");
            return res.status(400).json({ 
                success: false, 
                message: "URL is required" 
            });
        }

        // Parse and validate URL
        let parsedUrl;
        try {
            parsedUrl = new URL(url);
        } catch (error) {
            console.error("[PDF Download] Invalid URL:", error.message);
            return res.status(400).json({ 
                success: false, 
                message: "Invalid URL format" 
            });
        }

        // Extract filename format from URL
        const pathParts = parsedUrl.pathname.split("/").filter(p => p !== "");
        // Cloudinary URL structure is /cloud_name/resource_type/type/v1...
        // so resourceType is index 1
        const resourceTypeFromUrl = pathParts.length > 1 ? pathParts[1] : pathParts[0];
        const uploadIndex = pathParts.indexOf("upload");
        const versionIndex = pathParts.findIndex((part, index) => index > uploadIndex && /^v\d+$/.test(part));
        const publicIdStartIndex = versionIndex !== -1
            ? versionIndex + 1
            : (uploadIndex !== -1 ? uploadIndex + 1 : 3);
        const publicIdWithExt = pathParts.slice(publicIdStartIndex).join("/");
        
        // Split extension from public_id
        const lastDotIndex = publicIdWithExt.lastIndexOf(".");
        const publicId = lastDotIndex !== -1 
            ? publicIdWithExt.substring(0, lastDotIndex) 
            : publicIdWithExt;

        let formatFromUrl = lastDotIndex !== -1 
            ? publicIdWithExt.substring(lastDotIndex + 1) 
            : "";
        
        // If format is missing from URL but it's a known raw format, try to infer it
        if (!formatFromUrl && resourceTypeFromUrl === 'raw') {
            formatFromUrl = 'pdf'; // Default to pdf for raw resources in this platform
        }

        let format = formatFromUrl || (filename ? filename.split(".").pop() : "pdf");
        
        // Sanitize 'preview' as an extension
        if (format === 'preview') format = 'pdf';

        console.log(`[PDF Download] Processing: ${publicId}.${format}`);

        // Determine correct resource type based on URL first, then fallback to format
        const resourceType = ['image', 'video', 'raw'].includes(resourceTypeFromUrl)
            ? resourceTypeFromUrl
            : getResourceType(format);
        console.log(`[PDF Download] Resource type: ${resourceType} (for .${format})`);

        // IMPORTANT: Ensure Cloudinary is configured
        configureCloudinary();

        // HYBRID APPROACH: Try original URL first
        console.log(`[PDF Download] [STEP 1] Attempting to stream from ORIGINAL URL`);
        console.log(`[PDF Download] Original URL: ${url.substring(0, 150)}...`);
        
        const isPreviewMode = preview === 'true' || preview === true;
        const originalResult = await streamFileFromCloudinary(url, filename || `${publicId}.${format}`, res, true, isPreviewMode);
        
        // If original succeeded, we're done
        if (originalResult === true) {
            return; // Successfully streamed
        }
        
        // If 404, 401, or 403 on original, try with signed URL fallback
        if (originalResult === 404 || originalResult === 401 || originalResult === 403) {
            console.log(`[PDF Download] [STEP 2] Original returned ${originalResult}, attempting SIGNED URL fallback`);
            
            const signedUrl = cloudinary.url(publicId, {
                resource_type: resourceType,
                type: "upload",
                sign_url: true,
                secure: true,
                format: format,
            });

            console.log(`[PDF Download] Generated signed URL: ${signedUrl.substring(0, 150)}...`);
            
            const signedResult = await streamFileFromCloudinary(signedUrl, filename || `${publicId}.${format}`, res, false, isPreviewMode);
            return;
        }
        
        // If we reach here, an error already sent response or is being handled
        if (res.headersSent) {
            return;
        }

    } catch (error) {
        console.error("[PDF Download] Controller error:", error.message);
        console.error("[PDF Download] Stack:", error.stack);
        
        // Only send JSON response if headers not already sent
        if (!res.headersSent) {
            return res.status(500).json({ 
                success: false, 
                message: "Failed to process resource download",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};
