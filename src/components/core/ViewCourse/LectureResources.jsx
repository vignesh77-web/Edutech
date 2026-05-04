import React, { useState, useEffect, useRef } from 'react'
import { AiOutlineDownload, AiOutlineFile, AiOutlineLoading3Quarters, AiOutlineEye } from 'react-icons/ai'
import { BsFiletypePdf, BsFileEarmarkImage, BsFileEarmarkZip } from 'react-icons/bs'
import { SiMicrosoftpowerpoint } from 'react-icons/si'
import { toast } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { courseEndpoints } from '../../../services/apis'
import PdfViewerModal from '../../common/PdfViewerModal'

const { DOWNLOAD_RESOURCE_API } = courseEndpoints

const LectureResources = ({ resources = [] }) => {
  const [downloading, setDownloading] = useState({})
  const { token } = useSelector((state) => state.auth)
  const isMountedRef = useRef(true)
  const [viewingResource, setViewingResource] = useState(null)

  // Cleanup on unmount to prevent setState warnings
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Get appropriate icon based on file type
  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.')?.pop()?.toLowerCase()
    switch (ext) {
      case 'pdf':
        return <BsFiletypePdf className="text-red-400 text-2xl" />
      case 'ppt':
      case 'pptx':
        return <SiMicrosoftpowerpoint className="text-orange-400 text-2xl" />
      case 'zip':
      case 'rar':
        return <BsFileEarmarkZip className="text-yellow-500 text-2xl" />
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <BsFileEarmarkImage className="text-blue-400 text-2xl" />
      default:
        return <AiOutlineFile className="text-gray-400 text-2xl" />
    }
  }

  // Validate URL before processing
  const isValidUrl = (urlString) => {
    try {
      new URL(urlString);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Download via backend proxy — bypasses CORS and ensures secure authenticated access
  const handleDownload = (fileUrl, fileName, index) => {
    // Validate URL
    if (!fileUrl || !isValidUrl(fileUrl)) {
      console.error('[Frontend Download] Invalid URL:', fileUrl);
      toast.error('Invalid file URL');
      return;
    }

    // Validate token
    if (!token) {
      console.error('[Frontend Download] No auth token available');
      toast.error('Authentication required. Please log in again.');
      return;
    }

    try {
      // Mark as downloading
      setDownloading(prev => ({ ...prev, [index]: true }));

      // Clean filename - remove double extensions
      let cleanFileName = fileName || 'download';
      if (cleanFileName.endsWith('.pdf.pdf')) {
        cleanFileName = cleanFileName.slice(0, -4); // Remove extra .pdf
      }
      if (cleanFileName.endsWith('.pptx.pptx')) {
        cleanFileName = cleanFileName.slice(0, -5); // Remove extra .pptx
      }
      if (cleanFileName.endsWith('.docx.docx')) {
        cleanFileName = cleanFileName.slice(0, -5); // Remove extra .docx
      }

      // Construct proxy URL with all required parameters
      // The backend will authenticate the user and stream the file
      const proxyUrl = `${DOWNLOAD_RESOURCE_API}?url=${encodeURIComponent(fileUrl)}&filename=${encodeURIComponent(cleanFileName)}&token=${encodeURIComponent(token)}`;
      
      console.log('[Frontend Download] File URL:', fileUrl);
      console.log('[Frontend Download] Clean filename:', cleanFileName);
      console.log('[Frontend Download] Proxy URL:', proxyUrl.substring(0, 150) + '...');
      console.log('[Frontend Download] Initiating download for:', cleanFileName);
      
      // Download using fetch first to capture errors better
      fetch(proxyUrl, {
        method: 'GET',
      })
        .then(response => {
          console.log('[Frontend Download] Response status:', response.status);
          console.log('[Frontend Download] Response headers:', {
            contentType: response.headers.get('content-type'),
            contentLength: response.headers.get('content-length'),
            contentDisposition: response.headers.get('content-disposition'),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          // Check if we got the expected content type
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            // It's an error response
            return response.json().then(data => {
              throw new Error(data.message || 'Download failed');
            });
          }

          // Get the blob
          return response.blob();
        })
        .then(blob => {
          // Create a download link
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = cleanFileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);

          console.log('[Frontend Download] ✓ Download successful:', cleanFileName);
          toast.success(`Downloaded: ${cleanFileName}`);
        })
        .catch(error => {
          console.error('[Frontend Download] Fetch error:', error);
          toast.error(`Failed to download: ${error.message}`);
          
          // Fallback: try window.location.href method
          console.log('[Frontend Download] Attempting fallback download method...');
          setTimeout(() => {
            window.location.href = proxyUrl;
          }, 500);
        })
        .finally(() => {
          if (isMountedRef.current) {
            setDownloading(prev => ({ ...prev, [index]: false }));
          }
        });

    } catch (error) {
      console.error('[Frontend Download] Error:', error);
      toast.error('Failed to download file');
      if (isMountedRef.current) {
        setDownloading(prev => ({ ...prev, [index]: false }));
      }
    }
  }

  // Open in new tab for quick preview via proxy (handles authenticated files)
  const handlePreview = (fileUrl, fileName) => {
    // Validate URL
    if (!fileUrl || !isValidUrl(fileUrl)) {
      toast.error('Invalid file URL');
      return;
    }

    // Validate token
    if (!token) {
      toast.error('Authentication required. Please log in again.');
      return;
    }

    try {
      // Clean filename
      let cleanFileName = fileName || 'preview';
      if (cleanFileName.endsWith('.pdf.pdf')) {
        cleanFileName = cleanFileName.slice(0, -4);
      }
      if (cleanFileName.endsWith('.pptx.pptx')) {
        cleanFileName = cleanFileName.slice(0, -5);
      }
      if (cleanFileName.endsWith('.docx.docx')) {
        cleanFileName = cleanFileName.slice(0, -5);
      }

      // Construct proxy URL with preview flag
      const proxyUrl = `${DOWNLOAD_RESOURCE_API}?url=${encodeURIComponent(fileUrl)}&filename=${encodeURIComponent(cleanFileName)}&preview=true&token=${encodeURIComponent(token)}`
      
      console.log('[Frontend Preview] Opening preview for:', cleanFileName);
      
      // Update: Instead of window.open, we set the state to open our in-platform viewer
      setViewingResource({
        url: proxyUrl,
        name: cleanFileName
      });
    } catch (error) {
      console.error('[Frontend Preview] Error:', error);
      toast.error('Failed to open preview');
    }
  }

  if (!resources || resources.length === 0) {
    return null
  }

  const validResources = resources.filter(r => r.fileUrl)
  const brokenResources = resources.filter(r => !r.fileUrl)

  return (
    <div className="mt-6 rounded-lg border border-richblack-600 bg-richblack-800 p-6 shadow-lg">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400">
          <AiOutlineDownload className="text-xl text-richblack-800" />
        </div>
        <h2 className="text-lg font-semibold text-richblack-5">
          Lecture Resources
        </h2>
        <span className="ml-auto rounded-full bg-richblack-700 px-3 py-1 text-sm text-richblack-300">
          {resources.length} {resources.length === 1 ? 'file' : 'files'}
        </span>
      </div>

      {/* Resources List */}
      <div className="flex flex-col gap-3">
        {/* Valid Resources */}
        {validResources.map((resource, index) => {
          const isDownloadingThis = downloading[index]
          return (
            <div
              key={index}
              className="flex items-center gap-4 rounded-md border border-richblack-600 bg-richblack-700 p-4 transition-all duration-200 hover:border-yellow-50 hover:bg-richblack-600"
            >
              {/* File Icon */}
              <div className="flex-shrink-0">{getFileIcon(resource.name)}</div>

              {/* File Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-richblack-5">{resource.name}</p>
                <p className="text-xs text-richblack-300">
                  {isDownloadingThis ? 'Downloading...' : 'PDF Resource — Click to download'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-shrink-0 items-center gap-2">
                {/* Preview - open in new tab */}
                <button
                  onClick={() => handlePreview(resource.fileUrl, resource.name)}
                  title="Preview in the platform"
                  className="rounded-full bg-richblack-600 p-2 text-richblack-200 transition-all duration-200 hover:bg-richblack-500 hover:text-richblack-5"
                >
                  <AiOutlineEye className="text-lg" />
                </button>

                {/* Download */}
                <button
                  onClick={() => handleDownload(resource.fileUrl, resource.name, index)}
                  disabled={isDownloadingThis}
                  title="Download file"
                  className="rounded-full bg-yellow-400 p-2 text-richblack-800 transition-all duration-200 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDownloadingThis
                    ? <AiOutlineLoading3Quarters className="text-lg animate-spin" />
                    : <AiOutlineDownload className="text-lg" />}
                </button>
              </div>
            </div>
          )
        })}

        {/* Broken Resources (missing URL) */}
        {brokenResources.map((resource, index) => (
          <div
            key={`broken-${index}`}
            title="File link missing. Please ask the instructor to re-upload."
            className="flex cursor-not-allowed items-center gap-4 rounded-md border border-richblack-600 bg-richblack-700 p-4 opacity-50"
          >
            <div className="flex-shrink-0">{getFileIcon(resource.name)}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-richblack-5">{resource.name}</p>
              <p className="text-xs text-pink-200">Link unavailable — Please contact instructor</p>
            </div>
            <div className="flex-shrink-0 rounded-full bg-richblack-600 p-2 text-richblack-400">
              <AiOutlineDownload className="text-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Download All Button */}
      {validResources.length > 1 && (
        <button
          onClick={() =>
            validResources.forEach((r, i) => handleDownload(r.fileUrl, r.name, i))
          }
          className="mt-5 w-full rounded-md border-2 border-yellow-50 py-2 text-center font-semibold text-yellow-50 transition-all duration-200 hover:bg-yellow-50 hover:text-richblack-800"
        >
          Download All ({validResources.length} files)
        </button>
      )}

      {/* In-Platform PDF Viewer Modal */}
      <PdfViewerModal
        isOpen={!!viewingResource}
        onClose={() => setViewingResource(null)}
        fileUrl={viewingResource?.url || ""}
        fileName={viewingResource?.name || ""}
      />
    </div>
  )
}

export default LectureResources
