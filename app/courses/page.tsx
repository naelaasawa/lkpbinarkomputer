"use client";

import Link from "next/link";
import { Search, Filter, Star, Monitor, ChevronRight, MoreVertical } from "lucide-react";
import { useState } from "react";

export default function Courses() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const categories = ["All", "Design", "Development", "Marketing", "Business"];

    // Mock data based on the Home screen example
    const courses = [
        {
            id: 1,
            title: "Full Stack Javascript Bootcamp 2025",
            category: "Development",
            price: "Rp 350.000",
            rating: "4.8",
            lessons: "24 Lessons",
            level: "Beginner",
            imageIcon: Monitor
        },
        {
            id: 2,
            title: "UI/UX Design Masterclass: Zero to Hero",
            category: "Design",
            price: "Rp 250.000",
            rating: "4.9",
            lessons: "18 Lessons",
            level: "Beginner",
            imageIcon: Monitor
        },
        {
            id: 3,
            title: "Digital Marketing Strategy 101",
            category: "Marketing",
            price: "Rp 150.000",
            rating: "4.7",
            lessons: "12 Lessons",
            level: "Beignner",
            imageIcon: Monitor
        },
        {
            id: 4,
            title: "Business Data Analysis with Excel",
            category: "Business",
            price: "Rp 200.000",
            rating: "4.6",
            lessons: "15 Lessons",
            level: "Intermediate",
            imageIcon: Monitor
        },
        {
            id: 5,
            title: "Advanced React Patterns",
            category: "Development",
            price: "Rp 450.000",
            rating: "5.0",
            lessons: "30 Lessons",
            level: "Advanced",
            imageIcon: Monitor
        }
    ];

    const filteredCourses = selectedCategory === "All"
        ? courses
        : courses.filter(c => c.category === selectedCategory);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="px-6 pt-8 pb-4 bg-white shadow-sm z-10 sticky top-0">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold text-slate-800">Explore Courses</h1>
                    <button className="p-2 -mr-2 text-gray-400 hover:text-gray-600">
                        <MoreVertical size={20} />
                    </button>
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-lg border-none focus:ring-1 focus:ring-blue-200 outline-none text-sm text-gray-700"
                        />
                    </div>
                    <button className="p-2.5 bg-gray-50 rounded-lg text-gray-600 border border-gray-100">
                        <Filter size={18} />
                    </button>
                </div>

                <div className="flex gap-2 mt-4 overflow-x-auto pb-1 -mx-6 px-6 scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Course List */}
            <div className="p-6 flex flex-col gap-4">
                {filteredCourses.map((course) => (
                    <div key={course.id} className="w-full bg-white rounded-xl p-3 shadow-md border border-gray-50 flex flex-col gap-3">
                        <div className="h-32 bg-gray-200 rounded-lg relative overflow-hidden">
                            {/* Placeholder for course image */}
                            <div className="absolute inset-0 bg-slate-200 flex items-center justify-center text-slate-400">
                                <course.imageIcon size={40} />
                            </div>
                            <div className="absolute top-2 right-2 bg-white px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-700 shadow-sm flex items-center gap-1">
                                <Star size={10} className="fill-yellow-400 text-yellow-400" /> {course.rating}
                            </div>
                        </div>
                        <div>
                            <span className={`text-[10px] font-semibold px-2 py-1 rounded ${course.category === "Design" ? "bg-purple-50 text-purple-600" :
                                    course.category === "Development" ? "bg-blue-50 text-blue-600" :
                                        course.category === "Marketing" ? "bg-orange-50 text-orange-600" :
                                            "bg-green-50 text-green-600"
                                }`}>{course.category}</span>

                            <h4 className="text-sm font-bold text-slate-800 mt-2 line-clamp-2">{course.title}</h4>

                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                <span>{course.lessons}</span>
                                <span>•</span>
                                <span>{course.level}</span>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                                <span className="text-blue-600 font-bold">{course.price}</span>
                                <Link href={`/courses/${course.id}`} className="p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors">
                                    <ChevronRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
