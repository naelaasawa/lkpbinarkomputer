"use client";

import { useEffect, useState } from "react";
import { Search, BookOpen, Plus, Edit, Trash2, MoreVertical, Eye } from "lucide-react";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import toast from "react-hot-toast";

export default function CoursesPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Delete State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const url = debouncedSearch
                ? `/api/admin/courses?query=${encodeURIComponent(debouncedSearch)}`
                : `/api/admin/courses`;

            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setCourses(data);
            }
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [debouncedSearch]);

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCourseToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!courseToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/courses/${courseToDelete}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Course deleted successfully");
                fetchCourses(); // Refresh
            } else {
                toast.error("Failed to delete course");
            }
        } catch (error) {
            console.error("Error deleting course:", error);
            toast.error("Something went wrong");
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setCourseToDelete(null);
        }
    };

    if (loading && !courses.length) return <Loading />;

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Courses</h1>
                    <p className="text-slate-500 mt-1">Manage all your courses here.</p>
                </div>
                <Link href="/admin/courses/create">
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition w-full sm:w-auto justify-center">
                        <Plus size={18} />
                        Create New Course
                    </button>
                </Link>
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

            {/* Table / List */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                {courses.length === 0 ? (
                    <div className="p-12">
                        <EmptyState
                            icon={BookOpen}
                            title="No courses found"
                            description={searchQuery ? "Try adjusting your search query." : "You haven't created any courses yet."}
                            action={
                                !searchQuery ? (
                                    <Link href="/admin/courses/create">
                                        <button className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                                            <Plus size={18} />
                                            Create First Course
                                        </button>
                                    </Link>
                                ) : undefined
                            }
                        />
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto min-h-[400px]">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-slate-700">Title</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">Category</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">Price</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">Stats</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {courses.map((course) => (
                                        <tr key={course.id} className="hover:bg-slate-50 transition group cursor-pointer" onClick={() => router.push(`/admin/courses/${course.id}/edit`)}>
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                <div className="flex items-center gap-3">
                                                    {course.imageUrl ? (
                                                        <img src={course.imageUrl} alt="" className="w-10 h-10 rounded-md object-cover bg-slate-200" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center text-slate-400">
                                                            <BookOpen size={20} />
                                                        </div>
                                                    )}
                                                    <span className="line-clamp-1 max-w-[200px]">{course.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {course.category ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                                                        {course.category.name}
                                                    </span>
                                                ) : <span className="text-slate-400 italic">Uncategorized</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                {course.published ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                        Published
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                        Draft
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-700">
                                                {course.price === 0 ? "Free" : `Rp ${course.price.toLocaleString('id-ID')}`}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500">
                                                <div className="flex flex-col gap-1">
                                                    <span>{course._count?.enrollments || 0} Students</span>
                                                    <span>{course._count?.modules || 0} Modules</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <Link href={`/admin/courses/${course.id}/edit`}>
                                                        <button className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition" title="Edit">
                                                            <Edit size={16} />
                                                        </button>
                                                    </Link>
                                                    <button
                                                        onClick={(e) => handleDeleteClick(course.id, e)}
                                                        className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List (Cards) */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {courses.map((course) => (
                                <div key={course.id} className="p-4 space-y-4" onClick={() => router.push(`/admin/courses/${course.id}`)}>
                                    <div className="flex gap-4">
                                        {course.imageUrl ? (
                                            <img src={course.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover bg-slate-200 shrink-0" />
                                        ) : (
                                            <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                                <BookOpen size={24} />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <h3 className="font-semibold text-slate-900 line-clamp-2 leading-tight">
                                                    {course.title}
                                                </h3>
                                                <button className="text-slate-400 p-1 -mr-2" onClick={(e) => { e.stopPropagation(); /* Maybe show action sheet */ }}>
                                                    {/* <MoreVertical size={16} /> */}
                                                    {/* Simplification: Just show badge */}
                                                </button>
                                            </div>
                                            <div className="mt-1 flex items-center gap-2">
                                                {course.published ? (
                                                    <span className="text-[10px] uppercase tracking-wider font-bold bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100">
                                                        Published
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                                                        Draft
                                                    </span>
                                                )}
                                                <span className="text-xs text-slate-500">
                                                    • {course.category?.name || "Uncategorized"}
                                                </span>
                                            </div>
                                            <div className="mt-2 font-bold text-blue-600 text-sm">
                                                {course.price === 0 ? "Free" : `Rp ${course.price.toLocaleString('id-ID', { notation: 'compact' })}`}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                        <div className="flex gap-4 text-xs text-slate-500">
                                            <span>{course._count?.enrollments || 0} Students</span>
                                            <span>{course._count?.modules || 0} Modules</span>
                                        </div>
                                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                            <Link href={`/admin/courses/${course.id}/edit`}>
                                                <button className="p-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium border border-slate-200">
                                                    Edit
                                                </button>
                                            </Link>
                                            <button
                                                onClick={(e) => handleDeleteClick(course.id, e)}
                                                className="p-2 bg-red-50 text-red-600 rounded-lg text-xs font-medium border border-red-100"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="text-center text-xs text-slate-400">
                Total {courses.length} courses
            </div>

            <ConfirmDialog
                isOpen={showDeleteModal}
                onClose={() => !isDeleting && setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Course?"
                message="This action cannot be undone. All lessons, progress, and student data related to this course will be permanently deleted."
                confirmText={isDeleting ? "Deleting..." : "Delete Permanently"}
                cancelText="Cancel"
                variant="danger"
                loading={isDeleting}
            />
        </div>
    );
}
