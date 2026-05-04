import React, { useEffect, useState } from 'react'
import Footer from '../components/common/Footer'
import { useParams } from 'react-router-dom'
import { apiConnector } from '../services/apiconnector';
import { categories } from '../services/apis';
import { getCatalogPageData } from '../services/operations/pageAndComponentData';
import CourseCard from '../components/core/Catalog/Course_Card';
import CourseSlider from '../components/core/Catalog/CourseSlider';
import ReviewSlider from "../components/common/ReviewSlider"
import { MdOutlineRateReview } from 'react-icons/md'

const Catalog = () => {

    const { catalogName } = useParams();
    const [catalogPageData, setCatalogPageData] = useState(null);
    const [categoryId, setCategoryId] = useState("");
    const [active, setActive] = useState(1)
    const [filters, setFilters] = useState({ price: "All", sort: "popular" })

    // Filtered Courses
    const getFilteredCourses = () => {
        let courses = catalogPageData?.data?.selectedCategory?.courses || [];
        
        if (filters.price === "Free") courses = courses.filter(c => c.price === 0);
        if (filters.price === "Paid") courses = courses.filter(c => c.price > 0);
        
        if (filters.sort === "newest") {
            courses = [...courses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (filters.sort === "popular") {
            courses = [...courses].sort((a, b) => (b.studentsEnrolled?.length || 0) - (a.studentsEnrolled?.length || 0));
        }
        
        return courses;
    }

    //Fetch all categories
    useEffect(() => {
        const getCategories = async () => {
            const res = await apiConnector("GET", categories.CATEGORIES_API);
            const category_id =
                res?.data?.data?.filter((ct) => ct.name.split(" ").join("-").toLowerCase() === catalogName)[0]._id;
            setCategoryId(category_id);
        }
        getCategories();
    }, [catalogName]);

    useEffect(() => {
        const getCategoryDetails = async () => {
            try {
                const res = await getCatalogPageData(categoryId);
                console.log("Printing res: ", res);
                setCatalogPageData(res);
            }
            catch (error) {
                console.log(error)
            }
        }
        if (categoryId) {
            getCategoryDetails();
        }
        console.log(categoryId)

    }, [categoryId]);

    return (
        <>
            {/* Hero Section */}
            <div className=" box-content bg-richblack-800 px-4">
                <div className="mx-auto flex min-h-[260px] max-w-maxContentTab flex-col justify-center gap-4 lg:max-w-maxContent ">
                    <p className="text-sm text-richblack-300">{`Home / Catalog /`}
                        <span className="text-yellow-25">
                            {catalogPageData?.data?.selectedCategory?.name}
                        </span></p>
                    <p className="text-3xl text-richblack-5"> {catalogPageData?.data?.selectedCategory?.name} </p>
                    <p className="max-w-[870px] text-richblack-200"> {catalogPageData?.data?.selectedCategory?.description}</p>
                </div>
            </div>


            {/* section1 */}
            <div className=" mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
                <div className="section_heading">Courses to get you started</div>
                <div className="my-4 flex border-b border-b-richblack-600 text-sm">
                    <p
                        className={`px-4 py-2 ${active === 1
                            ? "border-b border-b-yellow-25 text-yellow-25"
                            : "text-richblack-50"
                            } cursor-pointer`}
                        onClick={() => setActive(1)}
                    >
                        Most Popular</p>
                    <p
                        className={`px-4 py-2 ${active === 2
                            ? "border-b border-b-yellow-25 text-yellow-25"
                            : "text-richblack-50"
                            } cursor-pointer`}
                        onClick={() => setActive(2)}
                    >
                        New
                    </p>
                </div>

                <div>
                    <CourseSlider Courses={catalogPageData?.data?.selectedCategory?.courses} />
                </div>
            </div>

            {/* All Courses Grid with Filters */}
            <div className="mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent flex flex-col md:flex-row gap-8">
                {/* Filters Sidebar */}
                <div className="w-full md:w-[250px] shrink-0 bg-richblack-800 p-6 rounded-lg h-fit border border-richblack-700">
                    <h3 className="text-xl text-richblack-5 font-semibold mb-4 border-b border-richblack-700 pb-2">Filters</h3>
                    
                    <div className="mb-6">
                        <p className="text-richblack-300 font-semibold mb-2">Price</p>
                        <div className="flex flex-col gap-2">
                            {["All", "Free", "Paid"].map(priceOpt => (
                                <label key={priceOpt} className="flex items-center gap-2 text-richblack-100 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="price" 
                                        value={priceOpt}
                                        checked={filters.price === priceOpt}
                                        onChange={(e) => setFilters(prev => ({ ...prev, price: e.target.value }))}
                                        className="form-radio text-yellow-50 bg-richblack-700 border-richblack-600 focus:ring-yellow-50"
                                    />
                                    {priceOpt}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-richblack-300 font-semibold mb-2">Sort By</p>
                        <select 
                            value={filters.sort}
                            onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                            className="form-style w-full p-2 text-sm"
                        >
                            <option value="popular">Most Popular</option>
                            <option value="newest">Newest First</option>
                        </select>
                    </div>
                </div>

                {/* Courses Grid */}
                <div className="flex-1 border-t md:border-t-0 md:border-l border-richblack-700 md:pl-8 pt-8 md:pt-0">
                    <div className="section_heading mb-6">Browse All in {catalogPageData?.data?.selectedCategory?.name}</div>
                    
                    {getFilteredCourses().length === 0 ? (
                        <p className="text-richblack-300 text-lg">No courses match your active filters.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {getFilteredCourses().map((course, index) => (
                                <CourseCard course={course} key={index} Height={"h-[200px]"} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* section2 */}
            <div className=" mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
                <div className="section_heading">Top Courses in {catalogPageData?.data?.differentCategory?.name}</div>
                <div className="py-8">
                    <CourseSlider Courses={catalogPageData?.data?.differentCategory?.courses} />
                </div>
            </div>

            {/* section3 */}
            <div className=" mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
                <div className="section_heading">Frequently Bought</div>
                <div className='py-8'>
                    <div className='grid grid-cols-1 gap-5 lg:grid-cols-3'>
                        {
                            catalogPageData?.data?.mostSellingCourses?.slice(0, 6)
                                .map((course, index) => (
                                    <CourseCard course={course} key={index} Height={"h-[220px]"} />
                                ))
                        }
                    </div>
                </div>
                {/* Reviws from Other Learner */}
                <div className="relative mx-auto my-20 flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-8 bg-richblack-900 text-white">
                    <h1 className="text-center text-3xl lg:text-4xl font-semibold mt-8 flex justify-center items-center gap-x-3">
                        Reviews from other learners <MdOutlineRateReview className='text-yellow-25' />
                    </h1>
                    <ReviewSlider />
                </div>
            </div>
            <Footer />
        </>
    )
}

export default Catalog