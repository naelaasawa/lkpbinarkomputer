"use client";

import { useEffect, useState } from "react";
import { Search, TrendingUp, Users, Star, Award } from "lucide-react";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
import Link from "next/link";

export default function TopCoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                // Fetch all/large limit
                const url = debouncedSearch
                    ? `/api/admin/top-courses?limit=50&query=${encodeURIComponent(debouncedSearch)}`
                    : `/api/admin/top-courses?limit=50`;

                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setCourses(data);
                }
            } catch (error) {
                console.error("Failed to fetch top courses", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [debouncedSearch]);

    if (loading && !courses.length) return <Loading />;

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Top Performing Courses</h1>
                    <p className="text-slate-500 mt-1">Courses ranked by enrollment popularity.</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>
            </div>

            {/* Stats Widgets */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider">
                        <Users size={14} />
                        Total Students
                    </div>
                    <div className="text-2xl font-bold text-slate-800">
                        {courses.reduce((acc, curr) => acc + (curr._count?.enrollments || 0), 0).toLocaleString()}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider">
                        <TrendingUp size={14} />
                        Est. Revenue
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">
                        Rp {courses.reduce((acc, curr) => acc + (Number(curr.price) * (curr._count?.enrollments || 0)), 0).toLocaleString('id-ID', { notation: 'compact' })}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider">
                        <Star size={14} />
                        Total Reviews
                    </div>
                    <div className="text-2xl font-bold text-amber-500">
                        {courses.reduce((acc, curr) => acc + (curr._count?.reviews || 0), 0).toLocaleString()}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider">
                        <Award size={14} />
                        Avg. Students
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                        {(courses.length > 0 ? Math.round(courses.reduce((acc, curr) => acc + (curr._count?.enrollments || 0), 0) / courses.length) : 0).toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Table / List */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                {courses.length === 0 ? (
                    <div className="p-12">
                        <EmptyState
                            icon={TrendingUp}
                            title="No courses found"
                            description={searchQuery ? "Try adjusting your search query." : "No course data available."}
                        />
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-slate-700 w-16">Rank</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">Course</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">Category</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">Students</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">Reviews</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">Revenue (Est.)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {courses.map((course, index) => (
                                        <tr key={course.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4">
                                                <div className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-sm ${index === 0 ? 'bg-amber-100 text-amber-600' :
                                                    index === 1 ? 'bg-slate-100 text-slate-600' :
                                                        index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400'
                                                    }`}>
                                                    #{index + 1}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                <div className="flex flex-col">
                                                    <span>{course.title}</span>
                                                    <span className="text-xs text-slate-500 font-normal mt-0.5">
                                                        Rp {Number(course.price).toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {course.category ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                                                        {course.category.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic">Uncategorized</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <Users size={14} className="text-slate-400" />
                                                    {course._count?.enrollments || 0}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <Star size={14} className="text-amber-400 fill-amber-400" />
                                                    {course._count?.reviews || 0}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-emerald-600">
                                                Rp {(Number(course.price) * (course._count?.enrollments || 0)).toLocaleString('id-ID', { notation: 'compact' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List (Cards) */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {courses.map((course, index) => (
                                <div key={course.id} className="p-4 space-y-3 relative">
                                    <div className="absolute right-4 top-4 text-xs font-bold text-slate-300">
                                        #{index + 1}
                                    </div>
                                    <div className="pr-8">
                                        <h3 className="font-medium text-slate-900 line-clamp-2 mb-1">
                                            {course.title}
                                        </h3>
                                        <div className="text-xs text-slate-500">
                                            {course.category?.name || "Uncategorized"}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                                        <div>
                                            <div className="text-xs text-slate-400 mb-0.5">Students</div>
                                            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                                                <Users size={14} />
                                                {course._count?.enrollments || 0}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-400 mb-0.5">Revenue</div>
                                            <div className="text-sm font-medium text-emerald-600">
                                                Rp {(Number(course.price) * (course._count?.enrollments || 0)).toLocaleString('id-ID', { notation: 'compact' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="text-center text-xs text-slate-400">
                Showing top {courses.length} courses
            </div>
        </div >
    );
}
