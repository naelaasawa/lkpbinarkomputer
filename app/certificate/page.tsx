"use client";

import { Award, Download, Share2, FileText, Calendar } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Certificate() {
    const [filter, setFilter] = useState("All");

    const certificates = [
        {
            id: "CERT-001",
            course: "Introduction to Data Science",
            date: "Dec 15, 2024",
            instructor: "Dr. Budi Santoso",
            grade: "A",
            skills: ["Python", "Pandas", "Data Visualization"],
            color: "from-green-500 to-emerald-700"
        },
        {
            id: "CERT-002",
            course: "Basic Office Productivity",
            date: "Nov 20, 2024",
            instructor: "Siti Rahma",
            grade: "A",
            skills: ["Word", "Excel", "PowerPoint"],
            color: "from-orange-400 to-red-500"
        }
    ];

    return (
        <div className="flex flex-col gap-6 px-6 pt-8 min-h-screen bg-slate-50">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">My Certificates</h1>
                <p className="text-sm text-gray-500">Showcase your achievements.</p>
            </div>

            {/* Filter Chips - Simplified for now as there are few items */}
            <div className="flex gap-2">
                {["All", "Coding", "Design", "Office"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${filter === f
                                ? "bg-slate-800 text-white border-slate-800"
                                : "bg-white text-gray-500 border-gray-200"
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Certificate List */}
            <div className="flex flex-col gap-5 pb-4">
                {certificates.map((cert) => (
                    <div key={cert.id} className="relative group">
                        {/* Certificate Card */}
                        <div className={`w-full aspect-[1.6/1] bg-gradient-to-br ${cert.color} rounded-2xl shadow-lg relative overflow-hidden p-5 flex flex-col justify-between text-white`}>

                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 2px, transparent 2.5px)', backgroundSize: '20px 20px' }}></div>
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>

                            <div className="relative z-10 flex justify-between items-start">
                                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg">
                                    <Award size={16} className="text-white" />
                                    <span className="text-xs font-bold tracking-wide">CERTIFIED</span>
                                </div>
                                <span className="text-[10px] font-mono opacity-80 pt-1">ID: {cert.id}</span>
                            </div>

                            <div className="relative z-10 text-center">
                                <h3 className="text-lg font-bold leading-tight mb-1 font-serif tracking-wide">{cert.course}</h3>
                                <p className="text-xs opacity-90">Completed by Student Binar</p>
                            </div>

                            <div className="relative z-10 flex justify-between items-end">
                                <div className="text-left">
                                    <p className="text-[10px] opacity-70 uppercase tracking-widest">Date</p>
                                    <p className="text-xs font-medium">{cert.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] opacity-70 uppercase tracking-widest">Instructor</p>
                                    <div className="h-6 w-auto bg-white/20 mt-1 rounded px-2 flex items-center justify-center">
                                        <span className="text-[10px] font-signature italic">{cert.instructor}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-3 mt-3 justify-between items-center">
                            <div className="flex gap-3 text-sm text-slate-700">
                                <button className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors">
                                    <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-600">
                                        <Download size={16} />
                                    </div>
                                    <span className="text-[10px] font-medium">Download</span>
                                </button>
                                <button className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors">
                                    <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-600">
                                        <Share2 size={16} />
                                    </div>
                                    <span className="text-[10px] font-medium">Share</span>
                                </button>
                                <button className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors">
                                    <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-600">
                                        <FileText size={16} />
                                    </div>
                                    <span className="text-[10px] font-medium">Details</span>
                                </button>
                            </div>

                            <Link href={`/certificate/${cert.id}`} className="text-xs font-bold text-blue-600 hover:underline">
                                View Full
                            </Link>
                        </div>
                    </div>
                ))}

                {/* Empty State hint */}
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3 items-start">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600 mt-0.5">
                        <Calendar size={18} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-800">Want more certificates?</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            Complete your ongoing courses to earn more badges and certificates for your portfolio.
                        </p>
                        <Link href="/my-learning" className="inline-block mt-2 text-xs font-bold text-blue-600">
                            Go to My Learning
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
