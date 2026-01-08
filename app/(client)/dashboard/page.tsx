"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Monitor, Star, ChevronRight, Clock, Award, BookOpen, Check } from "lucide-react";
import Link from "next/link";

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
    };
}

interface Stats {
    totalEnrollments: number;
    coursesInProgress: number;
    certificatesEarned: number;
    hoursSpent: number;
    xpPoints: number;
}

interface QuizAssignment {
    id: string;
    status: string;
    quiz: {
        id: string;
        title: string;
        description: string;
        type: string;
        timeLimit: number;
    };
}

export default function DashboardPage() {
    const { user, isLoaded } = useUser();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [popularCourses, setPopularCourses] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<QuizAssignment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded || !user) return;

        const initializeDashboard = async () => {
            try {
                // Sync user with database
                await fetch("/api/user/sync", { method: "POST" });

                // Fetch enrollments, stats, popular courses, and assignments in parallel
                const [enrollmentsRes, statsRes, coursesRes, assignmentsRes] = await Promise.all([
                    fetch("/api/my-enrollments"),
                    fetch("/api/my-stats"),
                    fetch("/api/courses"),
                    fetch("/api/quiz-assignments"),
                ]);

                if (enrollmentsRes.ok) {
                    const data = await enrollmentsRes.json();
                    setEnrollments(data);
                }

                if (statsRes.ok) {
                    const data = await statsRes.json();
                    setStats(data);
                }

                if (coursesRes.ok) {
                    const data = await coursesRes.json();
                    setPopularCourses(data.slice(0, 8)); // Show max 8 popular courses
                }

                if (assignmentsRes.ok) {
                    const data = await assignmentsRes.json();
                    setAssignments(data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        initializeDashboard();
    }, [isLoaded, user]);

    if (!isLoaded || loading) {
        return <div className="p-10 text-center">Loading your learning dashboard...</div>;
    }

    // Get the most recently accessed enrollment for "Continue Learning"
    const continueEnrollment = enrollments.find((e) => e.progress < 100);

    return (
        <div className="flex flex-col gap-6 px-6 pt-8 pb-20 md:pb-8 max-w-7xl mx-auto w-full">
            {/* Header / Welcome Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Hello, {user?.firstName || "Student"}! 👋
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Ready to continue your learning journey?</p>
                </div>
            </div>

            {/* Learning Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-200">
                    <div className="bg-blue-500/50 w-8 h-8 rounded-lg flex items-center justify-center mb-3">
                        <Clock size={16} />
                    </div>
                    <div className="text-2xl font-bold">{stats?.hoursSpent || 0}</div>
                    <div className="text-xs text-blue-100 opacity-80">Hours Spent</div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <div className="bg-orange-100 w-8 h-8 rounded-lg flex items-center justify-center mb-3 text-orange-600">
                        <BookOpen size={16} />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">{stats?.coursesInProgress || 0}</div>
                    <div className="text-xs text-slate-400">Courses in Progress</div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <div className="bg-green-100 w-8 h-8 rounded-lg flex items-center justify-center mb-3 text-green-600">
                        <Award size={16} />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">{stats?.certificatesEarned || 0}</div>
                    <div className="text-xs text-slate-400">Certificates Earned</div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <div className="bg-purple-100 w-8 h-8 rounded-lg flex items-center justify-center mb-3 text-purple-600">
                        <Star size={16} />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">{stats?.xpPoints || 0}</div>
                    <div className="text-xs text-slate-400">XP Points</div>
                </div>
            </div>

            {/* Continue Learning Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800">Continue Learning</h2>
                    <Link href="/my-learning" className="text-sm text-blue-600 font-medium">
                        View All
                    </Link>
                </div>
                {continueEnrollment ? (
                    <Link
                        href={`/courses/${continueEnrollment.course.id}/learn`}
                        className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-200 cursor-pointer transition-all flex gap-4 md:items-center group relative"
                    >
                        <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                            <Monitor size={24} className="text-gray-400" />
                        </div>
                        <div className="flex-1">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${continueEnrollment.course.category.color}`}>
                                {continueEnrollment.course.category.name}
                            </span>
                            <h3 className="font-bold text-slate-800 text-sm md:text-base mt-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                {continueEnrollment.course.title}
                            </h3>
                            <div className="mt-3">
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                    <span>Progress</span>
                                    <span>{continueEnrollment.progress}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 rounded-full transition-all"
                                        style={{ width: `${continueEnrollment.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm group-hover:bg-blue-700 transition-colors">
                            Continue Learning
                            <ChevronRight size={16} />
                        </div>
                        <div className="md:hidden absolute bottom-4 right-4">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                                <ChevronRight size={16} />
                            </div>
                        </div>
                    </Link>
                ) : (
                    <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <BookOpen size={24} className="text-slate-400" />
                        </div>
                        <h3 className="font-bold text-slate-800">No courses in progress</h3>
                        <p className="text-sm text-slate-500 mt-1">Start a new course to see it here!</p>
                        <Link
                            href="/courses"
                            className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                        >
                            Browse Courses
                        </Link>
                    </div>
                )}
            </div>

            {/* Assigned Quizzes Section */}
            {assignments.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-800">Assigned Quizzes</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {assignments.map((assignment) => (
                            <Link
                                href={`/quizzes/${assignment.quiz.id}`}
                                key={assignment.id}
                                className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition group border-l-4 border-l-blue-500"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded uppercase tracking-wide">
                                        {assignment.quiz.type}
                                    </span>
                                    {assignment.status === 'completed' && (
                                        <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                            <Check size={12} /> Done
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                                    {assignment.quiz.title}
                                </h3>
                                <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                                    {assignment.quiz.description || "No description available."}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                                    <div className="flex items-center gap-1">
                                        <Clock size={12} />
                                        {assignment.quiz.timeLimit ? `${assignment.quiz.timeLimit} mins` : 'No limit'}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Star size={12} />
                                        Assigned
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Popular Courses Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800">Popular Courses</h2>
                    <Link href="/courses" className="text-sm text-blue-600 font-medium">
                        See All
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {popularCourses.length === 0 ? (
                        <div className="col-span-full text-center text-gray-500 py-10">
                            No courses available yet.
                        </div>
                    ) : (
                        popularCourses.map((course: any) => (
                            <div
                                key={course.id}
                                className="min-w-[240px] bg-white rounded-xl p-3 shadow-md border border-gray-50 flex flex-col gap-3 hover:shadow-lg transition-shadow"
                            >
                                <div className="h-28 md:h-40 bg-gray-200 rounded-lg relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-slate-300 transition-colors">
                                        <Monitor size={32} className="md:w-10 md:h-10" />
                                    </div>
                                    <div className="absolute top-2 right-2 bg-white px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-700 shadow-sm flex items-center gap-1">
                                        <Star size={10} className="fill-yellow-400 text-yellow-400" /> 4.8
                                    </div>
                                </div>
                                <div>
                                    <span className={`text-[10px] font-semibold px-2 py-1 rounded ${course.category.color}`}>
                                        {course.category.name}
                                    </span>
                                    <h4 className="text-sm md:text-base font-bold text-slate-800 mt-2 line-clamp-2">
                                        {course.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                        <span>24 Lessons</span>
                                        <span>•</span>
                                        <span>{course.level}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-blue-600 font-bold md:text-lg">
                                            Rp {Number(course.price).toLocaleString()}
                                        </span>
                                        <button className="p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors">
                                            <ChevronRight size={14} className="md:w-5 md:h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
