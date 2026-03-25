import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllPublicTestSeries } from '../../../services/operations/testSeriesAPI';
import { buyTestSeries } from '../../../services/operations/revenueAPI';

export default function TestSeries() {
    const { token } = useSelector((state) => state.auth);
    const { user } = useSelector((state) => state.profile);
    const navigate = useNavigate();
    const [testSeries, setTestSeries] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTestSeries = async () => {
            setLoading(true);
            const result = await getAllPublicTestSeries();
            if (result) {
                setTestSeries(result);
            }
            setLoading(false);
        };
        fetchTestSeries();
    }, []);

    const handleBuyTestSeries = (testSeriesId) => {
        if (token) {
            buyTestSeries(token, testSeriesId, user, navigate);
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="text-white">
            <h1 className="mb-14 text-3xl font-medium text-richblack-5">Test Series</h1>

            {loading ? (
                <div className="flex justify-center items-center h-[50vh]">
                    <div className="spinner"></div>
                </div>
            ) : testSeries.length === 0 ? (
                <div className="text-center text-richblack-200 mt-20">
                    <p className="text-xl">No test series available at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testSeries.map((ts) => (
                        <div key={ts._id} className="rounded-md border border-richblack-700 bg-richblack-800 p-6 flex flex-col">
                            <h2 className="text-xl font-bold mb-2 text-richblack-5">{ts.title}</h2>
                            <p className="text-richblack-300 text-sm mb-4 flex-grow">{ts.description || "No description provided."}</p>

                            <div className="flex flex-col gap-2 mb-4 text-sm text-richblack-200">
                                <span>Instructor: {ts.instructor?.firstName} {ts.instructor?.lastName}</span>
                                <span>{ts.tests?.length || 0} Total Tests</span>
                                <span>{ts.studentsEnrolled?.length || 0} Students Enrolled</span>
                            </div>

                            <div className="flex justify-between items-center mt-auto border-t border-richblack-700 pt-4">
                                <span className="text-yellow-50 text-xl font-bold">₹{ts.price}</span>

                                {ts.studentsEnrolled?.some(student => student._id === user?._id) ? (
                                    <button
                                        onClick={() => navigate(`/dashboard/view-test/${ts._id}`)}
                                        className="bg-yellow-50 text-richblack-900 px-4 py-2 rounded-md text-sm font-bold hover:scale-95 transition-transform"
                                    >
                                        View Tests
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleBuyTestSeries(ts._id)}
                                        className="bg-yellow-50 text-richblack-900 px-4 py-2 rounded-md text-sm font-bold hover:scale-95 transition-transform"
                                    >
                                        Buy Now
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
