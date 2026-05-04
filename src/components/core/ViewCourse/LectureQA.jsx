import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { askQuestion, getQuestionsForLecture, answerQuestion } from '../../../services/operations/lectureQaAPI';
import IconBtn from '../../common/IconBtn';

const LectureQA = ({ courseId, sectionId, subSectionId }) => {
    const { token } = useSelector((state) => state.auth);
    const { user } = useSelector((state) => state.profile);
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchQuestions = async () => {
            if (subSectionId) {
                const result = await getQuestionsForLecture(subSectionId, token);
                if (result) {
                    setQuestions(result);
                }
            }
        };
        fetchQuestions();
    }, [subSectionId, token]);

    const handleAskQuestion = async () => {
        if (!newQuestion.trim()) return;
        setLoading(true);
        const result = await askQuestion({
            courseId,
            subSectionId,
            question: newQuestion,
        }, token);

        if (result) {
            setQuestions([result, ...questions]);
            setNewQuestion("");
        }
        setLoading(false);
    };

    const handleAddReply = async (questionId) => {
        if (!replyText.trim()) return;
        setLoading(true);
        const result = await answerQuestion({
            questionId,
            answer: replyText,
        }, token);

        if (result) {
            setQuestions(questions.map((q) => q._id === questionId ? result : q));
            setReplyText("");
            setReplyingTo(null);
        }
        setLoading(false);
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric", hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="mt-8 border-t border-richblack-700 pt-6">
            <h2 className="text-2xl font-semibold text-richblack-5 mb-6">Q&A Discussion</h2>
            
            {/* Ask Question Form */}
            <div className="flex flex-col gap-3 mb-8 bg-richblack-800 p-4 rounded-md border border-richblack-700">
                <textarea
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Ask a question about this lecture..."
                    className="form-style w-full min-h-[100px] resize-y"
                />
                <IconBtn
                    text="Post Question"
                    onclick={handleAskQuestion}
                    disabled={loading || !newQuestion.trim()}
                    customClasses="self-end"
                />
            </div>

            {/* Questions List */}
            <div className="flex flex-col gap-6">
                {questions.length === 0 ? (
                    <p className="text-richblack-300 text-center py-4">No questions yet. Be the first to ask!</p>
                ) : (
                    questions.map((q) => (
                        <div key={q._id} className="flex gap-4">
                            <img 
                                src={q.user.image} 
                                alt="user" 
                                className="w-10 h-10 rounded-full object-cover shrink-0"
                            />
                            <div className="flex flex-col w-full">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-richblack-5">
                                        {q.user.firstName} {q.user.lastName} 
                                        {q.user.accountType === "Instructor" && (
                                            <span className="ml-2 text-xs bg-yellow-100 text-richblack-900 px-2 py-0.5 rounded-full font-bold">Instructor</span>
                                        )}
                                    </p>
                                    <span className="text-xs text-richblack-400">{formatDate(q.createdAt)}</span>
                                </div>
                                <p className="mt-1 text-richblack-100">{q.question}</p>

                                {/* Replies Section */}
                                <div className="mt-4 flex flex-col gap-3">
                                    {q.answers && q.answers.map((ans, index) => (
                                        <div key={index} className="flex gap-3 bg-richblack-800 p-3 rounded-md border border-richblack-700">
                                            <img 
                                                src={ans.user.image} 
                                                alt="user" 
                                                className="w-8 h-8 rounded-full object-cover shrink-0"
                                            />
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-richblack-5">
                                                        {ans.user.firstName} {ans.user.lastName}
                                                        {ans.user.accountType === "Instructor" && (
                                                            <span className="ml-2 text-[10px] bg-yellow-100 text-richblack-900 px-1.5 py-0.5 rounded-full font-bold">Instructor</span>
                                                        )}
                                                    </p>
                                                    <span className="text-[10px] text-richblack-400">{formatDate(ans.createdAt)}</span>
                                                </div>
                                                <p className="text-sm text-richblack-100 mt-1">{ans.answer}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Reply Input */}
                                    {replyingTo === q._id ? (
                                        <div className="flex flex-col gap-2 mt-2">
                                            <textarea
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="Write a reply..."
                                                className="form-style w-full min-h-[80px] text-sm"
                                            />
                                            <div className="flex gap-2 self-end">
                                                <button 
                                                    className="px-4 py-2 rounded-md bg-richblack-700 text-richblack-5 text-sm"
                                                    onClick={() => { setReplyingTo(null); setReplyText(""); }}
                                                >
                                                    Cancel
                                                </button>
                                                <IconBtn
                                                    text="Submit Reply"
                                                    onclick={() => handleAddReply(q._id)}
                                                    disabled={loading || !replyText.trim()}
                                                    customClasses="px-4 py-2 text-sm"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <button 
                                            className="text-sm text-yellow-50 hover:text-yellow-100 underline self-start mt-1"
                                            onClick={() => setReplyingTo(q._id)}
                                        >
                                            Reply to this question
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LectureQA;
