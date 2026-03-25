import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllPublicTestSeries } from '../../../services/operations/testSeriesAPI';

const ViewTestSeries = () => {
    const { testSeriesId } = useParams();
    const { token } = useSelector((state) => state.auth);
    const [testSeries, setTestSeries] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSeries = async () => {
            setLoading(true);
            const allSeries = await getAllPublicTestSeries();
            const series = allSeries.find(ts => ts._id === testSeriesId);
            setTestSeries(series);
            setLoading(false);
        };
        fetchSeries();
    }, [testSeriesId]);

    if (loading) return <div className="flex justify-center items-center h-[50vh]"><div className="spinner"></div></div>;
    if (!testSeries) return <div className="text-center text-richblack-200 mt-20">Test Series not found.</div>;

    return (
        <div className="text-white p-6">
            <h1 className="text-3xl font-medium text-richblack-5 mb-4">{testSeries.title}</h1>
            <p className="text-richblack-300 mb-8">{testSeries.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testSeries.tests?.map((test, index) => (
                    <div key={test._id} className="bg-richblack-800 p-6 rounded-lg border border-richblack-700 flex flex-col justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-richblack-5 mb-2">{test.title}</h2>
                            <p className="text-richblack-400 text-sm">{test.questions?.length} Questions</p>
                        </div>
                        <button
                            onClick={() => navigate(`/dashboard/take-test/${testSeriesId}/${test._id}`)}
                            className="mt-6 w-full py-2 bg-yellow-50 text-richblack-900 font-semibold rounded-md hover:scale-95 transition-all"
                        >
                            Start Test
                        </button>
                    </div>
                ))}
            </div>

            {testSeries.tests?.length === 0 && (
                <div className="text-center text-richblack-400 mt-10">
                    No tests have been added to this series yet.
                </div>
            )}
        </div>
    );
};

export default ViewTestSeries;
