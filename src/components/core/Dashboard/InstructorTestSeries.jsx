import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
    createTestSeries,
    getInstructorTestSeries,
    updateTestSeries,
    deleteTestSeries,
} from '../../../services/operations/testSeriesAPI';
import IconBtn from '../../common/IconBtn';

const InstructorTestSeries = () => {
    const { token } = useSelector((state) => state.auth);
    const [testSeries, setTestSeries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm();

    const fetchTestSeries = async () => {
        setLoading(true);
        const result = await getInstructorTestSeries(token);
        if (result) setTestSeries(result);
        setLoading(false);
    };

    useEffect(() => {
        fetchTestSeries();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSubmit = async (data) => {
        if (editMode) {
            const formData = { ...data, testSeriesId: currentId };
            const result = await updateTestSeries(formData, token);
            if (result) {
                setTestSeries((prev) =>
                    prev.map((ts) => (ts._id === currentId ? result : ts))
                );
            }
        } else {
            const result = await createTestSeries(data, token);
            if (result) {
                setTestSeries([result, ...testSeries]);
            }
        }
        closeModal();
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this test series?")) {
            const result = await deleteTestSeries({ testSeriesId: id }, token);
            if (result) {
                setTestSeries(testSeries.filter((ts) => ts._id !== id));
            }
        }
    };

    const openEditModal = (ts) => {
        setEditMode(true);
        setCurrentId(ts._id);
        setValue("title", ts.title);
        setValue("description", ts.description);
        setValue("price", ts.price);
        setValue("status", ts.status);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentId(null);
        reset();
    };

    return (
        <div className="text-white p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-medium text-richblack-5">Manage Test Series</h1>
                <IconBtn
                    text="Create Test Series"
                    onclick={() => setShowModal(true)}
                    customClasses="flex items-center gap-2 bg-yellow-50 text-richblack-900"
                />
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-[50vh]">
                    <div className="spinner"></div>
                </div>
            ) : testSeries.length === 0 ? (
                <div className="text-center text-richblack-200 mt-20">
                    <p className="text-xl">You haven't created any test series yet.</p>
                </div>
            ) : (
                <div className="overflow-x-auto border border-richblack-700 rounded-lg">
                    <table className="w-full text-left">
                        <thead className="bg-richblack-800 text-richblack-100 uppercase text-sm font-semibold">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Tests</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-richblack-700 text-richblack-5">
                            {testSeries.map((ts) => (
                                <tr key={ts._id} className="hover:bg-richblack-800 transition-colors">
                                    <td className="px-6 py-4 font-medium">{ts.title}</td>
                                    <td className="px-6 py-4">₹{ts.price}</td>
                                    <td className="px-6 py-4">{ts.tests?.length || 0}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ts.status === 'Published' ? 'bg-caribbeangreen-100 text-caribbeangreen-700' : 'bg-pink-100 text-pink-700'}`}>
                                            {ts.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-richblack-300">
                                        {new Date(ts.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-3 text-sm">
                                        <button
                                            onClick={() => openEditModal(ts)}
                                            className="text-caribbeangreen-300 hover:text-caribbeangreen-50 transition-colors"
                                            title="Edit"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(ts._id)}
                                            className="text-pink-300 hover:text-pink-50 transition-colors"
                                            title="Delete"
                                        >
                                            Delete
                                        </button>
                                        <button
                                            onClick={() => navigate(`/dashboard/add-test/${ts._id}`)}
                                            className="text-yellow-50 hover:text-yellow-200 transition-colors font-medium"
                                        >
                                            Manage Tests
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-richblack-900 bg-opacity-70 backdrop-blur-sm">
                    <div className="bg-richblack-800 border border-richblack-700 rounded-lg w-full max-w-lg p-6">
                        <h2 className="text-2xl font-semibold mb-6">
                            {editMode ? "Edit Test Series" : "Create Test Series"}
                        </h2>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-white">
                            <div>
                                <label className="block text-sm text-richblack-5 mb-1" htmlFor="title">
                                    Title <sup className="text-pink-200">*</sup>
                                </label>
                                <input
                                    id="title"
                                    placeholder="Enter Test Series Title"
                                    {...register("title", { required: true })}
                                    className="w-full bg-richblack-700 rounded-md p-3 text-richblack-5 focus:outline-none focus:ring-1 focus:ring-yellow-50 placeholder:text-richblack-400"
                                />
                                {errors.title && <span className="text-xs text-pink-200">Title is required</span>}
                            </div>

                            <div>
                                <label className="block text-sm text-richblack-5 mb-1" htmlFor="description">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    placeholder="Enter Description"
                                    {...register("description")}
                                    className="w-full bg-richblack-700 rounded-md p-3 text-richblack-5 min-h-[100px] focus:outline-none focus:ring-1 focus:ring-yellow-50 placeholder:text-richblack-400"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-richblack-5 mb-1" htmlFor="price">
                                        Price (₹) <sup className="text-pink-200">*</sup>
                                    </label>
                                    <input
                                        id="price"
                                        type="number"
                                        placeholder="0"
                                        {...register("price", { required: true, min: 0 })}
                                        className="w-full bg-richblack-700 rounded-md p-3 text-richblack-5 focus:outline-none focus:ring-1 focus:ring-yellow-50 placeholder:text-richblack-400"
                                    />
                                    {errors.price && <span className="text-xs text-pink-200">Valid price required</span>}
                                </div>

                                <div>
                                    <label className="block text-sm text-richblack-5 mb-1" htmlFor="status">
                                        Status
                                    </label>
                                    <select
                                        id="status"
                                        {...register("status")}
                                        className="w-full bg-richblack-700 rounded-md p-3 text-richblack-5 focus:outline-none focus:ring-1 focus:ring-yellow-50"
                                    >
                                        <option value="Draft">Draft</option>
                                        <option value="Published">Published</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-richblack-700 text-richblack-5 rounded-md hover:bg-richblack-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-yellow-50 text-richblack-900 font-semibold rounded-md hover:scale-95 transition-all"
                                >
                                    {editMode ? "Save Changes" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorTestSeries;
