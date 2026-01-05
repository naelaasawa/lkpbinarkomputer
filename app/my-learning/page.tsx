"use client";

import { useState } from "react";
import { Search, Filter, PlayCircle, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function MyLearning() {
    const [activeTab, setActiveTab] = useState("On Progress");

    const myCourses = [
        {
            id: 1,
            title: "Master Web Development in 30 Days",
            category: "Coding",
            progress: 35,
            totalLessons: 42,
            completedLessons: 15,
            imageColor: "bg-blue-100",
            status: "On Progress",
            lastAccessed: "2 hours ago"
        },
        {
            id: 2,
            title: "UI/UX Design Fundamentals",
            category: "Design",
            progress: 80,
            totalLessons: 20,
            completedLessons: 16,
            imageColor: "bg-purple-100",
            status: "On Progress",
            lastAccessed: "1 day ago"
        },
        {
            id: 3,
            title: "Introduction to Data Science",
            category: "Data",
            progress: 100,
            totalLessons: 12,
            completedLessons: 12,
            imageColor: "bg-green-100",
            status: "Completed",
            lastAccessed: "1 week ago"
        }
    ];

    const filteredCourses = activeTab === "All"
        ? myCourses
        : myCourses.filter(c => c.status === activeTab);

    return (
        <div className="flex flex-col gap-6 px-6 pt-8 min-h-screen bg-slate-50">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Learning</h1>
                    <p className="text-sm text-gray-500">Keep up the good work!</p>
                </div>
                <button className="p-2 bg-white rounded-full shadow-sm border border-gray-100">
                    <Search size={20} className="text-gray-600" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 pb-1 overflow-x-auto scrollbar-hide">
                {["All", "On Progress", "Completed"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors relative ${activeTab === tab
                                ? "text-blue-600"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <span className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-blue-600 rounded-full"></span>
                        )}
                    </button>
                ))}
            </div>

            {/* Course List */}
            <div className="flex flex-col gap-4 pb-4">
                {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                        <div key={course.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-50 flex flex-col gap-3">
                            <div className="flex gap-3">
                                <div className={`w-20 h-20 rounded-lg ${course.imageColor} flex items-center justify-center flex-shrink-0`}>
                                    {course.status === "Completed" ? (
                                        <CheckCircle className="text-green-600 opacity-50" size={32} />
                                    ) : (
                                        <PlayCircle className="text-blue-600 opacity-50" size={32} />
                                    )}
                                </div>
                                <div className="flex flex-col justify-between w-full">
                                    <div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded w-fit ${course.category === "Design" ? "bg-purple-50 text-purple-600" :
                                                course.category === "Coding" ? "bg-blue-50 text-blue-600" :
                                                    "bg-green-50 text-green-600"
                                            }`}>
                                            {course.category}
                                        </span>
                                        <h3 className="text-sm font-bold text-slate-800 mt-1 line-clamp-2 leading-tight">
                                            {course.title}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                        <Clock size={12} />
                                        <span>{course.lastAccessed}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Section */}
                            <div className="pt-2 border-t border-gray-50">
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-xs font-semibold text-gray-600">
                                        {course.progress}% <span className="text-gray-400 font-normal">Complete</span>
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {course.completedLessons}/{course.totalLessons} Lessons
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${course.status === "Completed" ? "bg-green-500" : "bg-blue-600"
                                            }`}
                                        style={{ width: `${course.progress}%` }}
                                    ></div>
                                </div>

                                {course.status !== "Completed" && (
                                    <button className="w-full mt-3 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white text-xs font-bold rounded-lg shadow-blue-200 shadow-sm">
                                        Continue Learning
                                    </button>
                                )}
                                {course.status === "Completed" && (
                                    <button className="w-full mt-3 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200">
                                        View Certificate
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <Filter className="text-gray-400" size={24} />
                        </div>
                        <h3 className="text-slate-800 font-bold">No courses found</h3>
                        <p className="text-gray-500 text-sm mt-1">Try changing the filter or explore new courses.</p>
                        <Link href="/" className="mt-4 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-200">
                            Browse Courses
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
