"use client";

import { useEffect, useState } from "react";
import { Search, Filter, Monitor, Star, ChevronRight, BookOpen } from "lucide-react";
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
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="pb-20 md:pb-8 max-w-7xl mx-auto w-full">
            {/* Header with Search */}
            <div className="bg-white px-6 py-4 sticky top-0 z-10 border-b border-slate-100 shadow-sm md:static md:shadow-none md:border-none md:bg-transparent md:pt-8 md:px-6">
                <div className="md:flex md:items-center md:justify-between md:mb-6">
                    <h1 className="text-xl md:text-3xl font-bold text-slate-800 mb-4 md:mb-0">Explore Courses</h1>
                    <div className="flex gap-3">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                            />
                        </div>
                        <button className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-600 hover:bg-slate-100 transition md:hidden">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {/* Categories - Horizontal Scroll */}
                <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Course Grid */}
            <div className="px-6 py-6 md:py-2">
                {filteredCourses.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <BookOpen size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700">No courses found</h3>
                        <p className="text-slate-500">Try adjusting your search or category filter.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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
    const [enrolling, setEnrolling] = useState(false);
    const router = useRouter();
    const { user } = useUser();

    const handleEnroll = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            router.push("/sign-in");
            return;
        }

        if (course.price > 0) {
            alert("Payment integration coming soon for paid courses.");
            return;
        }

        try {
            setEnrolling(true);
            const res = await fetch(`/api/courses/${course.id}/enroll`, {
                method: "POST",
            });

            if (res.ok) {
                router.push("/my-learning");
            } else {
                const err = await res.text();
                // If already enrolled, just go there
                if (res.status === 400 && err.includes("Already enrolled")) {
                    router.push("/my-learning");
                } else {
                    alert("Enrollment failed: " + err);
                }
            }
        } catch (error) {
            console.error("Enrollment error", error);
            alert("Something went wrong");
        } finally {
            setEnrolling(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col gap-3 group h-full">
            {/* Image / Thumbnail */}
            <Link href={`/courses/${course.id}`} className="block h-32 md:h-44 bg-gray-200 rounded-xl relative overflow-hidden">
                {course.imageUrl ? (
                    <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="absolute inset-0 bg-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-slate-300 transition-colors">
                        <Monitor size={32} className="md:w-12 md:h-12" />
                    </div>
                )}

                {/* Rating Badge */}
                <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-slate-700 shadow-sm flex items-center gap-1">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span>4.8</span>
                </div>
            </Link>

            <div className="flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                    {course.category && (
                        <span className="text-[10px] font-bold px-2 py-1 rounded bg-blue-50 text-blue-600 uppercase tracking-wide">
                            {course.category.name}
                        </span>
                    )}
                </div>

                <Link href={`/courses/${course.id}`} className="font-bold text-slate-800 text-base leading-snug mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {course.title}
                </Link>

                <div className="flex items-center gap-2 mt-auto text-xs text-slate-500 mb-4">
                    <span>{course.totalLessons || 0} Lessons</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span>{course.level}</span>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                    <div>
                        {/* Discount Logic Example */}
                        {course.price > 0 && (
                            <p className="text-xs text-slate-400 line-through">
                                Rp {Number(course.price * 1.5).toLocaleString("id-ID")}
                            </p>
                        )}
                        <p className={`text-lg font-bold ${course.price === 0 ? "text-green-600" : "text-blue-600"}`}>
                            {course.price === 0 ? "Free" : `Rp ${Number(course.price).toLocaleString("id-ID")}`}
                        </p>
                    </div>
                    {/* Enroll Button */}
                    <button
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {enrolling ? "..." : (course.price === 0 ? "Enroll Now" : "Buy Now")}
                    </button>
                </div>
            </div>
        </div>
    );
}
