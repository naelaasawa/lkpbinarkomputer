"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { PlayCircle, CheckCircle, BookOpen, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";

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
        modules: { id: string; lessons: { id: string; duration: number }[] }[];
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
        return <Loading />;
    }

    // Filter enrollments based on active tab
    const filteredEnrollments =
        activeTab === "All"
            ? enrollments
            : activeTab === "On Progress"
                ? enrollments.filter((e) => e.progress < 100)
                : enrollments.filter((e) => e.progress === 100);

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header Section with Gradient */}
            <div className="bg-slate-900 text-white pt-12 pb-24 px-6 md:px-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-10 translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500 rounded-full blur-3xl opacity-10 -translate-x-1/3 translate-y-1/3"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Pembelajaran Saya</h1>
                    <p className="text-slate-400 text-lg">
                        {enrollments.length > 0
                            ? "Lanjutkan progres belajar Anda hari ini!"
                            : "Mulai perjalanan belajar Anda disini"}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-12 relative z-20">
                {/* Tabs */}
                <div className="flex gap-2 mb-8 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-sm w-fit border border-slate-200/50">
                    {["All", "On Progress", "Completed"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === tab
                                ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                                : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-900"
                                }`}
                        >
                            {tab === "All" ? "Semua" : tab === "On Progress" ? "Sedang Berjalan" : "Selesai"}
                        </button>
                    ))}
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredEnrollments.length > 0 ? (
                        filteredEnrollments.map((enrollment) => {
                            const isCompleted = enrollment.progress === 100;
                            const totalLessons = enrollment.course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0;

                            return (
                                <div
                                    key={enrollment.id}
                                    className="group bg-white rounded-2xl border border-slate-200/60 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
                                >
                                    {/* Card Image */}
                                    <Link
                                        href={isCompleted ? `/courses/${enrollment.course.id}` : `/courses/${enrollment.course.id}/learn`}
                                        className="relative aspect-video block overflow-hidden bg-slate-100"
                                    >
                                        {enrollment.course.imageUrl ? (
                                            <img
                                                src={enrollment.course.imageUrl.startsWith("http") || enrollment.course.imageUrl.startsWith("/") ? enrollment.course.imageUrl : `/${enrollment.course.imageUrl}`}
                                                alt={enrollment.course.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <PlayCircle size={48} />
                                            </div>
                                        )}

                                        {/* Overlay Play Button */}
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300">
                                            <div className="w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition-all">
                                                <PlayCircle className="text-slate-900 ml-1" size={24} />
                                            </div>
                                        </div>

                                        {/* Category Badge */}
                                        <span className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-lg shadow-sm backdrop-blur-md ${enrollment.course.category.color || 'bg-white text-slate-800'}`}>
                                            {enrollment.course.category.name}
                                        </span>
                                    </Link>

                                    {/* Helper to ensure correct image path */}
                                    {/* We define it outside map or inline to be safe */}
                                    {/* Actually cleaner to use a utility or inline logical check */}


                                    {/* Card Content */}
                                    <div className="p-5 flex flex-col flex-1">
                                        <Link
                                            href={isCompleted ? `/courses/${enrollment.course.id}` : `/courses/${enrollment.course.id}/learn`}
                                            className="font-bold text-slate-800 text-lg leading-tight mb-2 line-clamp-2 hover:text-blue-600 transition-colors"
                                        >
                                            {enrollment.course.title}
                                        </Link>

                                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                                            <span className="flex items-center gap-1">
                                                <BookOpen size={14} />
                                                {totalLessons} Materi
                                            </span>
                                            {/* Could add duration estimate here if available */}
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-slate-100">
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-xs font-semibold text-slate-700">
                                                    Progres Belajar
                                                </span>
                                                <span className={`text-xs font-bold ${isCompleted ? 'text-emerald-600' : 'text-blue-600'}`}>
                                                    {enrollment.progress}%
                                                </span>
                                            </div>

                                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-4">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${isCompleted
                                                        ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                                                        : "bg-gradient-to-r from-blue-400 to-blue-600"
                                                        }`}
                                                    style={{ width: `${enrollment.progress}%` }}
                                                ></div>
                                            </div>

                                            {isCompleted ? (
                                                <button className="w-full py-2.5 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-xl border border-emerald-100 hover:bg-emerald-100 transition flex items-center justify-center gap-2">
                                                    <CheckCircle size={16} />
                                                    Selesai
                                                </button>
                                            ) : (
                                                <Link
                                                    href={`/courses/${enrollment.course.id}/learn`}
                                                    className="w-full py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-200 hover:bg-slate-800 hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 group/btn"
                                                >
                                                    Lanjutkan
                                                    <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full">
                            <EmptyState
                                icon={BookOpen}
                                title={activeTab === "All"
                                    ? "Belum ada kursus yang diikuti"
                                    : activeTab === "On Progress"
                                        ? "Tidak ada kursus yang sedang berjalan"
                                        : "Belum ada kursus yang selesai"}
                                description={activeTab === "All"
                                    ? "Mulai perjalanan belajar Anda dengan mendaftar di kursus-kursus menarik kami."
                                    : "Ayo semangat belajar untuk menyelesaikan kursusmu!"}
                                action={
                                    <Link
                                        href="/courses"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all active:scale-95"
                                    >
                                        Jelajahi Kursus
                                    </Link>
                                }
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
