"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ChevronLeft, ChevronRight, PlayCircle, FileText, CheckCircle, Menu, X, Check, ChevronDown, ChevronUp, Star, MessageCircle, Share2, MoreHorizontal, Trophy } from "lucide-react";
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
    description?: string;
    instructor?: string;
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
    const [sidebarOpen, setSidebarOpen] = useState(true); // Right sidebar
    const [activeTab, setActiveTab] = useState("overview");
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

    // Simple completed tracking for now (in-memory, sync with DB later)
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (isLoaded && !user) {
            router.push("/sign-in");
            return;
        }

        const fetchCourse = async () => {
            try {
                const res = await fetch(`/api/courses/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setCourse(data);

                    // Initialize expanded modules (expand all by default or just the first)
                    if (data.modules) {
                        setExpandedModules(new Set(data.modules.map((m: Module) => m.id)));
                    }

                    const lessonId = searchParams.get("lessonId");
                    if (data.modules?.length > 0) {
                        let found = false;
                        if (lessonId) {
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
    };

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => {
            const next = new Set(prev);
            if (next.has(moduleId)) next.delete(moduleId);
            else next.add(moduleId);
            return next;
        });
    };

    const handleNext = () => {
        if (!course || !activeLesson || !activeModuleId) return;
        setCompletedLessons(prev => new Set(prev).add(activeLesson.id));

        const currentModuleIndex = course.modules.findIndex(m => m.id === activeModuleId);
        if (currentModuleIndex === -1) return;

        const currentModule = course.modules[currentModuleIndex];
        const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === activeLesson.id);

        if (currentLessonIndex < currentModule.lessons.length - 1) {
            setActiveLesson(currentModule.lessons[currentLessonIndex + 1]);
        } else if (currentModuleIndex < course.modules.length - 1) {
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

    if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-800"></div></div>;
    if (!course) return <div className="h-screen flex items-center justify-center">Course not found</div>;

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Header / Navbar (Simplified) */}
            <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-4 md:px-6 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <Link href="/my-learning" className="p-2 hover:bg-slate-800 rounded-full transition">
                        <ChevronLeft size={20} className="text-slate-300" />
                    </Link>
                    <div className="w-px h-6 bg-slate-700 mx-2 hidden md:block"></div>
                    <div>
                        <h1 className="font-bold text-sm md:text-base line-clamp-1">{course.title}</h1>
                        {activeLesson && <p className="text-xs text-slate-400 hidden md:block line-clamp-1">Lesson: {activeLesson.title}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 text-sm text-slate-300">
                        <Trophy size={16} className="text-yellow-500" />
                        <span>Your progress</span>
                        <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-[10%]" /> {/* Dynamic later */}
                        </div>
                    </div>
                    <button className="text-white hover:bg-slate-800 p-2 rounded-lg" title="Share">
                        <Share2 size={18} />
                    </button>
                    <button className="text-white hover:bg-slate-800 p-2 rounded-lg md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <Menu size={20} />
                    </button>
                </div>
            </header>

            {/* Main Layout: 2 Columns */}
            <div className="flex flex-1 overflow-hidden relative">

                {/* 1. Main Content Area (Video + Tabs) */}
                <div className={`flex-1 flex flex-col overflow-y-auto bg-white ${sidebarOpen ? 'md:mr-80' : ''} transition-all duration-300`}>

                    {/* Video Player Stage */}
                    <div className="bg-slate-900 w-full aspect-video flex items-center justify-center relative">
                        {activeLesson ? (
                            activeLesson.contentType === 'video' ? (
                                activeLesson.content.includes('youtube') || activeLesson.content.includes('youtu.be') ? (
                                    <iframe
                                        src={activeLesson.content.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                                        className="w-full h-full"
                                        allowFullScreen
                                        title={activeLesson.title}
                                    />
                                ) : (
                                    <div className="text-white text-center">
                                        <PlayCircle size={64} className="mx-auto mb-4 opacity-50" />
                                        <p>Video Source Unavailable</p>
                                    </div>
                                )
                            ) : (
                                <div className="p-10 max-w-3xl w-full h-full overflow-y-auto bg-white text-slate-900">
                                    {/* Text Content in Player Area */}
                                    <div className="prose max-w-none">
                                        <h2 className="text-3xl font-bold mb-6">{activeLesson.title}</h2>
                                        <div dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="text-white">Select a lesson</div>
                        )}
                    </div>

                    {/* Navigation Bar Below Video */}
                    <div className="border-b border-slate-200 p-4 flex justify-between items-center bg-white sticky top-0 z-10">
                        <h2 className="font-bold text-lg md:text-xl text-slate-800 line-clamp-1">
                            {activeLesson?.title || "Overview"}
                        </h2>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-slate-500 hidden md:inline">Lesson {activeLesson?.order! + 1} of {course.modules.find(m => m.id === activeModuleId)?.lessons.length}</span>
                        </div>
                    </div>

                    {/* Tabbed Content (Overview, Q&A, etc.) */}
                    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
                        <div className="border-b border-slate-200 mb-6 flex gap-8">
                            {['overview', 'q&a', 'notes', 'reviews'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-3 text-sm font-bold capitalize transition-colors border-b-2 ${activeTab === tab ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Overview Content */}
                        {activeTab === 'overview' && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-slate-800">About this lesson</h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        {activeLesson?.contentType === 'video'
                                            ? "In this video lesson, we will cover the key concepts demonstrated above. Make sure to take notes and complete any associated exercises."
                                            : "Read through the material above carefully. This lesson provides foundational knowledge for the upcoming modules."}
                                    </p>
                                </div>

                                <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 flex gap-4 items-start">
                                    <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0"></div>
                                    <div>
                                        <p className="font-bold text-slate-900">Instructor Name</p>
                                        <p className="text-sm text-slate-500 mb-2">Senior Developer & Instructor</p>
                                        <p className="text-sm text-slate-600">
                                            {course.description || "No description available for this course."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Other Tabs Placeholders */}
                        {activeTab !== 'overview' && (
                            <div className="py-12 text-center text-slate-400">
                                <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                                <p>{activeTab.toUpperCase()} content coming soon.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Right Sidebar (Curriculum) */}
                <div className={`fixed inset-y-0 right-0 w-80 bg-white border-l border-slate-200 transform transition-transform duration-300 z-30 flex flex-col md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                    {/* Sidebar Header */}
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-800">Course Content</h3>
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 text-slate-500"><X size={20} /></button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto">
                        {course.modules.map((module, mIdx) => {
                            const isExpanded = expandedModules.has(module.id);
                            return (
                                <div key={module.id} className="border-b border-slate-100 last:border-none">
                                    {/* Module Header (Accordion Trigger) */}
                                    <button
                                        onClick={() => toggleModule(module.id)}
                                        className="w-full px-4 py-4 bg-slate-50 hover:bg-slate-100 transition flex justify-between items-start text-left group"
                                    >
                                        <div className="flex-1 pr-2">
                                            <h4 className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition-colors">
                                                Section {mIdx + 1}: {module.title}
                                            </h4>
                                            <p className="text-[10px] text-slate-500 mt-1">
                                                {completedLessons.size} / {module.lessons.length} | {module.lessons.reduce((acc, l) => acc + (l.duration || 5), 0)}min
                                            </p>
                                        </div>
                                        <div className="text-slate-400 mt-0.5">
                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </div>
                                    </button>

                                    {/* Module Lessons */}
                                    {isExpanded && (
                                        <div className="bg-white">
                                            {module.lessons.map((lesson, lIdx) => {
                                                const isActive = activeLesson?.id === lesson.id;
                                                const isCompleted = completedLessons.has(lesson.id);
                                                return (
                                                    <button
                                                        key={lesson.id}
                                                        onClick={() => {
                                                            handleLessonChange(module, lesson);
                                                            if (window.innerWidth < 768) setSidebarOpen(false); // Close on mobile click
                                                        }}
                                                        className={`w-full flex gap-3 px-4 py-3 text-sm text-left hover:bg-slate-50 transition border-l-4 ${isActive ? 'border-blue-600 bg-blue-50/30' : 'border-transparent'}`}
                                                    >
                                                        <div className={`mt-0.5 shrink-0 ${isCompleted ? 'text-blue-600' : 'text-slate-400'}`}>
                                                            {isCompleted
                                                                ? <CheckCircle size={14} className="fill-blue-600 text-white" />
                                                                : (isActive ? <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-600 bg-white" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />)
                                                            }
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className={`line-clamp-2 text-sm ${isActive ? 'font-bold text-blue-700' : 'text-slate-600'}`}>
                                                                {lIdx + 1}. {lesson.title}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                                                                {lesson.contentType === 'video' && <PlayCircle size={10} />}
                                                                {lesson.contentType === 'text' && <FileText size={10} />}
                                                                <span>{lesson.duration || 5}min</span>
                                                            </div>
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
