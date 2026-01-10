"use client";

import { useEffect, useState } from "react";
import { HelpCircle, Link as LinkIcon, Search, Check, ExternalLink, Upload, Loader2, Plus } from "lucide-react";
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

    const parseDocxQuestions = (text: string) => {
        if (!text.trim()) return [];

        // Normalize text: ensure newlines before question numbers if missing
        // This helps if everything is one giant blob
        let cleanText = text.replace(/(\r\n|\n|\r)/gm, "\n");

        // Split by "Answer:" to get chunks, but this might be risky if Answer is missing.
        // Better strategy: Split by Question Number `\n\d+\.` or `^\d+\.`

        const questionBlocks: string[] = [];
        const lines = cleanText.split('\n');
        let currentBlock = "";

        lines.forEach(line => {
            if (/^\d+\./.test(line.trim())) {
                if (currentBlock) questionBlocks.push(currentBlock);
                currentBlock = line;
            } else {
                currentBlock += "\n" + line;
            }
        });
        if (currentBlock) questionBlocks.push(currentBlock);

        const newQuestions: any[] = [];

        questionBlocks.forEach((block, index) => {
            // Extract Answer
            const answerMatch = block.match(/(?:Answer|JAWABAN):\s*([A-E])/i);
            const correctAnswerChar = answerMatch ? answerMatch[1].toUpperCase() : null;

            // Remove Answer line from block to process Question + Options
            let content = block.replace(/(?:Answer|JAWABAN):\s*([A-E])[\s\S]*/i, "").trim();

            // Basic strategy: Find where "A." starts. 
            // Note: This assumes A. appears once as the start of options. 
            // If "A." appears in question text, this breaks. 
            // We'll rely on the format "A. " (A dot space).

            const optionsStartIndex = content.search(/\bA\.\s/);

            if (optionsStartIndex === -1) return; // No options found

            const questionText = content.substring(0, optionsStartIndex).replace(/^\d+\.\s*/, "").trim();
            const optionsText = content.substring(optionsStartIndex);

            // Split options: "A. Option A B. Option B..."
            // We can use a regex to match " X. "
            const options: string[] = [];

            // We need to split by " A. ", " B. ", " C. ", " D. ", " E. "
            // Use a capturing group approach or split.
            // Let's use a simple state machine or specific regex replace to parse

            let currentOptionChar = 'A';
            let remainingOptions = optionsText;

            while (true) {
                const nextChar = String.fromCharCode(currentOptionChar.charCodeAt(0) + 1);
                const currentMarker = `${currentOptionChar}.`;
                const nextMarker = `${nextChar}.`;

                const startIdx = remainingOptions.indexOf(currentMarker);
                if (startIdx === -1) break; // Should not happen for first one

                const nextIdx = remainingOptions.indexOf(nextMarker);

                let optionContent = "";
                if (nextIdx !== -1) {
                    optionContent = remainingOptions.substring(startIdx + currentMarker.length, nextIdx).trim();
                    // Advance
                    currentOptionChar = nextChar; // Go to B
                } else {
                    // Last option (e.g. D or E)
                    optionContent = remainingOptions.substring(startIdx + currentMarker.length).trim();
                    if (optionContent) options.push(optionContent);
                    break;
                }

                if (optionContent) options.push(optionContent);
            }

            if (questionText && options.length > 0 && correctAnswerChar) {
                // Map char 'A' -> option string
                const correctIndex = correctAnswerChar.charCodeAt(0) - 65;
                const correctOptionString = options[correctIndex];

                if (correctOptionString) {
                    newQuestions.push({
                        type: "multiple_choice",
                        question: questionText,
                        options: options,
                        correctAnswer: correctOptionString,
                        explanation: "",
                        score: 1,
                        order: index
                    });
                }
            }
        });

        return newQuestions;
    };

    const handleCreateFromDocx = async (e: React.ChangeEvent<HTMLInputElement>, moduleIdx: number, lessonIdx: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true); // Reuse loading or add precise state
        const formData = new FormData();
        formData.append("file", file);

        try {
            // 1. Upload & Parse
            const parseRes = await fetch("/api/utils/parse-docx", { method: "POST", body: formData });
            if (!parseRes.ok) throw new Error("Failed to parse docx");
            const parseData = await parseRes.json();

            // 2. Extract Questions
            const questions = parseDocxQuestions(parseData.text);
            if (questions.length === 0) {
                alert("Could not find valid questions. Please check format.");
                return;
            }

            // 3. Extract Title (From "Materi: ..." or default)
            let quizTitle = "New Quiz from Docx";
            const titleMatch = parseData.text.match(/Materi:\s*(.*)/i);
            if (titleMatch) quizTitle = "Kuis: " + titleMatch[1].trim();
            else if (file.name) quizTitle = "Kuis: " + file.name.replace(".docx", "");

            // 4. Create Quiz
            const quizRes = await fetch("/api/quizzes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: quizTitle,
                    description: "Auto-generated from " + file.name,
                    type: "practice",
                    status: "active", // Make active immediately for use
                    passingScore: 70
                }),
            });
            if (!quizRes.ok) throw new Error("Failed to create quiz");
            const quiz = await quizRes.json();

            // 5. Add Questions
            for (const [index, q] of questions.entries()) {
                await fetch(`/api/quizzes/${quiz.id}/questions`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...q, order: index }),
                });
            }

            // 6. Link to Lesson
            updateModuleLesson(moduleIdx, lessonIdx, "content", quiz.id);
            alert(`Berhasil membuat kuis "${quizTitle}" dengan ${questions.length} soal!`);

            // Refresh list helps if we open modal later
            // We can manually add to local state too
            setQuizzes(prev => [quiz, ...prev]);

        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan saat memproses file.");
        } finally {
            setLoading(false);
            e.target.value = "";
        }
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
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                openQuizSelector(lesson.moduleIdx, lesson.lessonIdx);
                                            }}
                                        >
                                            Pilih Kuis
                                        </Button>
                                        <div className="relative">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                icon={<Upload size={14} />}
                                                onClick={() => {
                                                    document.getElementById(`upload-quiz-${lesson.id}`)?.click();
                                                }}
                                            >
                                                Buat dari Docx
                                            </Button>
                                            <input
                                                id={`upload-quiz-${lesson.id}`}
                                                type="file"
                                                accept=".docx"
                                                className="hidden"
                                                onChange={(e) => handleCreateFromDocx(e, lesson.moduleIdx, lesson.lessonIdx)}
                                            />
                                        </div>
                                    </div>
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
