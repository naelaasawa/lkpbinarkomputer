"use client";

import { HelpCircle } from "lucide-react";

export default function QuizzesPage() {
    return (
        <div className="max-w-4xl mx-auto p-6 md:py-10">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">My Quizzes</h1>
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-slate-300 text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                    <HelpCircle size={32} />
                </div>
                <h2 className="text-lg font-semibold text-slate-700">No Active Quizzes</h2>
                <p className="text-slate-500 mt-1 max-w-sm">
                    Quizzes assigned to you or part of your enrolled courses will appear here.
                </p>
                <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                    Browse Courses
                </button>
            </div>
        </div>
    );
}
