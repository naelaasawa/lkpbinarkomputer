"use client";

import { useEffect, useState } from "react";
import { Search, BookOpen, AlertCircle, TrendingUp, Users, Calendar } from "lucide-react";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";

export default function EnrollmentsPage() {
    const [enrollments, setEnrollments] = useState<any[]>([]);
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
        const fetchEnrollments = async () => {
            setLoading(true);
            try {
                // Fetch all (or large limit)
                const url = debouncedSearch
                    ? `/api/admin/enrollments?limit=50&query=${encodeURIComponent(debouncedSearch)}`
                    : `/api/admin/enrollments?limit=50`;

                const res = await fetch(url);
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
    }, [debouncedSearch]);

    if (loading && !enrollments.length) return <Loading />;

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Recent Enrollments</h1>
                    <p className="text-slate-500 mt-1">Manage and view student enrollments.</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by student email or course title..."
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
                        <BookOpen size={14} />
                        Total Enrollments
                    </div>
                    <div className="text-2xl font-bold text-slate-800">
                        {enrollments.length.toLocaleString()}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider">
                        <TrendingUp size={14} />
                        Total Revenue
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">
                        Rp {enrollments.reduce((acc, curr) => acc + (Number(curr.course?.price) || 0), 0).toLocaleString('id-ID', { notation: 'compact' })}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider">
                        <Users size={14} />
                        Unique Students
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                        {new Set(enrollments.map(e => e.user?.email)).size.toLocaleString()}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider">
                        <Calendar size={14} />
                        Enrolled Today
                    </div>
                    <div className="text-2xl font-bold text-amber-500">
                        {enrollments.filter(e => new Date(e.createdAt).toDateString() === new Date().toDateString()).length.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Table / List */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                {enrollments.length === 0 ? (
                    <div className="p-12">
                        <EmptyState
                            icon={BookOpen}
                            title="No enrollments found"
                            description={searchQuery ? "Try adjusting your search query." : "No students have enrolled yet."}
                        />
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-slate-700">Course</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">Student</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">Price</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">Enrolled At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {enrollments.map((enrollment) => (
                                        <tr key={enrollment.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {enrollment.course?.title}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {enrollment.user?.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                                                    Rp {Number(enrollment.course?.price || 0).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {new Date(enrollment.createdAt).toLocaleDateString()} {new Date(enrollment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List (Cards) */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {enrollments.map((enrollment) => (
                                <div key={enrollment.id} className="p-4 space-y-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-medium text-slate-900 line-clamp-2">
                                            {enrollment.course?.title}
                                        </h3>
                                        <span className="shrink-0 text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-100">
                                            Rp {Number(enrollment.course?.price || 0).toLocaleString('id-ID', { notation: 'compact' })}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                            <span className="truncate">{enrollment.user?.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 pl-3.5">
                                            <span>{new Date(enrollment.createdAt).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>{new Date(enrollment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="text-center text-xs text-slate-400">
                Showing last {enrollments.length} enrollments
            </div>
        </div>
    );
}
