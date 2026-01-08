"use client";

import { useEffect, useState } from "react";
import { Search, Filter, Monitor, Star, ArrowUpRight, BookOpen, Clock, Users, PlayCircle, Target, Palette, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function CoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
    const [categories, setCategories] = useState<string[]>(["All"]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch Categories and Courses
    useEffect(() => {
        const loadData = async () => {
            try {
                const [coursesRes, categoriesRes] = await Promise.all([
                    fetch("/api/courses"),
                    fetch("/api/categories")
                ]);

                if (coursesRes.ok && categoriesRes.ok) {
                    const coursesData = await coursesRes.json();
                    const categoriesData = await categoriesRes.json();

                    // Only show PUBLISHED courses for students
                    const publishedCourses = coursesData.filter((c: any) => c.published === true);
                    setCourses(publishedCourses);
                    setFilteredCourses(publishedCourses);

                    setCategories(["All", ...categoriesData.map((c: any) => c.name)]);
                }
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Filter Logic
    useEffect(() => {
        let result = courses;

        // Category Filter
        if (selectedCategory !== "All") {
            result = result.filter((course) => course.category?.name === selectedCategory);
        }

        // Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter((course) =>
                course.title.toLowerCase().includes(query) ||
                course.description?.toLowerCase().includes(query)
            );
        }

        setFilteredCourses(result);
    }, [selectedCategory, searchQuery, courses]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="pb-20 md:pb-12 max-w-7xl mx-auto w-full px-4 md:px-6 space-y-8">
            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 to-blue-900 shadow-2xl mt-4 md:mt-8">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex-1 space-y-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-500/30">
                                <Target size={14} /> Only the best content
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                                Creating A<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">UX/UI Design</span><br />
                                Portfolio
                            </h1>
                        </div>

                        <div className="flex flex-wrap gap-4 md:gap-8 text-slate-300 text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <PlayCircle size={18} className="text-blue-400" />
                                <span>8 Courses</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={18} className="text-blue-400" />
                                <span>+234 Hours</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users size={18} className="text-blue-400" />
                                <span>349 Students</span>
                            </div>
                        </div>
                    </div>

                    {/* Decorative 3D Elements (CSS/Icons) */}
                    <div className="hidden md:flex gap-6 relative">
                        {/* Card 1 */}
                        <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-2xl transform -rotate-12 translate-y-4 flex items-center justify-center border-t border-white/20">
                            <Palette size={48} className="text-white opacity-90" />
                            <div className="absolute bottom-3 text-white text-xs font-bold opacity-80">Design</div>
                        </div>
                        {/* Card 2 */}
                        <div className="w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-2xl transform rotate-6 -translate-x-4 flex items-center justify-center border-t border-white/20 z-10">
                            <TrendingUp size={48} className="text-white opacity-90" />
                            <div className="absolute bottom-3 text-white text-xs font-bold opacity-80">Finance</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl py-4 -mx-4 px-4 md:mx-0 md:px-0 border-b md:border-none border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Categories */}
                    <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedCategory === category
                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                                    : "bg-slate-100/50 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        />
                    </div>
                </div>
            </div>

            {/* Course Grid */}
            <div className="min-h-[400px]">
                {filteredCourses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 text-slate-300 shadow-sm">
                            <BookOpen size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">No courses found</h3>
                        <p className="text-slate-500 text-sm">Try adjusting your search or category filter.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCourses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function CourseCard({ course }: { course: any }) {
    const router = useRouter();
    const { user } = useUser();

    // Calculate generic stats if not real
    const lessonsCount = course.totalLessons || 0;
    // Generate a random-looking student count based on ID if not real, just for consistent UI demo
    const studentCount = parseInt(course.id.substring(0, 3), 16) % 500 + 50;

    return (
        <Link href={`/courses/${course.id}`} className="group bg-white rounded-2xl border border-slate-100 p-3 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
            {/* Thumbnail */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-4">
                {course.imageUrl ? (
                    <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                        <Monitor size={48} />
                    </div>
                )}

                {/* Floating Category Badge */}
                {course.category?.name && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-bold text-slate-800 uppercase tracking-widest shadow-sm">
                        {course.category.name}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 px-1">
                <h3 className="text-slate-900 font-bold text-lg leading-tight mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {course.title}
                </h3>

                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-4">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                        <PlayCircle size={14} className="text-blue-500" />
                        <span>{lessonsCount} Lessons</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                        <Users size={14} className="text-orange-500" />
                        <span>{studentCount} Students</span>
                    </div>
                </div>

                <div className="mt-auto flex items-end justify-between border-t border-slate-50 pt-3">
                    <div>
                        {course.price > 0 && (
                            <div className="text-xs text-slate-400 line-through mb-0.5">
                                Rp {Number(course.price * 1.5).toLocaleString("id-ID")}
                            </div>
                        )}
                        <div className={`font-black text-lg ${course.price === 0 ? "text-green-600" : "text-slate-900"}`}>
                            {course.price === 0 ? "Free" : `Rp ${Number(course.price).toLocaleString("id-ID")}`}
                        </div>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                        <ArrowUpRight size={20} />
                    </div>
                </div>
            </div>
        </Link>
    );
}
