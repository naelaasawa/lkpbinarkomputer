"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Search, BookOpen, Eye, FileText, TrendingUp, Users, Book } from "lucide-react";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from "recharts";
import { CreateCourseCard, RecentQuizzesWidget, RecentReviewsWidget, RecentUsersWidget, AdminListWidget } from "@/components/admin/DashboardWidgets";

export default function AdminDashboard() {
    const [courses, setCourses] = useState<any[]>([]);

    // Additional Data States
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [recentReviews, setRecentReviews] = useState<any[]>([]);
    const [recentQuizzes, setRecentQuizzes] = useState<any[]>([]);
    const [admins, setAdmins] = useState<any[]>([]);
    const [graphData, setGraphData] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ courses: 0, students: 0, enrollments: 0 });

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchData = async () => {
        try {
            const [coursesRes, statsRes, usersRes, reviewsRes, quizzesRes, adminsRes] = await Promise.all([
                fetch("/api/courses"),
                fetch("/api/stats"),
                fetch("/api/admin/users"),
                fetch("/api/admin/reviews"),
                fetch("/api/admin/quizzes"),
                fetch("/api/admin/admins")
            ]);

            if (coursesRes.ok) {
                const data = await coursesRes.json();
                setCourses(data);
            }
            if (statsRes.ok) {
                const data = await statsRes.json();
                setStats({
                    courses: data.coursesCount,
                    students: data.studentsCount,
                    enrollments: data.enrollmentsCount
                });
                if (data.graphData) {
                    setGraphData(data.graphData);
                }
            }
            if (usersRes.ok) setRecentUsers(await usersRes.json());
            if (reviewsRes.ok) setRecentReviews(await reviewsRes.json());
            if (quizzesRes.ok) setRecentQuizzes(await quizzesRes.json());
            if (adminsRes.ok) setAdmins(await adminsRes.json());

        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteClick = (id: string) => {
        setCourseToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!courseToDelete) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/courses/${courseToDelete}`, { method: "DELETE" });
            if (res.ok) {
                // Optimistic update
                setCourses(courses.filter(c => c.id !== courseToDelete));
                // Update stats locally or refetch
                fetchData();
                setShowDeleteModal(false);
                setCourseToDelete(null);
            } else {
                const errorText = await res.text();
                alert(`Failed to delete course: ${res.status} ${errorText}`);
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("An error occurred while deleting the course. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
                    <p className="text-slate-500 mt-1">Welcome back! Here's what's happening today.</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <h3 className="text-slate-500 text-sm font-medium">Total Courses</h3>
                        <p className="text-3xl font-bold text-slate-800 mt-2">{stats.courses}</p>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Book size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <h3 className="text-slate-500 text-sm font-medium">Total Students</h3>
                        <p className="text-3xl font-bold text-slate-800 mt-2">{stats.students}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                        <Users size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <h3 className="text-slate-500 text-sm font-medium">Total Enrollments</h3>
                        <p className="text-3xl font-bold text-slate-800 mt-2">{stats.enrollments}</p>
                    </div>
                    <div className="p-3 bg-fuchsia-50 text-fuchsia-600 rounded-lg">
                        <TrendingUp size={24} />
                    </div>
                </div>
            </div>

            {/* Middle Section: Chart & Create Course */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Revenue/Enrollment Chart (3 Cols) */}
                <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-800">Enrollment & Revenue Trend</h2>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={graphData}>
                                <defs>
                                    <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area yAxisId="left" type="monotone" dataKey="enrollments" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorEnrollments)" name="Enrollments" />
                                <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (Rp)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Create Course (1 Col) */}
                <div className="lg:col-span-1 h-full">
                    <CreateCourseCard />
                </div>
            </div>

            {/* Bottom Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <RecentUsersWidget users={recentUsers} />
                <RecentReviewsWidget reviews={recentReviews} />
                <RecentQuizzesWidget quizzes={recentQuizzes} />
                <AdminListWidget admins={admins} />
            </div>

            {/* Courses Table (Full Width) */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="font-bold text-slate-800">All Courses</h2>
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" placeholder="Search courses..." className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700">Course Title</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                                {/* <th className="px-6 py-4 font-semibold text-slate-700">Price</th> */}
                                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {courses.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8">
                                        <EmptyState
                                            icon={BookOpen}
                                            title="No courses yet"
                                            description="Create your first course to get started!"
                                            action={
                                                <Link href="/admin/courses/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 hover:bg-blue-700 transition shadow-sm mt-2">
                                                    <Plus size={20} />
                                                    <span>Create Course</span>
                                                </Link>
                                            }
                                        />
                                    </td>
                                </tr>
                            ) : (
                                courses.slice(0, 10).map((course: any) => (
                                    <tr key={course.id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            <div className="flex flex-col">
                                                <span>{course.title}</span>
                                                <span className="text-xs text-slate-400 font-light hidden sm:inline-block">Rp {Number(course.price).toLocaleString()} • {course.level}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {course.published || course.visibility === "public" ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    Public
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                    Draft
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/courses/${course.id}`}
                                                    target="_blank"
                                                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                                    title="View Public Page"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                                <Link href={`/admin/courses/${course.id}/edit`} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition" title="Edit Course">
                                                    <FileText size={18} />
                                                </Link>
                                                <button onClick={() => handleDeleteClick(course.id)} className="p-2 text-red-500 hover:bg-red-50 rounded transition" title="Delete Course">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {courses.length > 0 && <div className="bg-slate-50 p-3 text-center border-t border-slate-100">
                    <Link href="/admin/courses" className="text-sm text-blue-600 hover:underline font-medium">View All Courses</Link>
                </div>}
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmDialog
                isOpen={showDeleteModal}
                onClose={() => !isDeleting && setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Hapus Kursus?"
                message="Tindakan ini tidak dapat dibatalkan. Semua proges siswa dan data terkait kursus ini akan dihapus permanen."
                confirmText={isDeleting ? "Menghapus..." : "Hapus Permanen"}
                cancelText="Batal"
                variant="danger"
                loading={isDeleting}
            />
        </div>
    );
}
