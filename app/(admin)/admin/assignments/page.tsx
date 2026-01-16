"use client";

import { useEffect, useState } from "react";
import { Search, FileQuestion, CheckCircle, Clock } from "lucide-react";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";

export default function AssignmentsPage() {
    const [assignments, setAssignments] = useState<any[]>([]);
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
        const fetchAssignments = async () => {
            setLoading(true);
            try {
                // Fetch all/large limit
                const url = debouncedSearch
                    ? `/api/admin/assignments?limit=50&query=${encodeURIComponent(debouncedSearch)}`
                    : `/api/admin/assignments?limit=50`;

                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setAssignments(data);
                }
            } catch (error) {
                console.error("Failed to fetch assignments", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, [debouncedSearch]);

    if (loading && !assignments.length) return <Loading />;

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Recent Assignments</h1>
                    <p className="text-slate-500 mt-1">Quiz assignments and their current status.</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by student or quiz title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>
            </div>

            {/* Table / List */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                {assignments.length === 0 ? (
                    <div className="p-12">
                        <EmptyState
                            icon={FileQuestion}
                            title="No assignments found"
                            description={searchQuery ? "Try adjusting your search query." : "No assignments recorded yet."}
                        />
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-slate-700">Quiz Title</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">Student</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">Score</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">Assigned At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {assignments.map((assignment) => (
                                        <tr key={assignment.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {assignment.quiz?.title}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {assignment.user?.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                {assignment.status === "completed" ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                        <CheckCircle size={12} />
                                                        Completed
                                                    </span>
                                                ) : assignment.status === "in_progress" ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                                                        <Clock size={12} />
                                                        In Progress
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                        Assigned
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 font-medium">
                                                {assignment.score !== null ? assignment.score : "-"}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {new Date(assignment.createdAt).toLocaleDateString()} {new Date(assignment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List (Cards) */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {assignments.map((assignment) => (
                                <div key={assignment.id} className="p-4 space-y-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-medium text-slate-900 line-clamp-2">
                                            {assignment.quiz?.title}
                                        </h3>
                                        {assignment.status === "completed" ? (
                                            <span className="shrink-0 text-xs font-semibold bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full border border-emerald-100">
                                                Completed
                                            </span>
                                        ) : assignment.status === "in_progress" ? (
                                            <span className="shrink-0 text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-100">
                                                In Progress
                                            </span>
                                        ) : (
                                            <span className="shrink-0 text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-full border border-slate-200">
                                                Assigned
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                            <span className="truncate">{assignment.user?.email}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-400 pl-3.5 mt-1">
                                            <div>
                                                <span>{new Date(assignment.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="font-medium text-slate-600">
                                                Score: {assignment.score !== null ? assignment.score : "-"}
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
                Showing last {assignments.length} assignments
            </div>
        </div>
    );
}
