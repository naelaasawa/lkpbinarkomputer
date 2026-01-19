"use client";

import { useEffect, useState } from "react";
import { Search, Monitor, Star, ArrowUpRight, BookOpen, Users, PlayCircle, GraduationCap, Trophy, TrendingUp, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";

export default function ProgramPage() {
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

                    // Only show PUBLISHED courses
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

        if (selectedCategory !== "All") {
            result = result.filter((course) => course.category?.name === selectedCategory);
        }

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
        return <Loading />;
    }

    const totalStudents = courses.reduce((acc, c) => acc + (c._count?.enrollments || 0), 0);
    const totalLessons = courses.reduce((acc, c) => acc + (c.modules?.reduce((sum: number, m: any) => sum + m.lessons.length, 0) || 0), 0);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Simple Header with Back Button */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-semibold transition-colors text-sm"
                    >
                        <ArrowLeft size={18} />
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>

            <div className="pb-12 max-w-7xl mx-auto w-full px-4 md:px-6 space-y-6">
                {/* Compact Hero Section */}
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-lg mt-6">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative p-6 md:p-8">
                        <div className="max-w-4xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider border border-white/30 mb-3">
                                <GraduationCap size={14} /> Program Pelatihan Komputer
                            </div>

                            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-3">
                                Tingkatkan
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300"> Skill Komputer </span>
                                Anda Sekarang
                            </h1>

                            <p className="text-base text-white/90 font-medium leading-relaxed mb-4">
                                Pilih dari {courses.length} program pelatihan berkualitas dengan harga terjangkau. Belajar langsung dari para ahli!
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20">
                                    <PlayCircle size={18} className="text-white" />
                                    <div>
                                        <div className="text-xl font-black text-white">{courses.length}+</div>
                                        <div className="text-xs text-white/80 font-medium">Program</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20">
                                    <Users size={18} className="text-white" />
                                    <div>
                                        <div className="text-xl font-black text-white">{totalStudents}+</div>
                                        <div className="text-xs text-white/80 font-medium">Peserta</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20">
                                    <Trophy size={18} className="text-white" />
                                    <div>
                                        <div className="text-xl font-black text-white">{totalLessons}+</div>
                                        <div className="text-xs text-white/80 font-medium">Materi</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter & Search */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedCategory === category
                                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Cari program..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border-2 border-slate-200 pl-12 pr-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>
                    </div>
                </div>

                {/* Course Grid */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-slate-900">
                            {selectedCategory === "All" ? "Semua Program" : `Program ${selectedCategory}`}
                            <span className="text-slate-400 ml-2">({filteredCourses.length})</span>
                        </h2>
                    </div>

                    {filteredCourses.length === 0 ? (
                        <EmptyState
                            icon={BookOpen}
                            title="Tidak ada program"
                            description="Coba ubah filter atau kata kunci pencarian Anda."
                        />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCourses.map((course) => (
                                <ProgramCard key={course.id} course={course} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ProgramCard({ course }: { course: any }) {
    const lessonsCount = course.modules?.reduce((sum: number, m: any) => sum + m.lessons.length, 0) || 0;
    const studentCount = course._count?.enrollments || 0;
    const hasDiscount = course.price > 0;

    return (
        <Link
            href={`/courses/${course.id}`}
            className="group bg-white rounded-2xl border-2 border-slate-100 hover:border-blue-200 p-4 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
        >
            {/* Thumbnail */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 mb-4">
                {course.imageUrl ? (
                    <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                        <Monitor size={56} />
                    </div>
                )}

                {/* Category Badge */}
                {course.category?.name && (
                    <div className="absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-xs font-bold uppercase tracking-wide shadow-lg">
                        {course.category.name}
                    </div>
                )}

                {/* Discount Badge */}
                {hasDiscount && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-black shadow-lg">
                        PROMO!
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="space-y-4">
                <h3 className="text-slate-900 font-black text-xl leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {course.title}
                </h3>

                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {course.description || "Tingkatkan skill Anda dengan program pelatihan berkualitas ini."}
                </p>

                <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                    <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg">
                        <BookOpen size={14} className="text-blue-600" />
                        <span>{lessonsCount} Materi</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-lg">
                        <Users size={14} className="text-orange-600" />
                        <span>{studentCount} Peserta</span>
                    </div>
                </div>

                {/* Price Section */}
                <div className="flex items-center justify-between pt-4 border-t-2 border-slate-100">
                    <div>
                        {hasDiscount && (
                            <div className="text-xs text-slate-400 line-through font-medium">
                                Rp {Number(course.price * 1.5).toLocaleString("id-ID")}
                            </div>
                        )}
                        <div className={`font-black text-2xl ${course.price === 0 ? "text-green-600" : "text-slate-900"}`}>
                            {course.price === 0 ? "GRATIS" : `Rp ${Number(course.price).toLocaleString("id-ID")}`}
                        </div>
                    </div>

                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <ArrowUpRight size={24} />
                    </div>
                </div>
            </div>
        </Link>
    );
}
