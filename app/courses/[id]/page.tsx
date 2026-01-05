"use client";

import React from "react";
import { ChevronLeft, PlayCircle, Clock, BookOpen, Star, CheckCircle, Share2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CourseDetail() {
    const router = useRouter();

    return (
        <div className="bg-white min-h-screen pb-24 relative">
            {/* Header Image/Video & Nav */}
            <div className="h-72 bg-gradient-to-br from-blue-600 to-indigo-700 relative z-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 animate-pulse">
                        <PlayCircle size={32} className="text-white fill-white" />
                    </div>
                </div>
                {/* Navigation Overlay */}
                <div className="absolute top-0 left-0 right-0 p-6 pt-8 flex justify-between items-center z-10">
                    <button onClick={() => router.back()} className="p-2.5 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors border border-white/10">
                        <ChevronLeft size={20} />
                    </button>
                    <button className="p-2.5 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors border border-white/10">
                        <Share2 size={20} />
                    </button>
                </div>
            </div>

            {/* Content Container */}
            <div className="-mt-8 bg-white rounded-t-[2rem] px-6 pt-8 relative z-10 flex flex-col gap-8 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">

                {/* Title & Info */}
                <div>
                    <div className="flex gap-2 mb-3">
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-blue-100">Development</span>
                        <span className="bg-yellow-50 text-yellow-600 px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-yellow-100">
                            <Star size={10} className="fill-yellow-600" /> 4.8 (1.2k Reviews)
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 leading-tight">Full Stack Javascript Bootcamp 2025</h1>

                    {/* Stats Row */}
                    <div className="flex items-center gap-6 mt-4 pb-4 border-b border-gray-50">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-gray-400 font-medium">Duration</span>
                            <div className="flex items-center gap-1.5 text-slate-700 font-bold text-sm">
                                <Clock size={16} className="text-blue-500" />
                                <span>24h 30m</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-gray-400 font-medium">Lessons</span>
                            <div className="flex items-center gap-1.5 text-slate-700 font-bold text-sm">
                                <BookOpen size={16} className="text-orange-500" />
                                <span>42 Modules</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-gray-400 font-medium">Certificate</span>
                            <div className="flex items-center gap-1.5 text-slate-700 font-bold text-sm">
                                <ShieldCheck size={16} className="text-green-500" />
                                <span>Included</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <h3 className="text-base font-bold text-slate-800 mb-2">About Course</h3>
                    <p className="text-sm text-gray-500 leading-relaxed font-normal">
                        Master the art of web development with our comprehensive bootcamp. From HTML/CSS to advanced React and Node.js patterns, this course is designed to take you from beginner to job-ready full stack developer.
                    </p>
                </div>

                {/* What You Will Learn */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h3 className="text-base font-bold text-slate-800 mb-4">What You Will Learn</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {[
                            "Build responsive websites with HTML5 & CSS3",
                            "Master JavaScript ES6+ and modern concepts",
                            "Create dynamic UIs with React 18 & Next.js",
                            "Backend development with Node.js & Express",
                            "Database management with MongoDB & PostgreSQL"
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-slate-700 font-medium leading-snug">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Curriculum Preview - Simplified */}
                <div className="pb-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base font-bold text-slate-800">Curriculum</h3>
                        <button className="text-xs text-blue-600 font-bold hover:underline">See All</button>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-blue-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">
                                    01
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 highlight">Introduction</h4>
                                    <span className="text-[10px] text-gray-400">10 mins</span>
                                </div>
                            </div>
                            <PlayCircle size={20} className="text-blue-600 fill-blue-100" />
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-blue-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">
                                    02
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800">Setting Up Environment</h4>
                                    <span className="text-[10px] text-gray-400">25 mins</span>
                                </div>
                            </div>
                            <PlayCircle size={20} className="text-blue-600 fill-blue-100" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Bottom CTA */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="w-full max-w-md mx-auto flex items-center justify-between gap-6">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-medium line-through">Rp 750.000</span>
                        <div className="flex items-end gap-1">
                            <span className="text-xl font-bold text-blue-600">Rp 350k</span>
                            <span className="text-[10px] font-medium text-slate-500 mb-1">/course</span>
                        </div>
                    </div>
                    <button className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all text-sm">
                        Enroll Private Class
                    </button>
                </div>
            </div>
        </div>
    );
}
