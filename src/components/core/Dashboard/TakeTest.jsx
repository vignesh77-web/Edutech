import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllPublicTestSeries, evaluateTest } from '../../../services/operations/testSeriesAPI';
import IconBtn from '../../common/IconBtn';

const TakeTest = () => {
    const { testSeriesId, testId } = useParams();
    const { token } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const [test, setTest] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null);

    useEffect(() => {
        const fetchTest = async () => {
            const allSeries = await getAllPublicTestSeries();
            const series = allSeries.find(ts => ts._id === testSeriesId);
            const foundTest = series?.tests?.find(t => t._id === testId);
            if (foundTest) {
                setTest(foundTest);
                setAnswers(new Array(foundTest.questions.length).fill(null));
            }
            setLoading(false);
        };
        fetchTest();
    }, [testSeriesId, testId]);

    const handleAnswerChange = (qIndex, optIndex) => {
        const newAnswers = [...answers];
        newAnswers[qIndex] = optIndex;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        if (answers.includes(null)) {
            if (!window.confirm("You have unanswered questions. Do you still want to submit?")) {
                return;
            }
        }
        const res = await evaluateTest({ testSeriesId, testId, studentAnswers: answers }, token);
        if (res) {
            setResult(res);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-[50vh]"><div className="spinner"></div></div>;
    if (!test) return <div className="text-center text-richblack-200 mt-20">Test not found.</div>;

    if (result) {
        return (
            <div className="text-white p-6 max-w-4xl mx-auto">
                <div className="bg-richblack-800 p-8 rounded-lg border border-richblack-700 text-center">
                    <h1 className="text-4xl font-bold text-yellow-50 mb-4">Test Result</h1>
                    <div className="text-6xl font-bold mb-4">{result.score} / {result.totalQuestions}</div>
                    <p className="text-richblack-300 mb-8">
                        Accuracy: {Math.round((result.score / result.totalQuestions) * 100)}%
                    </p>

                    <div className="space-y-6 text-left">
                        {result.results.map((res, idx) => (
                            <div key={idx} className={`p-4 rounded-md border ${res.isCorrect ? 'border-caribbeangreen-200 bg-caribbeangreen-900 bg-opacity-20' : 'border-pink-200 bg-pink-900 bg-opacity-20'}`}>
                                <p className="font-semibold mb-2">Q{idx + 1}: {res.question}</p>
                                <p className="text-sm">
                                    Your Answer: <span className={res.isCorrect ? 'text-caribbeangreen-200' : 'text-pink-200'}>
                                        {test.questions[idx].options[res.studentAnswer] || "Not Answered"}
                                    </span>
                                </p>
                                {!res.isCorrect && (
                                    <p className="text-sm text-caribbeangreen-200 mt-1">
                                        Correct Answer: {test.questions[idx].options[res.correctAnswer]}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-10">
                        <IconBtn
                            text="Back to Dashboard"
                            onclick={() => navigate("/dashboard/test-series")}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="text-white p-6 max-w-4xl mx-auto pb-20">
            <h1 className="text-3xl font-medium text-richblack-5 mb-8 text-center">{test.title}</h1>

            <div className="space-y-8">
                {test.questions.map((q, qIdx) => (
                    <div key={qIdx} className="bg-richblack-800 p-8 rounded-lg border border-richblack-700">
                        <p className="text-lg font-semibold mb-6">
                            <span className="text-yellow-50 mr-2">Q{qIdx + 1}.</span> {q.question}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {q.options.map((option, optIdx) => (
                                <button
                                    key={optIdx}
                                    onClick={() => handleAnswerChange(qIdx, optIdx)}
                                    className={`p-4 rounded-md border text-left transition-all ${answers[qIdx] === optIdx
                                            ? 'border-yellow-50 bg-yellow-50 bg-opacity-10 text-yellow-50'
                                            : 'border-richblack-700 bg-richblack-900 text-richblack-200 hover:bg-richblack-800'
                                        }`}
                                >
                                    <span className="font-bold mr-2">{String.fromCharCode(65 + optIdx)}.</span> {option}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 md:pl-64 p-4 bg-richblack-900 bg-opacity-80 backdrop-blur-md border-t border-richblack-700 z-40">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <p className="text-richblack-300 font-medium">
                        {answers.filter(a => a !== null).length} of {test.questions.length} Answered
                    </p>
                    <IconBtn
                        text="Submit Test"
                        onclick={handleSubmit}
                    />
                </div>
            </div>
        </div>
    );
};

export default TakeTest;
