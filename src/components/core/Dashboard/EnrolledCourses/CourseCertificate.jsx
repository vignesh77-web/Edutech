import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import IconBtn from '../../../common/IconBtn';

const CourseCertificate = ({ courseName, studentName, date }) => {
    const certificateRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const downloadCertificate = async () => {
        setLoading(true);
        try {
            const element = certificateRef.current;
            element.style.display = 'flex'; // make it visible for capture
            
            const canvas = await html2canvas(element, { 
                scale: 2,
                backgroundColor: '#ffffff'
            });
            
            element.style.display = 'none'; // hide it back

            const imgData = canvas.toDataURL('image/png');
            
            // A4 landscape sizing
            const pdf = new jsPDF('landscape', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${courseName.replace(/\s+/g, '_')}_Certificate.pdf`);
        } catch (error) {
            console.error("Error generating certificate:", error);
        }
        setLoading(false);
    };

    return (
        <div>
            <IconBtn 
                text={loading ? "Generating..." : "Download Certificate 🏆"}
                onclick={(e) => { e.stopPropagation(); downloadCertificate(); }}
                disabled={loading}
                customClasses="text-[11px] bg-yellow-50 text-black px-3 py-1.5 mt-2"
            />

            {/* Hidden Certificate Template for export */}
            <div className="absolute top-0 left-[-9999px]">
                <div 
                    ref={certificateRef}
                    className="w-[1056px] h-[816px] bg-white text-black p-10 relative box-border font-serif flex flex-col items-center justify-center text-center"
                    style={{
                        display: 'none',
                        border: '20px solid #ececec',
                        backgroundImage: 'radial-gradient(#f9f9f9 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                    }}
                >
                    <div className="absolute top-10 w-[95%] h-[90%] border-4 border-yellow-600 pointer-events-none"></div>
                    <div className="absolute top-12 w-[93%] h-[87%] border border-yellow-600 pointer-events-none"></div>
                    
                    <h1 className="text-6xl font-bold text-richblack-900 tracking-wide uppercase mb-2">Certificate of Completion</h1>
                    <p className="text-xl text-richblack-500 mb-10 italic">This is to certify that</p>
                    
                    <h2 className="text-5xl font-bold text-yellow-600 mb-6 font-sans border-b border-richblack-300 pb-2 px-10">
                        {studentName}
                    </h2>
                    
                    <p className="text-xl text-richblack-700 mb-4 max-w-[800px] leading-relaxed">
                        has successfully completed the course
                    </p>
                    
                    <h3 className="text-4xl font-bold text-richblack-900 my-4 max-w-[800px] leading-tight">
                        {courseName}
                    </h3>
                    
                    <div className="flex justify-between items-end w-full px-20 mt-20">
                        <div className="flex flex-col items-center">
                            <p className="text-lg text-richblack-700 font-bold border-b-2 border-richblack-900 pb-1 mb-1 px-8">StudyNotion</p>
                            <p className="text-sm text-richblack-400 uppercase tracking-widest">Platform</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <p className="text-lg text-richblack-700 font-bold border-b-2 border-richblack-900 pb-1 mb-1 px-8">{date}</p>
                            <p className="text-sm text-richblack-400 uppercase tracking-widest">Date</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseCertificate;
