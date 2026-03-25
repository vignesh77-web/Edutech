import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { addTestToSeries } from '../../../services/operations/testSeriesAPI';
import IconBtn from '../../common/IconBtn';
import { MdDelete } from 'react-icons/md';

const ManageTests = () => {
    const { testSeriesId } = useParams();
    const { token } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            testTitle: "",
            questions: [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "questions",
    });

    const onSubmit = async (data) => {
        setLoading(true);
        const formattedData = {
            testSeriesId,
            testTitle: data.testTitle,
            questions: data.questions
        };
        const result = await addTestToSeries(formattedData, token);
        if (result) {
            navigate("/dashboard/manage-test-series");
        }
        setLoading(false);
    };

    return (
        <div className="text-white p-6">
            <h1 className="text-3xl font-medium text-richblack-5 mb-8">Add New Test</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-richblack-800 p-8 rounded-lg border border-richblack-700">
                <div>
                    <label className="block text-sm text-richblack-5 mb-2" htmlFor="testTitle">
                        Test Title <sup className="text-pink-200">*</sup>
                    </label>
                    <input
                        id="testTitle"
                        placeholder="e.g. Unit Test 1: Introduction to React"
                        {...register("testTitle", { required: true })}
                        className="w-full bg-richblack-700 rounded-md p-3 text-richblack-5 focus:outline-none focus:ring-1 focus:ring-yellow-50"
                    />
                    {errors.testTitle && <span className="text-xs text-pink-200">Test title is required</span>}
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-semibold border-b border-richblack-700 pb-2">Questions</h2>

                    {fields.map((item, index) => (
                        <div key={item.id} className="p-6 bg-richblack-900 rounded-md border border-richblack-700 relative">
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className="absolute top-4 right-4 text-pink-300 hover:text-pink-50"
                                title="Remove Question"
                            >
                                <MdDelete size={24} />
                            </button>

                            <div className="mb-4">
                                <label className="block text-sm text-richblack-5 mb-1">
                                    Question {index + 1} <sup className="text-pink-200">*</sup>
                                </label>
                                <textarea
                                    {...register(`questions.${index}.question`, { required: true })}
                                    placeholder="Enter the question text"
                                    className="w-full bg-richblack-700 rounded-md p-3 text-richblack-5 focus:outline-none focus:ring-1 focus:ring-yellow-50 min-h-[80px]"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[0, 1, 2, 3].map((optIndex) => (
                                    <div key={optIndex}>
                                        <label className="block text-xs text-richblack-400 mb-1">Option {optIndex + 1}</label>
                                        <input
                                            {...register(`questions.${index}.options.${optIndex}`, { required: true })}
                                            placeholder={`Option ${optIndex + 1}`}
                                            className="w-full bg-richblack-700 rounded-md p-2 text-richblack-5 focus:outline-none focus:ring-1 focus:ring-yellow-50"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 w-full md:w-1/2">
                                <label className="block text-sm text-richblack-5 mb-1">Correct Answer</label>
                                <select
                                    {...register(`questions.${index}.correctAnswer`, { required: true })}
                                    className="w-full bg-richblack-700 rounded-md p-2 text-richblack-5 focus:outline-none focus:ring-1 focus:ring-yellow-50"
                                >
                                    <option value={0}>Option 1</option>
                                    <option value={1}>Option 2</option>
                                    <option value={2}>Option 3</option>
                                    <option value={3}>Option 4</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8">
                    <button
                        type="button"
                        onClick={() => append({ question: "", options: ["", "", "", ""], correctAnswer: 0 })}
                        className="px-6 py-2 border border-yellow-50 text-yellow-50 rounded-md hover:bg-yellow-50 hover:text-richblack-900 transition-all font-semibold"
                    >
                        + Add Another Question
                    </button>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard/manage-test-series")}
                            className="px-6 py-2 bg-richblack-700 text-richblack-5 rounded-md"
                        >
                            Cancel
                        </button>
                        <IconBtn
                            disabled={loading}
                            text={loading ? "Saving..." : "Save Test"}
                            type="submit"
                        />
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ManageTests;
