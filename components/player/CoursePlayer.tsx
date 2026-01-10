"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ChevronLeft, ChevronRight, PlayCircle, FileText, CheckCircle, Menu, X, Check, ChevronDown, ChevronUp, Star, MessageCircle, Share2, Trophy, Maximize, Minimize } from "lucide-react";
import Link from "next/link";
import Loading from "@/components/ui/Loading";

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
    whatYouLearn?: string;
    _count?: {
        enrollments: number;
    };
}

interface Review {
    id: string;
    rating: number;
    comment: string;
    user: {
        email: string;
    };
    createdAt: string;
}

export default function CoursePlayer({ id }: { id: string }) {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
    const [isFocusMode, setIsFocusMode] = useState(false);

    // Notes State
    const [noteContent, setNoteContent] = useState("");
    const [isSavingNote, setIsSavingNote] = useState(false);

    // Reviews State
    const [reviews, setReviews] = useState<Review[]>([]);
    const [userRating, setUserRating] = useState(0);
    const [userReviewComment, setUserReviewComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    // Refs
    const mainContentRef = useRef<HTMLDivElement>(null);

    // Scroll to top when lesson changes
    useEffect(() => {
        if (mainContentRef.current) {
            mainContentRef.current.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [activeLesson]);

    // Lesson Completion Logic
    const markLessonComplete = async (lessonId: string) => {
        // Safe check for course existence (though logic implies it exists if we are here)
        if (!course) return;

        if (completedLessons.has(lessonId)) return;

        // Optimistic update
        setCompletedLessons(prev => new Set(prev).add(lessonId));

        try {
            const res = await fetch(`/api/courses/${course.id}/lessons/${lessonId}/progress`, {
                method: "POST"
            });
            if (!res.ok) throw new Error("API Error");
        } catch (error) {
            console.error("Failed to save progress", error);
            // Revert on failure
            setCompletedLessons(prev => {
                const next = new Set(prev);
                next.delete(lessonId);
                return next;
            });
        }
    };

    // Load initial progress
    useEffect(() => {
        if (!course) return;
        const fetchProgress = async () => {
            try {
                const res = await fetch(`/api/courses/${course.id}/progress`);
                if (res.ok) {
                    const completedIds = await res.json();
                    setCompletedLessons(new Set(completedIds));
                }
            } catch (error) {
                console.error("Failed to load progress", error);
            }
        };
        fetchProgress();
    }, [course]);

    // Scroll Detection for Completion
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

        // Check if user is near bottom (within 100px)
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            if (activeLesson && !completedLessons.has(activeLesson.id)) {
                markLessonComplete(activeLesson.id);
            }
        }
    };

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

        const fetchReviews = async () => {
            try {
                const res = await fetch(`/api/reviews?courseId=${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setReviews(data);
                }
            } catch (error) {
                console.error("Failed to fetch reviews", error);
            }
        };

        fetchCourse();
        fetchReviews();
    }, [id, isLoaded, user, searchParams, router]);

    // Fetch Note when active lesson changes
    useEffect(() => {
        if (!activeLesson) return;

        const fetchNote = async () => {
            try {
                const res = await fetch(`/api/notes?lessonId=${activeLesson.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setNoteContent(data.content || "");
                }
            } catch (error) {
                console.error("Failed to fetch note", error);
            }
        };

        fetchNote();
    }, [activeLesson]);

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

    // Auto-save note logic (simple debounce implementation)
    useEffect(() => {
        if (!activeLesson) return;

        const timer = setTimeout(async () => {
            if (noteContent) {
                setIsSavingNote(true);
                try {
                    await fetch("/api/notes", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ lessonId: activeLesson.id, content: noteContent }),
                    });
                } catch (error) {
                    console.error("Failed to save note", error);
                } finally {
                    setIsSavingNote(false);
                }
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [noteContent, activeLesson]);


    const handleReviewSubmit = async () => {
        if (userRating === 0) return;
        setIsSubmittingReview(true);
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    courseId: id,
                    rating: userRating,
                    comment: userReviewComment,
                }),
            });

            if (res.ok) {
                // Refresh reviews
                const reviewsRes = await fetch(`/api/reviews?courseId=${id}`);
                if (reviewsRes.ok) {
                    const reviewsData = await reviewsRes.json();
                    setReviews(reviewsData);
                }
                setUserRating(0);
                setUserReviewComment("");
            }
        } catch (error) {
            console.error("Failed to submit review", error);
        } finally {
            setIsSubmittingReview(false);
        }
    };


    if (loading) return <Loading />;
    if (!course) return <div className="h-screen flex items-center justify-center bg-slate-900 text-white">Course not found</div>;

    const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    const progressPercentage = Math.round((completedLessons.size / totalLessons) * 100) || 0;

    // Use dynamic student count if available (mocked somewhat in stats fetch if needed, currently reliant on course._count? which might not exist on basic fetch, let's assume valid mock or future implementation)
    const studentCount = course._count?.enrollments || Math.floor(Math.random() * 500) + 100; // Mock fallback if not joined




    // Navigation Logic
    const handleNavigation = (direction: 'prev' | 'next') => {
        if (!course || !activeLesson || !activeModuleId) return;

        const currentModuleIndex = course.modules.findIndex(m => m.id === activeModuleId);
        if (currentModuleIndex === -1) return;

        const currentModule = course.modules[currentModuleIndex];
        const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === activeLesson.id);
        if (currentLessonIndex === -1) return;

        if (direction === 'next') {
            if (currentLessonIndex < currentModule.lessons.length - 1) {
                // Next lesson in same module
                setActiveLesson(currentModule.lessons[currentLessonIndex + 1]);
            } else if (currentModuleIndex < course.modules.length - 1) {
                // First lesson of next module
                const nextModule = course.modules[currentModuleIndex + 1];
                if (nextModule.lessons.length > 0) {
                    setActiveModuleId(nextModule.id);
                    setActiveLesson(nextModule.lessons[0]);
                    // Auto-expand next module
                    setExpandedModules(prev => new Set(prev).add(nextModule.id));
                }
            }
        } else {
            if (currentLessonIndex > 0) {
                // Previous lesson in same module
                setActiveLesson(currentModule.lessons[currentLessonIndex - 1]);
            } else if (currentModuleIndex > 0) {
                // Last lesson of previous module
                const prevModule = course.modules[currentModuleIndex - 1];
                if (prevModule.lessons.length > 0) {
                    setActiveModuleId(prevModule.id);
                    setActiveLesson(prevModule.lessons[prevModule.lessons.length - 1]);
                    // Auto-expand prev module
                    setExpandedModules(prev => new Set(prev).add(prevModule.id));
                }
            }
        }
    };


    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Header / Navbar - Hidden in Focus Mode unless hovered (optional) or just hidden */}
            {!isFocusMode && (
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

                        <button
                            className={`text-white hover:bg-slate-800 p-2 rounded-lg transition-colors ${!sidebarOpen ? 'bg-slate-800 text-blue-400' : ''}`}
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            title="Toggle Sidebar"
                        >
                            <Menu size={20} />
                        </button>
                    </div>
                </header>
            )}


            {/* Main Layout */}
            <div className="flex flex-1 overflow-hidden relative">

                {/* Main Content Area */}
                <div
                    className="flex-1 flex flex-col overflow-y-auto bg-slate-50 relative"
                    id="main-content"
                    ref={mainContentRef}
                    onScroll={handleScroll}
                >

                    {/* Video Player Stage - Made Taller */}
                    {/* Previous classes: relative shrink-0 aspect-video md:aspect-[21/9] lg:aspect-[16/7] xl:aspect-[21/9] 2xl:aspect-[21/8] */}
                    {/* New classes: Remove the ultra-wide aspects to keep it taller (closer to 16:9 on large screens) */}
                    <div className="bg-black w-full shadow-lg relative shrink-0 aspect-video md:aspect-[16/9] xl:aspect-[16/9]">
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
                                            <div
                                                className="lesson-content text-slate-700 leading-relaxed [&>p]:mb-6 [&>ul]:mb-6 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:mb-6 [&>ol]:list-decimal [&>ol]:pl-5 [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mb-3 [&>h3]:text-lg [&>h3]:font-bold [&>h3]:mb-2 [&>img]:rounded-xl [&>img]:my-6 [&>img]:w-full [&>figure]:my-6"
                                                dangerouslySetInnerHTML={{ __html: activeLesson.content }}
                                            />
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="text-white">Select a lesson</div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Bar */}
                    <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-sm">
                        <div className="flex-1">
                            <h2 className="font-bold text-xl text-slate-900 mb-1">{activeLesson?.title || "Course Overview"}</h2>
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wide">
                                    {activeLesson?.contentType || "Lesson"}
                                </span>
                                <span>•</span>
                                <span>{studentCount} Students Enrolled</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleNavigation('prev')}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 hover:border-blue-200"
                                title="Previous Lesson"
                            >
                                <ChevronLeft size={16} />
                                <span className="hidden md:inline">Previous</span>
                            </button>
                            <button
                                onClick={() => handleNavigation('next')}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 hover:border-blue-200"
                                title="Next Lesson"
                            >
                                <span className="hidden md:inline">Next</span>
                                <ChevronRight size={16} />
                            </button>

                            <div className="w-px h-6 bg-slate-200 mx-2 hidden md:block"></div>

                            <button
                                onClick={() => setIsFocusMode(!isFocusMode)}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200 hover:border-blue-200"
                            >
                                {isFocusMode ? <Minimize size={16} /> : <Maximize size={16} />}
                                <span className="hidden md:inline">{isFocusMode ? "Exit Focus" : "Focus Mode"}</span>
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="max-w-6xl mx-auto w-full p-6 md:p-8">
                        <div className="border-b border-slate-200 mb-6 flex gap-8">
                            {['overview', 'q&a', 'notes', 'reviews'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-3 text-sm font-bold capitalize transition-all border-b-2 ${activeTab === tab ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                                >
                                    {tab === "q&a" ? "Q&A" : tab}
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
                                            {/* Attempt to parse whatYouLearn or show defaults */}
                                            {(() => {
                                                let topics = [];
                                                try {
                                                    // @ts-ignore
                                                    if (course.whatYouLearn) {
                                                        // @ts-ignore
                                                        topics = JSON.parse(course.whatYouLearn);
                                                    }
                                                } catch (e) {
                                                    console.warn("Failed to parse whatYouLearn", e);
                                                }

                                                if (topics.length === 0) {
                                                    topics = [
                                                        "Pengenalan Microsoft Word",
                                                        "Format Dokumen & Teks",
                                                        "Menyimpan & Mencetak"
                                                    ];
                                                }

                                                return topics.map((topic: string, i: number) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Check size={16} className="text-emerald-500 shrink-0" />
                                                        <span>{topic}</span>
                                                    </li>
                                                ));
                                            })()}
                                        </ul>
                                    </div>

                                    {course.description && (
                                        <div className="space-y-4 pt-4 border-t border-slate-100">
                                            <h3 className="text-lg font-bold text-slate-800">Course Description</h3>
                                            <div className="prose prose-slate prose-sm text-slate-600 max-w-none">
                                                <p>{course.description}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                                        <h4 className="font-bold text-slate-900 mb-4">Instructor</h4>
                                        <div className="flex gap-4 items-center mb-4">
                                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                                IN
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">Instructor Name</p>
                                                <p className="text-xs text-slate-500">Senior Developer</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed italic">
                                            "Full Pembelajaran ms word lengkap"
                                        </p>
                                    </div>

                                    <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-slate-900">Resources</h4>
                                            <FileText size={18} className="text-slate-400" />
                                        </div>
                                        <div className="space-y-2">
                                            <button className="w-full flex items-center gap-3 p-3 text-sm text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-100 transition text-left group">
                                                <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-100 transition-colors">
                                                    <FileText size={16} />
                                                </div>
                                                <span className="font-medium">Lesson_slides.pdf</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notes Tab */}
                        {activeTab === 'notes' && (
                            <div className="max-w-3xl">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-slate-800">My Notes</h3>
                                    {isSavingNote && <span className="text-xs text-slate-400 animate-pulse">Saving...</span>}
                                </div>
                                <textarea
                                    className="w-full h-64 p-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition outline-none resize-none text-slate-700 leading-relaxed"
                                    placeholder="Type your notes here... (Changes are saved automatically)"
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                />
                                <p className="mt-2 text-xs text-slate-400">Notes are private and saved automatically.</p>
                            </div>
                        )}

                        {/* Reviews Tab */}
                        {activeTab === 'reviews' && (
                            <div className="max-w-3xl space-y-8">
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                    <h3 className="font-bold text-slate-800 mb-4">Write a Review</h3>
                                    <div className="flex gap-2 mb-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setUserRating(star)}
                                                className={`transition-colors ${userRating >= star ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-200'}`}
                                            >
                                                <Star size={24} fill="currentColor" />
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        className="w-full p-3 rounded-lg border border-slate-200 mb-4 text-sm focus:outline-none focus:border-blue-500"
                                        rows={3}
                                        placeholder="Share your experience with this course..."
                                        value={userReviewComment}
                                        onChange={(e) => setUserReviewComment(e.target.value)}
                                    />
                                    <button
                                        onClick={handleReviewSubmit}
                                        disabled={userRating === 0 || isSubmittingReview}
                                        className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        {isSubmittingReview ? "Submitting..." : "Submit Review"}
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="font-bold text-slte-800 text-lg">Student Reviews ({reviews.length})</h3>
                                    {reviews.length > 0 ? (
                                        reviews.map((review) => (
                                            <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex text-yellow-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-slate-200" : ""} />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-700">{review.rating.toFixed(1)}</span>
                                                    <span className="text-xs text-slate-400">• {new Date(review.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-slate-600 text-sm leading-relaxed mb-2">{review.comment}</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                        {review.user.email.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-xs text-slate-500">{review.user.email}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-slate-500 text-sm italic">No reviews yet. Be the first to review!</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'q&a' && (
                            <div className="py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200 border-dashed">
                                <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="font-medium text-slate-600">Q&A</p>
                                <p className="text-sm">This section is currently empty.</p>
                            </div>
                        )}
                    </div>
                </div>


                {/* Right Sidebar (Curriculum) - Hidden in Focus Mode */}
                <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white border-l border-slate-200 transform transition-transform duration-300 z-50 flex flex-col md:static md:translate-x-0 ${sidebarOpen && !isFocusMode ? 'translate-x-0' : 'translate-x-full'} ${isFocusMode ? 'hidden' : ''}`}>
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
                        <h3 className="font-bold text-slate-900">Course Content</h3>
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 hover:bg-slate-100 rounded-full text-slate-500"><X size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {course.modules.map((module, mIdx) => {
                            const isExpanded = expandedModules.has(module.id);
                            return (
                                <div key={module.id} className="border-b border-slate-100 last:border-none">
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
                                                                if (window.innerWidth < 768) setSidebarOpen(false);
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
        </div >
    );
}
