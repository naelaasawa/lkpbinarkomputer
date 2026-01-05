"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Search, Filter, PlayCircle, Clock, CheckCircle, BookOpen } from "lucide-react";
import Link from "next/link";

interface Enrollment {
    id: string;
    progress: number;
    lastAccessedAt: string;
    course: {
        id: string;
        title: string;
        description: string;
        level: string;
        imageUrl: string | null;
        category: {
            id: string;
            name: string;
            color: string;
        };
        price: number;
    };
}

export default function MyLearning() {
    const { user, isLoaded } = useUser();
    const [activeTab, setActiveTab] = useState("All");
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded || !user) return;

        const fetchEnrollments = async () => {
            try {
                // Sync user with database first
                await fetch("/api/user/sync", { method: "POST" });

                // Fetch user enrollments
                const res = await fetch("/api/my-enrollments");
                if (res.ok) {
                    const data = await res.json();
                    setEnrollments(data);
                }
            } catch (error) {
                console.error("Failed to fetch enrollments", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEnrollments();
    }, [isLoaded, user]);

    if (!isLoaded || loading) {
        return <div className="p-10 text-center">Loading your courses...</div>;
    }

    // Filter enrollments based on active tab
    const filteredEnrollments =
        activeTab === "All"
            ? enrollments
            : activeTab === "On Progress"
                ? enrollments.filter((e) => e.progress < 100)
                : enrollments.filter((e) => e.progress === 100);

    // Calculate time since last access
    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) return "Just now";
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
        return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
    };

    return (
        <div className="flex flex-col gap-6 px-6 pt-8 pb-20 md:pb-8 min-h-screen bg-slate-50">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Learning</h1>
                    <p className="text-sm text-gray-500">
                        {enrollments.length > 0 ? "Keep up the good work!" : "Start your learning journey"}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 pb-1 overflow-x-auto scrollbar-hide">
                {["All", "On Progress", "Completed"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors relative ${activeTab === tab ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
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
                {filteredEnrollments.length > 0 ? (
                    filteredEnrollments.map((enrollment) => (
                        <div
                            key={enrollment.id}
                            className="bg-white rounded-xl p-4 shadow-sm border border-gray-50 flex flex-col gap-3"
                        >
                            <div className="flex gap-3">
                                <Link
                                    href={enrollment.progress < 100 ? `/courses/${enrollment.course.id}/learn` : `/courses/${enrollment.course.id}`}
                                    className={`w-20 h-20 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0 cursor-pointer overflow-hidden`}
                                >
                                    {enrollment.course.imageUrl ? (
                                        <img src={enrollment.course.imageUrl} alt={enrollment.course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        enrollment.progress === 100 ? (
                                            <CheckCircle className="text-green-600" size={32} />
                                        ) : (
                                            <PlayCircle className="text-blue-600" size={32} />
                                        )
                                    )}
                                </Link>
                                <div className="flex flex-col justify-between w-full">
                                    <div>
                                        <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded w-fit ${enrollment.course.category.color}`}
                                        >
                                            {enrollment.course.category.name}
                                        </span>
                                        <Link 
                                            href={enrollment.progress < 100 ? `/courses/${enrollment.course.id}/learn` : `/courses/${enrollment.course.id}`}
                                            className="text-sm font-bold text-slate-800 mt-1 line-clamp-2 leading-tight hover:text-blue-600 transition-colors block"
                                        >
                                            {enrollment.course.title}
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Section */}
                            <div className="pt-2 border-t border-gray-50">
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-xs font-semibold text-gray-600">
                                        {enrollment.progress}%{" "}
                                        <span className="text-gray-400 font-normal">Complete</span>
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {/* Placeholder lesson count */}
                                        {Math.floor((enrollment.progress / 100) * 24)}/24 Lessons
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${enrollment.progress === 100 ? "bg-green-500" : "bg-blue-600"
                                            }`}
                                        style={{ width: `${enrollment.progress}%` }}
                                    ></div>
                                </div>

                                {enrollment.progress < 100 && (
                                    <button className="w-full mt-3 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white text-xs font-bold rounded-lg shadow-blue-200 shadow-sm">
                                        Continue Learning
                                    </button>
                                )}
                                {enrollment.progress === 100 && (
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
                            <BookOpen className="text-gray-400" size={24} />
                        </div>
                        <h3 className="text-slate-800 font-bold">
                            {activeTab === "All"
                                ? "No enrolled courses yet"
                                : activeTab === "On Progress"
                                    ? "No courses in progress"
                                    : "No completed courses yet"}
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">
                            {activeTab === "All"
                                ? "Start learning by enrolling in a course!"
                                : "Keep learning to complete your courses"}
                        </p>
                        <Link
                            href="/courses"
                            className="mt-4 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-200 hover:bg-blue-700 transition"
                        >
                            Browse Courses
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
