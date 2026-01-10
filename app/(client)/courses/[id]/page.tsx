"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Monitor, BookOpen, Clock, PlayCircle, Lock, ChevronDown, ChevronUp, Check, Star, FileText, ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import Loading from "@/components/ui/Loading";

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useUser();
    const router = useRouter();
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [expandedModules, setExpandedModules] = useState<string[]>([]);
    const [enrolling, setEnrolling] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                // Fetch course details
                const res = await fetch(`/api/courses/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setCourse(data);
                    // Expand all modules by default
                    if (data.modules) {
                        setExpandedModules(data.modules.map((m: any) => m.id));
                    }
                }

                // Check enrollment status if user is logged in
                if (user) {
                    const enrollRes = await fetch("/api/my-enrollments");
                    if (enrollRes.ok) {
                        const enrollments = await enrollRes.json();
                        const found = enrollments.find((e: any) => e.courseId === id);
                        if (found) {
                            setIsEnrolled(true);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to load course", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [id, user]);

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev =>
            prev.includes(moduleId)
                ? prev.filter(id => id !== moduleId)
                : [...prev, moduleId]
        );
    };

    const handleEnroll = async () => {
        if (!user) {
            router.push("/sign-in");
            return;
        }

        if (course.price > 0) {
            alert("Payment integration coming soon.");
            return;
        }

        try {
            setEnrolling(true);
            const res = await fetch(`/api/courses/${id}/enroll`, {
                method: "POST",
            });

            if (res.ok || res.status === 400) { // 400 = Already enrolled
                router.push("/my-learning");
            } else {
                alert("Failed to enroll");
            }
        } catch (error) {
            console.error(error);
            alert("Enrollment error");
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) return <Loading />;
    if (!course) return <div className="text-center py-20">Course not found</div>;

    const totalLessons = course.modules?.reduce((acc: number, m: any) => acc + m.lessons.length, 0) || 0;

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Hero Section */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Back Button */}
                        <Link href="/courses" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium">
                            <ArrowLeft size={18} />
                            Kembali ke Daftar Kursus
                        </Link>

                        <div className="flex items-center gap-3">
                            {course.category && (
                                <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wide bg-blue-100 text-blue-700`}>
                                    {course.category.name}
                                </span>
                            )}
                            <span className="text-slate-500 text-sm font-medium">{course.level}</span>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-bold text-slate-800 leading-tight">
                            {course.title}
                        </h1>

                        <p className="text-lg text-slate-600 leading-relaxed">
                            {course.shortDescription || course.description || "Pelajari materi ini dan tingkatkan kemampuan Anda."}
                        </p>

                        <div className="flex flex-wrap gap-6 text-sm text-slate-500 pt-4">
                            <div className="flex items-center gap-2">
                                <BookOpen size={18} />
                                <span>{totalLessons} Lessons</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User size={18} />
                                <span>{course._count?.enrollments || 0} Students</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check size={18} />
                                <span>Certificate of Completion</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Star size={18} className="text-yellow-400 fill-yellow-400" />
                                <span className="text-slate-700 font-bold">4.8</span>
                                <span>({course._count?.reviews || 0} reviews)</span>
                            </div>
                        </div>

                        <div className="pt-6">
                            <h3 className="font-bold text-slate-800 mb-4 text-lg">What you'll learn</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {course.whatYouLearn ? (
                                    JSON.parse(course.whatYouLearn).map((point: string, i: number) => (
                                        <div key={i} className="flex gap-3 text-slate-600 text-sm">
                                            <div className="mt-1 min-w-[16px]"><Check size={16} className="text-green-500" /></div>
                                            <span>{point}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-500 italic">No learning points listed.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sticky top-24">
                            <div className="aspect-video bg-slate-200 rounded-xl mb-6 overflow-hidden relative group cursor-pointer">
                                {course.imageUrl ? (
                                    <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400">
                                        <Monitor size={48} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition flex items-center justify-center">
                                    <PlayCircle size={64} className="text-white drop-shadow-lg opacity-90 group-hover:scale-110 transition-transform" />
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-end gap-2 mb-2">
                                    <span className="text-3xl font-bold text-slate-900">
                                        {isEnrolled ? (
                                            <span className="text-emerald-600 text-2xl">Sudah Terdaftar</span>
                                        ) : (
                                            course.price === 0 ? "Free" : `Rp ${Number(course.price).toLocaleString("id-ID")}`
                                        )}
                                    </span>
                                    {!isEnrolled && course.price > 0 && (
                                        <span className="text-slate-500 line-through text-lg mb-1">
                                            Rp {Number(course.price * 1.5).toLocaleString("id-ID")}
                                        </span>
                                    )}
                                </div>

                                {isEnrolled ? (
                                    <Link
                                        href={`/courses/${id}/learn`}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-200 active:scale-95 group"
                                    >
                                        Lanjut Belajar
                                        <ChevronDown className="rotate-[-90deg] group-hover:translate-x-1 transition-transform" size={18} />
                                    </Link>
                                ) : (
                                    <button
                                        onClick={handleEnroll}
                                        disabled={enrolling}
                                        className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {enrolling ? "Enrolling..." : (course.price === 0 ? "Enroll Now" : "Buy Course")}
                                    </button>
                                )}

                                <p className="text-center text-xs text-slate-400 mt-3">
                                    {isEnrolled ? "You have lifetime access to this course." : "30-Day Money-Back Guarantee"}
                                </p>
                            </div>

                            <div className="space-y-4 text-sm text-slate-600">
                                <div className="flex justify-between border-b border-slate-100 pb-3">
                                    <span>Instructor</span>
                                    <span className="font-semibold text-slate-800">LKP Binar Admin</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 pb-3">
                                    <span>Duration</span>
                                    <span className="font-semibold text-slate-800">Approx. 12h</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 pb-3">
                                    <span>Language</span>
                                    <span className="font-semibold text-slate-800 capitalize">{course.language === 'id' ? 'Indonesian' : 'English'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Curriculum Section */}
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Course Curriculum</h2>

                    <div className="space-y-4">
                        {course.modules?.map((module: any) => (
                            <div key={module.id} className="border border-slate-200 rounded-xl bg-white overflow-hidden">
                                <button
                                    onClick={() => toggleModule(module.id)}
                                    className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100 transition text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        {expandedModules.includes(module.id) ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                                        <h3 className="font-bold text-slate-700">{module.title}</h3>
                                    </div>
                                    <span className="text-sm text-slate-500 font-medium">{module.lessons.length} lessons</span>
                                </button>

                                {expandedModules.includes(module.id) && (
                                    <div className="divide-y divide-slate-100">
                                        {module.lessons.map((lesson: any) => (
                                            <div key={lesson.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition pl-12">
                                                <div className="flex items-center gap-3">
                                                    {lesson.type === 'video' ? <PlayCircle size={16} className="text-blue-500" /> : <FileText size={16} className="text-slate-400" />}
                                                    <span className="text-sm text-slate-600">{lesson.title}</span>
                                                </div>
                                                {/* Lock icon for non-enrolled users, or preview if available */}
                                                <div className="flex items-center gap-2">
                                                    {/* Future: Add 'IsPreview' field */}
                                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[10px] font-bold uppercase rounded">Member Only</span>
                                                    <Lock size={14} className="text-slate-300" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">Description</h2>
                        <div className="prose prose-slate max-w-none text-slate-600">
                            {/* Ideally sanitize this HTML/Markdown */}
                            <div className="whitespace-pre-wrap">{course.fullDescription || course.description || "Deskripsi kursus ini belum tersedia."}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
