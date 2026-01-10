"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, FileQuestion, Share2, Wand2, X, HelpCircle, Upload, Loader2 } from "lucide-react";
import ShareQuizModal from "@/components/admin/ShareQuizModal";
import { useRouter } from "next/navigation";

interface Quiz {
    id: string;
    title: string;
    description: string | null;
    type: string;
    status: string;
    _count: {
        questions: number;
    };
    createdAt: string;
}

export default function QuizzesPage() {
    const router = useRouter();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    // Share Modal State
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [selectedQuizForShare, setSelectedQuizForShare] = useState<{ id: string, title: string } | null>(null);

    // Bulk Import State
    const [bulkModalOpen, setBulkModalOpen] = useState(false);
    const [bulkTitle, setBulkTitle] = useState("");
    const [bulkText, setBulkText] = useState("");
    const [bulkLoading, setBulkLoading] = useState(false);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const res = await fetch("/api/quizzes");
            if (res.ok) {
                const data = await res.json();
                setQuizzes(data);
            }
        } catch (error) {
            console.error("Failed to fetch quizzes", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this quiz?")) return;

        try {
            const res = await fetch(`/api/quizzes/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setQuizzes(quizzes.filter((q) => q.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete quiz", error);
        }
    };

    const handleShare = (quiz: Quiz) => {
        setSelectedQuizForShare({ id: quiz.id, title: quiz.title });
        setShareModalOpen(true);
    };

    const parseBulkQuestions = (text: string) => {
        if (!text.trim()) return [];

        const lines = text.split('\n');
        const newQuestions: any[] = [];
        let currentQ: any = null;

        const optionRegex = /^([A-Ea-e])[\.\)]\s+(.*)/; // Matches "A. Content"
        // Also match "True" or "False" as options if they appear on their own line? 
        // Or just let user type them. Let's strictly look for A-E for standard MC, 
        // but if we see "True" or "False" on a line by itself, treat as option?

        const answerRegex = /^(?:ANSWER|JAWABAN):\s*(.*)/i; // Capture full text
        const questionNumberRegex = /^\d+[\.\)]\s+(.*)/;

        const finalizeQuestion = (q: any) => {
            if (!q) return;

            // Type Inference
            if (q.options.length === 0) {
                // No options -> Short Answer or Essay
                // If answer provided, Short Answer.
                q.type = "short_answer";
            } else {
                // Has options
                // Check if options look like True/False
                const lowerOpts = q.options.map((o: string) => o.toLowerCase());
                if (lowerOpts.includes('true') || lowerOpts.includes('false') || lowerOpts.includes('benar') || lowerOpts.includes('salah')) {
                    q.type = "true_false";
                } else {
                    q.type = "multiple_choice";
                }
            }

            // Map Answer Text to Option Key (A, B, C...) or keep as text
            if (q.rawAnswer) {
                const ans = q.rawAnswer.trim();

                // 1. Check if single letter A-E
                if (/^[A-E]$/i.test(ans)) {
                    // Convert A -> Option Index -> Text
                    const idx = ans.toUpperCase().charCodeAt(0) - 65;
                    if (q.options[idx]) q.correctAnswer = q.options[idx];
                }
                // 2. Check if Answer matches an option text exactly
                else {
                    const match = q.options.find((o: string) => o.toLowerCase() === ans.toLowerCase());
                    if (match) q.correctAnswer = match;
                    else q.correctAnswer = ans; // Fallback for short answer
                }
            }

            // Validations
            if (q.question) {
                newQuestions.push({
                    type: q.type || "multiple_choice",
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer || "",
                    explanation: "",
                    score: 1,
                    order: newQuestions.length
                });
            }
        };

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;

            // 1. Check for Answer line
            const answerMatch = trimmed.match(answerRegex);
            if (answerMatch) {
                if (currentQ) {
                    currentQ.rawAnswer = answerMatch[1];
                    finalizeQuestion(currentQ);
                    currentQ = null;
                }
                return;
            }

            // 2. Check for Option (A. ...)
            const optionMatch = trimmed.match(optionRegex);
            if (optionMatch) {
                if (currentQ) {
                    // Add option
                    currentQ.options.push(optionMatch[2]);
                }
                return;
            }

            // 2b. Check for Special Options (True/False) without A./B. prefix
            // If the line is exactly "True", "False", "Benar", "Salah"
            const lowerLine = trimmed.toLowerCase();
            if (["true", "false", "benar", "salah"].includes(lowerLine)) {
                if (currentQ) currentQ.options.push(trimmed);
                return;
            }

            // 3. New Question Start (1. ...)
            const qMatch = trimmed.match(questionNumberRegex);
            if (qMatch) {
                // If previous exists, finalize it (case where no answer line provided)
                if (currentQ) finalizeQuestion(currentQ);

                currentQ = {
                    question: qMatch[1],
                    options: [],
                };
            }
            // 4. Continuation or Unnumbered Question
            else {
                if (!currentQ && trimmed.length > 0) {
                    // Maybe start of question without number?
                    currentQ = {
                        question: trimmed,
                        options: [],
                    };
                } else if (currentQ) {
                    // Append to question text if no options yet
                    // If options exist, we can't easily append to question, likely broken format
                    // But assume multiline question
                    if (currentQ.options.length === 0) {
                        currentQ.question += " " + trimmed;
                    }
                }
            }
        });

        // Finalize last
        if (currentQ) finalizeQuestion(currentQ);

        return newQuestions;
    };

    const handleImportDocx = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setBulkLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/utils/parse-docx", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                if (data.text) {
                    setBulkText((prev) => (prev ? prev + "\n\n" + data.text : data.text));
                    alert("Import successful! Please review the text format.");
                }
            } else {
                alert("Failed to import document");
            }
        } catch (error) {
            console.error("Import error", error);
            alert("Error importing document");
        } finally {
            setBulkLoading(false);
            e.target.value = ""; // Reset input
        }
    };

    const handleBulkCreate = async () => {
        if (!bulkTitle) {
            alert("Please enter a title");
            return;
        }
        if (!bulkText) {
            alert("Please enter questions");
            return;
        }

        const questions = parseBulkQuestions(bulkText);
        if (questions.length === 0) {
            alert("No valid questions found. Check format.");
            return;
        }

        setBulkLoading(true);
        try {
            // 1. Create Quiz
            const quizRes = await fetch("/api/quizzes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: bulkTitle,
                    description: "Created via Bulk Import",
                    type: "practice",
                    status: "draft", // Safe default
                    passingScore: 70
                }),
            });

            if (!quizRes.ok) throw new Error("Failed to create quiz");
            const quiz = await quizRes.json();

            // 2. Add Questions
            for (const [index, q] of questions.entries()) {
                await fetch(`/api/quizzes/${quiz.id}/questions`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...q, order: index }),
                });
            }

            setBulkModalOpen(false);
            setBulkTitle("");
            setBulkText("");
            fetchQuizzes(); // Refresh list
            alert(`Quiz "${bulkTitle}" created with ${questions.length} questions!`);

        } catch (error) {
            console.error(error);
            alert("Failed to create quiz");
        } finally {
            setBulkLoading(false);
        }
    };

    const filteredQuizzes = quizzes.filter((quiz) => {
        if (filter === "all") return true;
        return quiz.status === filter;
    });

    if (loading) {
        return <div className="p-10 text-center">Loading quizzes...</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quiz Manager</h1>
                    <p className="text-sm text-slate-500 mt-1">Create and manage reusable quizzes</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setBulkModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition font-medium"
                    >
                        <Wand2 size={20} />
                        Bulk Create
                    </button>
                    <Link
                        href="/admin/quizzes/create"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus size={20} />
                        Create Quiz
                    </Link>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex gap-4 mb-6">
                <div className="flex gap-2">
                    {["all", "draft", "active"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === status
                                ? "bg-blue-600 text-white"
                                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search quizzes..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Quiz Table */}
            {filteredQuizzes.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                    <FileQuestion className="mx-auto text-slate-300 mb-4" size={48} />
                    <h3 className="text-lg font-bold text-slate-800 mb-2">No quizzes found</h3>
                    <p className="text-slate-500 mb-4">Get started by creating your first quiz</p>
                    <Link
                        href="/admin/quizzes/create"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus size={20} />
                        Create Quiz
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Title</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Type</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Questions</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredQuizzes.map((quiz) => (
                                <tr key={quiz.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                    <td className="px-4 py-4">
                                        <div>
                                            <div className="font-semibold text-slate-800">{quiz.title}</div>
                                            {quiz.description && (
                                                <div className="text-sm text-slate-500 line-clamp-1 mt-1">{quiz.description}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-slate-600 capitalize">{quiz.type.replace("_", " ")}</td>
                                    <td className="px-4 py-4">
                                        <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                                            <FileQuestion size={16} />
                                            {quiz._count.questions}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${quiz.status === "active"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            {quiz.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleShare(quiz)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                title="Share Quiz"
                                            >
                                                <Share2 size={18} />
                                            </button>
                                            <Link
                                                href={`/admin/quizzes/${quiz.id}/edit`}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                title="Edit Quiz"
                                            >
                                                <Edit size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(quiz.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                title="Delete Quiz"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Share Modal */}
            {selectedQuizForShare && (
                <ShareQuizModal
                    quizId={selectedQuizForShare.id}
                    quizTitle={selectedQuizForShare.title}
                    isOpen={shareModalOpen}
                    onClose={() => setShareModalOpen(false)}
                />
            )}

            {/* Bulk Create Modal */}
            {bulkModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Wand2 className="text-indigo-500" />
                                Bulk Create Quiz
                            </h3>
                            <button onClick={() => setBulkModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Quiz Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={bulkTitle}
                                    onChange={(e) => setBulkTitle(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Quick Practice Quiz"
                                />
                            </div>

                            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg text-sm text-indigo-800">
                                <h4 className="font-bold flex items-center gap-2 mb-2">
                                    <HelpCircle size={16} />
                                    Format Examples
                                </h4>
                                <div className="text-xs space-y-4">
                                    <div>
                                        <p className="font-bold mb-1">1. Multiple Choice (Auto-detect A/B/C)</p>
                                        <pre className="bg-white/50 p-2 rounded border border-indigo-100 font-mono">
                                            {`1. Capital of France?
A. London
B. Paris
ANSWER: B (or ANSWER: Paris)`}
                                        </pre>
                                    </div>
                                    <div>
                                        <p className="font-bold mb-1">2. True/False</p>
                                        <pre className="bg-white/50 p-2 rounded border border-indigo-100 font-mono">
                                            {`2. The earth is flat.
True
False
ANSWER: False`}
                                        </pre>
                                    </div>
                                    <div>
                                        <p className="font-bold mb-1">3. Short Answer (No Options)</p>
                                        <pre className="bg-white/50 p-2 rounded border border-indigo-100 font-mono">
                                            {`3. What is 2 + 2?
ANSWER: 4`}
                                        </pre>
                                    </div>
                                </div>
                                <p className="mt-2 text-xs italic text-indigo-600">
                                    "ANSWER:" is optional if you just want to generate structure.
                                </p>
                            </div>

                            <div className="flex justify-end mb-2">
                                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium">
                                    {bulkLoading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                    Import from Word (.docx)
                                    <input
                                        type="file"
                                        accept=".docx"
                                        className="hidden"
                                        onChange={handleImportDocx}
                                        disabled={bulkLoading}
                                    />
                                </label>
                            </div>

                            <textarea
                                value={bulkText}
                                onChange={(e) => setBulkText(e.target.value)}
                                className="w-full h-48 p-4 border border-slate-200 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Paste your questions here..."
                            />
                        </div>

                        <div className="p-6 border-t flex justify-end gap-3 bg-slate-50 rounded-b-xl">
                            <button
                                onClick={() => setBulkModalOpen(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition"
                                disabled={bulkLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkCreate}
                                disabled={!bulkText.trim() || !bulkTitle.trim() || bulkLoading}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {bulkLoading ? "Creating..." : "Create Quiz"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
