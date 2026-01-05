"use client";

import Link from "next/link";
import { Search, Filter, Star, Monitor, ChevronRight, MoreVertical } from "lucide-react";
import { useState } from "react";

export const CourseList = ({ initialCourses }: { initialCourses: any[] }) => {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const categories = ["All", "Design", "Development", "Marketing", "Business", "Office", "Data"];

    const filteredCourses = selectedCategory === "All"
        ? initialCourses
        : initialCourses.filter(c => c.category.name === selectedCategory);

    return (
        <>
            {/* Header */}
            <div className="px-6 pt-8 pb-4 bg-white shadow-sm z-10 sticky top-0 md:static md:shadow-none md:bg-transparent md:px-0 md:pt-0">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl md:text-2xl font-bold text-slate-800">Explore Courses</h1>
                    <button className="p-2 -mr-2 text-gray-400 hover:text-gray-600 md:hidden">
                        <MoreVertical size={20} />
                    </button>
                    {/* Desktop Sort/Filter controls could go here */}
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1 md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 md:bg-white rounded-lg border-none md:border md:border-slate-200 focus:ring-1 focus:ring-blue-200 outline-none text-sm text-gray-700 md:shadow-sm"
                        />
                    </div>
                    <button className="p-2.5 bg-gray-50 md:bg-white rounded-lg text-gray-600 border border-gray-100 md:border-slate-200 hover:bg-gray-100 transition-colors">
                        <Filter size={18} />
                    </button>
                </div>

                <div className="flex gap-2 mt-4 overflow-x-auto pb-1 -mx-6 px-6 scrollbar-hide md:mx-0 md:px-0 md:flex-wrap">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
                                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Course List */}
            <div className="p-6 md:px-0 flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredCourses.length === 0 ? (
                    <div className="col-span-full py-10 text-center text-gray-500">
                        No courses found in this category.
                    </div>
                ) : (
                    filteredCourses.map((course) => (
                        <div key={course.id} className="w-full bg-white rounded-xl p-3 shadow-md border border-gray-50 flex flex-col gap-3 hover:shadow-lg transition-shadow group">
                            <div className="h-32 md:h-48 bg-gray-200 rounded-lg relative overflow-hidden">
                                {/* Placeholder for course image */}
                                <div className="absolute inset-0 bg-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-slate-300 transition-colors">
                                    <Monitor size={40} className="md:w-12 md:h-12" />
                                </div>
                                <div className="absolute top-2 right-2 bg-white px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-700 shadow-sm flex items-center gap-1">
                                    <Star size={10} className="fill-yellow-400 text-yellow-400" /> 4.8
                                </div>
                            </div>
                            <div>
                                <span className={`text-[10px] font-semibold px-2 py-1 rounded ${course.category.name === "Design" ? "bg-purple-50 text-purple-600" :
                                        course.category.name === "Development" ? "bg-blue-50 text-blue-600" :
                                            course.category.name === "Marketing" ? "bg-orange-50 text-orange-600" :
                                                "bg-gray-100 text-gray-600"
                                    }`}>{course.category.name}</span>

                                <h4 className="text-sm md:text-base font-bold text-slate-800 mt-2 line-clamp-2">{course.title}</h4>

                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                    <span>24 Lessons</span>
                                    <span>•</span>
                                    <span>{course.level}</span>
                                </div>

                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-blue-600 font-bold md:text-lg">Rp {course.price.toLocaleString()}</span>
                                    <Link href={`/courses/${course.id}`} className="p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors">
                                        <ChevronRight size={14} className="md:w-5 md:h-5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
};
