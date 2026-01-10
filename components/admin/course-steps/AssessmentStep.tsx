"use client";

import { useEffect, useState } from "react";
import { HelpCircle, Link as LinkIcon, Search, Check, ExternalLink } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface Quiz {
    id: string;
    title: string;
    questionsCount: number;
}

interface Module {
    id: string;
    title: string;
    lessons: { id: string; title: string; contentType: string; content?: string }[];
}

interface AssessmentStepProps {
    modules: Module[];
    updateModuleLesson: (moduleIdx: number, lessonIdx: number, field: string, value: string) => void;
}

export default function AssessmentStep({ modules, updateModuleLesson }: AssessmentStepProps) {
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTarget, setSelectedTarget] = useState<{ moduleIdx: number; lessonIdx: number } | null>(null);

    // Fetch quizzes
    useEffect(() => {
        const fetchQuizzes = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/quizzes");
                if (res.ok) {
                    const data = await res.json();
                    setQuizzes(data);
                }
            } catch (err) {
                console.error("Failed to fetch quizzes", err);
            } finally {
                setLoading(false);
            }
        };
        if (showQuizModal) {
            fetchQuizzes();
        }
    }, [showQuizModal]);

    const quizLessons = modules.flatMap((m, mIdx) =>
        m.lessons
            .map((l, lIdx) => ({ ...l, moduleIdx: mIdx, lessonIdx: lIdx, moduleTitle: m.title }))
            .filter((l) => l.contentType === "quiz")
    );

    const openQuizSelector = (moduleIdx: number, lessonIdx: number) => {
        setSelectedTarget({ moduleIdx, lessonIdx });
        setShowQuizModal(true);
    };

    const selectQuiz = (quizId: string) => {
        if (selectedTarget) {
            updateModuleLesson(selectedTarget.moduleIdx, selectedTarget.lessonIdx, "content", quizId);
            setShowQuizModal(false);
            setSelectedTarget(null);
        }
    };

    const filteredQuizzes = quizzes.filter((q) =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="pb-6 border-b border-slate-100">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Asesmen & Kuis
                </h2>
                <p className="text-slate-500 mt-1">Hubungkan kuis ke materi pembelajaran</p>
            </div>

            {/* Quiz Manager Link */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50/30 rounded-2xl p-6 border border-red-100">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                        <HelpCircle size={24} className="text-red-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 mb-1">Quiz Manager</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Buat dan kelola kuis di Quiz Manager, lalu hubungkan ke materi di kursus ini.
                        </p>
                        <a
                            href="/admin/quizzes"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-xl text-red-600 font-medium hover:bg-red-50 transition text-sm"
                        >
                            <ExternalLink size={16} />
                            Buka Quiz Manager
                        </a>
                    </div>
                </div>
            </div>

            {/* Quiz Lessons List */}
            {quizLessons.length > 0 ? (
                <div className="space-y-4">
                    <h3 className="font-semibold text-slate-700">Materi Kuis dalam Kursus Ini</h3>
                    {quizLessons.map((lesson) => {
                        const linkedQuiz = quizzes.find((q) => q.id === lesson.content);

                        return (
                            <div
                                key={lesson.id}
                                className="flex items-center gap-4 p-4 bg-white border-2 border-slate-200 rounded-xl"
                            >
                                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                                    <HelpCircle size={20} className="text-red-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-slate-800">{lesson.title || "Kuis Tanpa Judul"}</p>
                                    <p className="text-xs text-slate-500">
                                        {lesson.moduleTitle} • Materi {lesson.lessonIdx + 1}
                                    </p>
                                </div>
                                {linkedQuiz ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg font-medium">
                                            <Check size={12} className="inline mr-1" />
                                            {linkedQuiz.title}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => openQuizSelector(lesson.moduleIdx, lesson.lessonIdx)}
                                            className="text-xs text-blue-600 font-medium hover:underline"
                                        >
                                            Ganti
                                        </button>
                                    </div>
                                ) : (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => openQuizSelector(lesson.moduleIdx, lesson.lessonIdx)}
                                    >
                                        Pilih Kuis
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                        <HelpCircle size={28} className="text-slate-400" />
                    </div>
                    <h3 className="font-semibold text-slate-700 mb-2">Belum ada materi kuis</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                        Tambahkan materi dengan tipe "Kuis" di langkah Kurikulum untuk menghubungkan kuis
                    </p>
                </div>
            )}

            {/* Quiz Selector Modal */}
            <Modal
                isOpen={showQuizModal}
                onClose={() => setShowQuizModal(false)}
                title="Pilih Kuis"
                size="lg"
            >
                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari kuis..."
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Quiz List */}
                    <div className="max-h-64 overflow-y-auto space-y-2">
                        {loading ? (
                            <p className="text-center py-4 text-slate-500">Memuat kuis...</p>
                        ) : filteredQuizzes.length > 0 ? (
                            filteredQuizzes.map((quiz) => (
                                <button
                                    key={quiz.id}
                                    type="button"
                                    onClick={() => selectQuiz(quiz.id)}
                                    className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border-2 border-slate-200 rounded-xl transition text-left"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                                        <HelpCircle size={18} className="text-red-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-800">{quiz.title}</p>
                                        <p className="text-xs text-slate-500">{quiz.questionsCount || 0} pertanyaan</p>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <p className="text-center py-4 text-slate-500">Tidak ada kuis ditemukan</p>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
}
