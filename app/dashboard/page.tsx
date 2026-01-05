import { Search, Bell, Monitor, Code, Database, Palette, ChevronRight, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Dashboard() {
    return (
        <div className="flex flex-col gap-6 px-6 pt-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm text-gray-500">Welcome back,</p>
                    <h1 className="text-xl font-bold text-slate-800">Student Binar</h1>
                </div>
                <button className="p-2 bg-white rounded-full shadow-sm border border-gray-100 relative">
                    <Bell size={20} className="text-gray-600" />
                    <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search for courses..."
                    className="w-full pl-10 pr-4 py-3 bg-white rounded-xl shadow-sm border-none focus:ring-2 focus:ring-blue-100 outline-none text-sm text-gray-600"
                />
            </div>

            {/* Hero Banner */}
            <div className="w-full h-40 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl relative overflow-hidden shadow-lg shadow-blue-200">
                <div className="absolute inset-0 p-5 flex flex-col justify-center text-white z-10 hover:scale-105 transition-transform duration-500">
                    <span className="text-xs font-medium bg-white/20 w-fit px-2 py-1 rounded-md mb-2 backdrop-blur-sm">New Course</span>
                    <h2 className="text-lg font-bold w-2/3 leading-tight">Master Web Development in 30 Days</h2>
                    <button className="mt-3 bg-white text-blue-600 text-xs font-bold px-4 py-2 rounded-lg w-fit shadow-md">
                        Enroll Now
                    </button>
                </div>
                <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            {/* Categories */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800">Categories</h3>
                    <Link href="/courses" className="text-xs text-blue-600 font-medium">See All</Link>
                </div>
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { name: "Design", icon: Palette, color: "bg-purple-100 text-purple-600" },
                        { name: "Coding", icon: Code, color: "bg-blue-100 text-blue-600" },
                        { name: "Office", icon: Monitor, color: "bg-orange-100 text-orange-600" },
                        { name: "Data", icon: Database, color: "bg-green-100 text-green-600" },
                    ].map((cat) => (
                        <div key={cat.name} className="flex flex-col items-center gap-2">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${cat.color}`}>
                                <cat.icon size={24} />
                            </div>
                            <span className="text-xs font-medium text-gray-600">{cat.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Popular Courses */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800">Popular Courses</h3>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="min-w-[240px] bg-white rounded-xl p-3 shadow-md border border-gray-50 flex flex-col gap-3">
                            <div className="h-28 bg-gray-200 rounded-lg relative overflow-hidden">
                                {/* Placeholder for course image */}
                                <div className="absolute inset-0 bg-slate-200 flex items-center justify-center text-slate-400">
                                    <Monitor size={32} />
                                </div>
                                <div className="absolute top-2 right-2 bg-white px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-700 shadow-sm flex items-center gap-1">
                                    <Star size={10} className="fill-yellow-400 text-yellow-400" /> 4.8
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded">Development</span>
                                <h4 className="text-sm font-bold text-slate-800 mt-2 line-clamp-2">Full Stack Javascript Bootcamp 2025</h4>
                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                    <span>24 Lessons</span>
                                    <span>•</span>
                                    <span>Beginner</span>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-blue-600 font-bold">Rp 350.000</span>
                                    <button className="p-1.5 bg-blue-600 rounded-lg text-white">
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
