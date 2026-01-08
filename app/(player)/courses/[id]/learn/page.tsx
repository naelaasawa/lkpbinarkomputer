"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ChevronLeft, ChevronRight, PlayCircle, FileText, CheckCircle, Menu, X, Check, ChevronDown, ChevronUp, Star, MessageCircle, Share2, MoreHorizontal, Trophy, ArrowLeft } from "lucide-react";
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

    if (loading) return <div className="h-screen flex items-center justify-center bg-slate-900 text-white"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
    if (!course) return <div className="h-screen flex items-center justify-center bg-slate-900 text-white">Course not found</div>;

    const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    const progressPercentage = Math.round((completedLessons.size / totalLessons) * 100) || 0;

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Header / Navbar (Simplified) */}
            <header className="h-14 bg-slate-900 text-white flex items-center justify-between px-4 shrink-0 z-40 border-b border-slate-800">
                <div className="flex items-center gap-4">
                    <Link href="/my-learning" className="flex items-center gap-2 text-slate-300 hover:text-white transition group">
                        <div className="p-1 rounded bg-slate-800 group-hover:bg-slate-700">
                            <ChevronLeft size={16} />
                        </div>
                        <span className="font-bold text-sm hidden md:inline">Back to courses</span>
                    </Link>
                    <div className="w-px h-6 bg-slate-700 mx-2 hidden md:block"></div>
                    <h1 className="font-bold text-sm md:text-base line-clamp-1">{course.title}</h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-3 text-xs text-slate-300">
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1 font-bold text-white">
                                <Trophy size={12} className="text-yellow-400" />
                                <span>{progressPercentage}% Completed</span>
                            </div>
                            <span className="text-[10px] text-slate-400">{completedLessons.size}/{totalLessons} Lessons</span>
                        </div>
                        <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                        </div>
                    </div>

                    <button className="text-white hover:bg-slate-800 p-2 rounded-lg" title="Share">
                        <Share2 size={18} />
                    </button>
                    <button
                        className={`text-white hover:bg-slate-800 p-2 rounded-lg transition-colors ${!sidebarOpen ? 'bg-slate-800 text-blue-400' : ''}`}
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        title="Toggle Sidebar"
                    >
                        <Menu size={20} />
                    </button>
                </div>
            </header>

            {/* Main Layout: 2 Columns */}
            <div className="flex flex-1 overflow-hidden relative">

                {/* 1. Main Content Area (Video + Tabs) */}
                <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50 relative">

                    {/* Video Player Stage */}
                    <div className="bg-black w-full shadow-lg relative aspect-video md:aspect-[21/9] lg:aspect-[16/6] xl:aspect-[21/9] 2xl:aspect-[21/8]">
                        {/* This container tries to be cinematic but responsive */}
                        <div className="absolute inset-0 flex items-center justify-center">
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
                                    <div className="absolute inset-0 bg-white overflow-y-auto w-full h-full p-8 md:p-12">
                                        <div className="max-w-3xl mx-auto prose prose-slate lg:prose-lg">
                                            <h1>{activeLesson.title}</h1>
                                            <div dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="text-white">Select a lesson</div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Bar Below Video */}
                    <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-sm">
                        <div className="flex-1">
                            <h2 className="font-bold text-xl text-slate-900 mb-1">{activeLesson?.title || "Course Overview"}</h2>
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wide">
                                    {activeLesson?.contentType || "Lesson"}
                                </span>
                                <span>•</span>
                                <span>Last updated Jan 2026</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabbed Content (Overview, Q&A, etc.) */}
                    <div className="max-w-6xl mx-auto w-full p-6 md:p-8">
                        <div className="border-b border-slate-200 mb-6 flex gap-8">
                            {['overview', 'q&a', 'notes', 'reviews'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-3 text-sm font-bold capitalize transition-all border-b-2 ${activeTab === tab ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Overview Content */}
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold text-slate-800">About this lesson</h3>
                                        <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                                            {activeLesson?.contentType === 'video'
                                                ? "In this video lesson, we will cover the key concepts demonstrated above. Make sure to take notes and complete any associated exercises."
                                                : "Read through the material above carefully. This lesson provides foundational knowledge for the upcoming modules."}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-slate-800">Key Topics</h3>
                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {[1, 2, 3, 4].map(i => (
                                                <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Check size={16} className="text-green-500 shrink-0" />
                                                    <span>Topic point {i} coverage</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                                        <h4 className="font-bold text-slate-900 mb-4">Instructor</h4>
                                        <div className="flex gap-4 items-center mb-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">IN</div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">Instructor Name</p>
                                                <p className="text-xs text-slate-500">Senior Developer</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed">
                                            {course.description || "Expert instructor with 10+ years of experience in the field."}
                                        </p>
                                    </div>

                                    <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-slate-900">Resources</h4>
                                            <FileText size={18} className="text-slate-400" />
                                        </div>
                                        <div className="space-y-2">
                                            <button className="w-full flex items-center gap-3 p-3 text-sm text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-100 transition text-left">
                                                <FileText size={16} className="text-blue-500" />
                                                <span>Lesson_slides.pdf</span>
                                            </button>
                                            <button className="w-full flex items-center gap-3 p-3 text-sm text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-100 transition text-left">
                                                <FileText size={16} className="text-blue-500" />
                                                <span>Source_code.zip</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Other Tabs Placeholders */}
                        {activeTab !== 'overview' && (
                            <div className="py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200 border-dashed">
                                <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="font-medium text-slate-600">{activeTab.toUpperCase()}</p>
                                <p className="text-sm">This section is currently empty.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Right Sidebar (Curriculum) */}
                <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white border-l border-slate-200 transform transition-transform duration-300 z-50 flex flex-col md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                    {/* Sidebar Header */}
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
                        <h3 className="font-bold text-slate-900">Course Content</h3>
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 hover:bg-slate-100 rounded-full text-slate-500"><X size={20} /></button>
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
                                                {module.lessons.filter(l => completedLessons.has(l.id)).length} / {module.lessons.length} | {module.lessons.reduce((acc, l) => acc + (l.duration || 5), 0)}min
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
                                                    <div
                                                        key={lesson.id}
                                                        className={`relative flex group ${isActive ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                                                    >
                                                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />}

                                                        <button
                                                            onClick={() => {
                                                                handleLessonChange(module, lesson);
                                                                if (window.innerWidth < 768) setSidebarOpen(false); // Close on mobile click
                                                            }}
                                                            className="flex-1 flex gap-3 px-4 py-3 text-sm text-left"
                                                        >
                                                            <div className={`mt-0.5 shrink-0 ${isCompleted ? 'text-blue-600' : 'text-slate-400'}`}>
                                                                {isCompleted
                                                                    ? <CheckCircle size={14} className="fill-blue-600 text-white" />
                                                                    : (isActive ? <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-600 bg-white" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />)
                                                                }
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className={`line-clamp-2 text-sm ${isActive ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                                                                    {lIdx + 1}. {lesson.title}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                                                                    {lesson.contentType === 'video' && <PlayCircle size={10} />}
                                                                    {lesson.contentType === 'text' && <FileText size={10} />}
                                                                    <span>{lesson.duration || 5}min</span>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    </div>
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
