import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AiOutlineClose, AiOutlineDownload } from 'react-icons/ai';

const PdfViewerModal = ({ isOpen, onClose, fileUrl, fileName }) => {
  if (!isOpen) return null;

  // Add toolbar=0 to internal PDF viewer to keep it clean, but many browsers ignore this
  // The backend proxy handle authentication correctly
  const viewerUrl = `${fileUrl}#toolbar=0&navpanes=0&scrollbar=1`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-richblack-900 bg-opacity-80 backdrop-blur-sm p-4 md:p-10"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative flex h-full w-full max-w-5xl flex-col rounded-xl border border-richblack-700 bg-richblack-800 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-richblack-700 p-4">
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-richblack-5 truncate max-w-[300px] md:max-w-md">
                {fileName || 'PDF Resource'}
              </h2>
              <p className="text-xs text-richblack-300">Viewing in Platform</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Optional Internal Download Button */}
              <a
                href={fileUrl.replace('preview=true', 'preview=false')}
                download={fileName}
                className="flex items-center gap-2 rounded-md bg-richblack-700 px-3 py-2 text-sm font-medium text-richblack-5 transition-all hover:bg-richblack-600 hover:text-yellow-50"
                title="Download PDF"
              >
                <AiOutlineDownload className="text-lg" />
                <span className="hidden sm:inline">Download</span>
              </a>

              <button
                onClick={onClose}
                className="rounded-full bg-richblack-700 p-2 text-richblack-5 hover:bg-pink-200 hover:text-richblack-900 transition-all shadow-md"
                title="Close Viewer"
              >
                <AiOutlineClose className="text-xl" />
              </button>
            </div>
          </div>

          {/* PDF Viewer Body */}
          <div className="flex-1 overflow-hidden bg-richblack-900 rounded-b-xl">
             <iframe
                src={viewerUrl}
                title={fileName}
                className="h-full w-full border-none"
                style={{ filter: 'contrast(1.05)' }}
                allow="autoplay"
             />
          </div>
          
          {/* Mobile Hint */}
          <div className="md:hidden p-2 text-center text-[10px] text-richblack-400">
            Swipe or use controls to navigate PDF
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PdfViewerModal;
