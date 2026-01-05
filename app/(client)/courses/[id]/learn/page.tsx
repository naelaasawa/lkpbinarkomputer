"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ChevronLeft, ChevronRight, PlayCircle, FileText, CheckCircle, Menu, X, Check } from "lucide-react";
import Link from "next/link";

interface Lesson {
    id: string;
    title: string;
    contentType: "video" | "text" | "file" | "link" | "quiz";
    content: string;
    duration: number;
    order: number;
}

interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
    order: number;
}

interface Course {
    id: string;
    title: string;
    modules: Module[];
}

export default function CoursePlayerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    // Simple completed tracking for now (in-memory, sync with DB later)
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (isLoaded && !user) {
            router.push("/sign-in");
            return;
        }

        const fetchCourse = async () => {
            try {
                // Fetch course details
                const res = await fetch(`/api/courses/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setCourse(data);

                    // Check for lessonId param
                    const lessonId = searchParams.get("lessonId");

                    if (data.modules?.length > 0) {
                        let found = false;
                        if (lessonId) {
                            // Find specific lesson
                            for (const m of data.modules) {
                                const l = m.lessons.find((l: any) => l.id === lessonId);
                                if (l) {
                                    setActiveLesson(l);
                                    setActiveModuleId(m.id);
                                    found = true;
                                    break;
                                }
                            }
                        }

                        // Default to first lesson if not found
                        if (!found && data.modules[0].lessons.length > 0) {
                            setActiveLesson(data.modules[0].lessons[0]);
                            setActiveModuleId(data.modules[0].id);
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
    }, [id, isLoaded, user, searchParams, router]);

    const handleLessonChange = (module: Module, lesson: Lesson) => {
        setActiveLesson(lesson);
        setActiveModuleId(module.id);
        // Ideally update URL without reload
        // router.push(`/courses/${id}/learn?lessonId=${lesson.id}`, { scroll: false });
    };

    const handleNext = () => {
        if (!course || !activeLesson || !activeModuleId) return;

        // Mark current as complete (UI only for now)
        setCompletedLessons(prev => new Set(prev).add(activeLesson.id));

        // Find next lesson
        const currentModuleIndex = course.modules.findIndex(m => m.id === activeModuleId);
        if (currentModuleIndex === -1) return;

        const currentModule = course.modules[currentModuleIndex];
        const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === activeLesson.id);

        if (currentLessonIndex < currentModule.lessons.length - 1) {
            // Next lesson in same module
            setActiveLesson(currentModule.lessons[currentLessonIndex + 1]);
        } else if (currentModuleIndex < course.modules.length - 1) {
            // First lesson of next module
            const nextModule = course.modules[currentModuleIndex + 1];
            if (nextModule.lessons.length > 0) {
                setActiveLesson(nextModule.lessons[0]);
                setActiveModuleId(nextModule.id);
            }
        } else {
            alert("Course Completed! 🎉");
            router.push("/my-learning");
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div></div>;
    if (!course) return <div className="h-screen flex items-center justify-center">Course not found</div>;

    return (
        <div className="flex h-screen bg-white overflow-hidden">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-slate-50 border-r border-slate-200 transition-all duration-300 flex flex-col relative`}>
                <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="font-bold text-slate-800 truncate" title={course.title}>{course.title}</h2>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {course.modules.map((module) => (
                        <div key={module.id} className="border-b border-slate-100">
                            <div className="px-4 py-3 bg-slate-100/50 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                                {module.title}
                            </div>
                            <div>
                                {module.lessons.map((lesson) => {
                                    const isActive = activeLesson?.id === lesson.id;
                                    const isCompleted = completedLessons.has(lesson.id);
                                    return (
                                        <button
                                            key={lesson.id}
                                            onClick={() => handleLessonChange(module, lesson)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors ${isActive ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'hover:bg-slate-50 text-slate-600'
                                                }`}
                                        >
                                            <div className={`mt-0.5 ${isCompleted ? 'text-green-500' : (isActive ? 'text-blue-600' : 'text-slate-400')}`}>
                                                {isCompleted ? <CheckCircle size={16} /> : (lesson.contentType === 'video' ? <PlayCircle size={16} /> : <FileText size={16} />)}
                                            </div>
                                            <span className={`line-clamp-2 ${isActive ? 'font-medium' : ''}`}>{lesson.title}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-slate-200">
                    <Link href="/my-learning" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition">
                        <ChevronLeft size={16} />
                        Back to Dashboard
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full relative">
                {/* Header Toggle */}
                {!sidebarOpen && (
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="absolute top-4 left-4 z-10 p-2 bg-white rounded-lg shadow border border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                        <Menu size={20} />
                    </button>
                )}

                <div className="flex-1 overflow-y-auto p-6 md:p-10">
                    <div className="max-w-4xl mx-auto">
                        {activeLesson ? (
                            <div className="space-y-6">
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{activeLesson.title}</h1>

                                {/* Content Viewer */}
                                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm min-h-[400px]">
                                    {activeLesson.contentType === 'video' ? (
                                        activeLesson.content.includes('youtube') || activeLesson.content.includes('youtu.be') ? (
                                            <iframe
                                                src={activeLesson.content.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                                                className="w-full h-[400px] md:h-[500px]"
                                                allowFullScreen
                                                title={activeLesson.title}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-[400px] bg-black text-white">
                                                <p>Video Player (URL: {activeLesson.content})</p>
                                            </div>
                                        )
                                    ) : (
                                        <div className="p-8 prose max-w-none">
                                            {/* Render Markdown/HTML here safely */}
                                            <div className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed text-lg">
                                                {activeLesson.content || "No content available."}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20 text-slate-400">Select a lesson to start learning</div>
                        )}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="bg-white border-t border-slate-200 px-6 py-4 flex justify-between items-center">
                    <button
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
                        disabled={!activeLesson} // Add prev logic later
                    >
                        Previous
                    </button>

                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow active:scale-95"
                    >
                        Mark as Complete & Next
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
