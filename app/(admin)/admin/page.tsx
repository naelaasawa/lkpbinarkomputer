"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Search, BookOpen, Eye, FileText } from "lucide-react";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";

import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function AdminDashboard() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ courses: 0, students: 0, enrollments: 0 });

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchData = async () => {
        try {
            const [coursesRes, statsRes] = await Promise.all([
                fetch("/api/courses"),
                fetch("/api/stats")
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
            }
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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Course Management</h1>
                    <p className="text-slate-500 mt-1">Manage and organize your course catalogue</p>
                </div>
                <Link href="/admin/courses/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-sm w-fit">
                    <Plus size={20} />
                    <span>Create Course</span>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h3 className="text-slate-500 text-sm font-medium">Total Courses</h3>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{stats.courses}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h3 className="text-slate-500 text-sm font-medium">Total Students</h3>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{stats.students}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h3 className="text-slate-500 text-sm font-medium">Total Enrollments</h3>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{stats.enrollments}</p>
                </div>
            </div>

            {/* Course List Table */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="font-bold text-slate-800">All Courses</h2>
                    <div className="relative">
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
                                <th className="px-6 py-4 font-semibold text-slate-700">Category</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Students</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Price</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Level</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {courses.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8">
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
                                courses.map((course: any) => (
                                    <tr key={course.id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            <div className="flex flex-col">
                                                <span>{course.title}</span>
                                                <span className="text-xs text-slate-400 font-light hidden sm:inline-block">Updated: {new Date(course.updatedAt).toLocaleDateString()}</span>
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
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${course.category?.color || 'bg-gray-100 text-gray-800'}`}>
                                                {course.category?.name || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {course._count?.enrollments || 0}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">Rp {Number(course.price).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-slate-600">{course.level}</td>
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

                {/* Pagination (Visual only for now) */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                    <span>Showing 1 to {courses.length} of {courses.length} entries</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" disabled>Next</button>
                    </div>
                </div>
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
