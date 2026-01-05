"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, GripVertical, Save, Wand2, X, HelpCircle, AlertTriangle } from "lucide-react";

export interface Question {
    id?: string;
    type: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    score: number;
    order: number;
}

export interface QuizData {
    id?: string;
    title: string;
    description: string;
    type: string;
    timeLimit: number | "";
    attemptLimit: number | "";
    passingScore: number;
    randomize: boolean;
    status: string;
    questions: Question[];
}

interface QuizFormProps {
    initialData?: QuizData | null;
    isEditing?: boolean;
}

export default function QuizForm({ initialData, isEditing = false }: QuizFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showBulkImport, setShowBulkImport] = useState(false);
    const [bulkText, setBulkText] = useState("");

    // Quiz metadata
    const [title, setTitle] = useState(initialData?.title || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [type, setType] = useState(initialData?.type || "practice");
    const [timeLimit, setTimeLimit] = useState<number | "">(initialData?.timeLimit || "");
    const [attemptLimit, setAttemptLimit] = useState<number | "">(initialData?.attemptLimit || "");
    const [passingScore, setPassingScore] = useState(initialData?.passingScore || 70);
    const [randomize, setRandomize] = useState(initialData?.randomize || false);

    // Questions
    const [questions, setQuestions] = useState<Question[]>(initialData?.questions || []);

    // Determine sort/order on load
    useEffect(() => {
        if (initialData?.questions) {
            setQuestions([...initialData.questions].sort((a, b) => a.order - b.order));
        }
    }, [initialData]);

    const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
        type: "multiple_choice",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        explanation: "",
        score: 1,
    });

    const addQuestion = () => {
        if (!currentQuestion.question || !currentQuestion.correctAnswer) {
            alert("Please fill in question and correct answer");
            return;
        }

        const newQuestion: Question = {
            id: currentQuestion.id, // Only if editing a specific question (future)
            type: currentQuestion.type!,
            question: currentQuestion.question!,
            options: currentQuestion.options || [],
            correctAnswer: currentQuestion.correctAnswer!,
            explanation: currentQuestion.explanation || "",
            score: currentQuestion.score || 1,
            order: questions.length,
        };

        setQuestions([...questions, newQuestion]);

        // Reset form
        setCurrentQuestion({
            type: "multiple_choice",
            question: "",
            options: ["", "", "", ""],
            correctAnswer: "",
            explanation: "",
            score: 1,
        });
    };

    const removeQuestion = async (index: number) => {
        const questionToRemove = questions[index];

        // If editing and question has ID, we might want to delete it from API?
        // Or just mark for deletion? For simplicity in this form, we delete from state.
        // The API sync happens on save usually, but our API structure for Create was slightly different.
        // For Edit, we might want to confirm if it's an immediate delete or save-on-submit.
        // Let's assume Save-On-Submit for metadata, but maybe immediate for questions in Edit mode?
        // Actually, matching the Create flow: We save everything at the end? 
        // No, Create flow saved quiz first then added questions.
        // For Edit, we probably want to update the quiz record and reconcile questions.

        // Implementation Choice: Remove from UI state. 
        // If we are in "Edit Mode", we should probably track deleted IDs or handle it on Submit.
        // For now: Just filter state.

        setQuestions(questions.filter((_, i) => i !== index));

        // If we want immediate delete in Edit mode (common for simple CMS):
        if (isEditing && questionToRemove.id) {
            try {
                // We'll trust the user saves, or we could delete immediately.
                // Safest is to handle removals during the final PUT/PATCH logic if possible, 
                // OR delete immediately via API call if the UX suggests it.
                // Given the complexities, let's delete via API immediately for 'Edit' mode to keep state sync simple?
                // Or just keep it in state and handle diffing? Diffing is harder.
                // Let's do immediate delete API call if it has an ID.
                await fetch(`/api/quizzes/${initialData?.id}/questions/${questionToRemove.id}`, {
                    method: "DELETE"
                });
            } catch (e) {
                console.error("Failed to delete question", e);
                alert("Failed to delete question from server");
                // revert?
            }
        }
    };

    const parseBulkQuestions = () => {
        if (!bulkText.trim()) return;

        const lines = bulkText.split('\n');
        const newQuestions: Question[] = [];
        let currentQ: Partial<Question> | null = null;

        // Simple Parser Logic
        // 1. Question text
        // A. Option ...
        // ANSWER: A (or Answer: Option Text)

        const optionRegex = /^[A-Ea-e][\.\)]\s+(.*)/; // Matches "A. " or "a) "
        const answerRegex = /^(ANSWER|JAWABAN):\s*([A-Ea-e])/i;
        const questionNumberRegex = /^\d+[\.\)]\s+(.*)/;

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;

            // Check for Answer Line
            const answerMatch = trimmed.match(answerRegex);
            if (answerMatch && currentQ) {
                const answerIndex = answerMatch[2].toUpperCase().charCodeAt(0) - 65;
                if (currentQ.options && currentQ.options[answerIndex]) {
                    currentQ.correctAnswer = currentQ.options[answerIndex];
                }
                // Push and reset
                if (currentQ.question && currentQ.correctAnswer) {
                    newQuestions.push({
                        type: "multiple_choice",
                        question: currentQ.question,
                        options: currentQ.options || [],
                        correctAnswer: currentQ.correctAnswer,
                        explanation: "",
                        score: 1,
                        order: questions.length + newQuestions.length
                    } as Question);
                }
                currentQ = null;
                return;
            }

            // Check for Option Line
            const optionMatch = trimmed.match(optionRegex);
            if (optionMatch && currentQ) {
                if (!currentQ.options) currentQ.options = [];
                currentQ.options.push(optionMatch[1]);
                return;
            }

            // Must be a Question Line
            // If we have a pending question without an Answer line (maybe implicit?), push it?
            // No, require Answer line for robustness.
            // Or if we hit a new number, assume previous is done?
            const qMatch = trimmed.match(questionNumberRegex);

            if (qMatch) {
                // Start new question
                currentQ = {
                    question: qMatch[1],
                    options: [],
                    type: "multiple_choice"
                };
            } else if (!currentQ) {
                // Maybe question without number?
                currentQ = {
                    question: trimmed,
                    options: [],
                    type: "multiple_choice"
                };
            } else {
                // Continuation of question text or unparsed garbage?
                // Append to question text if it seems like a paragraph
                if (!optionMatch && !answerMatch) {
                    currentQ.question += " " + trimmed;
                }
            }
        });

        if (newQuestions.length > 0) {
            setQuestions([...questions, ...newQuestions]);
            setBulkText("");
            setShowBulkImport(false);
            alert(`Successfully added ${newQuestions.length} questions!`);
        } else {
            alert("Could not parse any questions. Please check the format.");
        }
    };

    const handleSubmit = async (status: "draft" | "active") => {
        if (!title) {
            alert("Please enter a quiz title");
            return;
        }

        setLoading(true);

        try {
            let quizId = initialData?.id;

            if (isEditing && quizId) {
                // UPDATE QUIZ
                await fetch(`/api/quizzes/${quizId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title,
                        description,
                        type,
                        timeLimit: timeLimit || null,
                        attemptLimit: attemptLimit || null,
                        passingScore,
                        randomize,
                        status
                    }),
                });

                // Sync Questions for Edit
                // Since we deleted removed questions immediately, we only need to Adding New or Updating Existing?
                // Simplest strategy for Edit: Just POST new questions (no ID). 
                // Updating existing questions within this form (editing text) is harder without a dedicated 'Edit Question' modal.
                // Assuming 'Add Question' only ADDS new ones. Existing ones are static in list?
                // Wait, users might want to edit typos.
                // We haven't built 'Edit Question' UI in the list yet. 
                // For now, let's treat the list as "Add New" or "Delete".
                // We will loop through `questions`. If it has no ID, POST it. 

                for (const q of questions) {
                    if (!q.id) {
                        await fetch(`/api/quizzes/${quizId}/questions`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(q), // Note: Route handles JSON.stringify of options? We fixed that bug.
                        });
                    }
                    // Future: If ID exists, PATCH it?
                }

                router.push("/admin/quizzes");
                router.refresh();

            } else {
                // CREATE QUIZ
                const quizRes = await fetch("/api/quizzes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title,
                        description,
                        type,
                        timeLimit: timeLimit || null,
                        attemptLimit: attemptLimit || null,
                        passingScore,
                        randomize,
                        status // Draft or Active
                    }),
                });

                if (!quizRes.ok) throw new Error("Failed to create quiz");

                const quiz = await quizRes.json();
                quizId = quiz.id;

                // Add questions
                for (const question of questions) {
                    await fetch(`/api/quizzes/${quizId}/questions`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(question),
                    });
                }

                router.push("/admin/quizzes");
            }

        } catch (error) {
            console.error("Failed to save quiz", error);
            alert("Failed to save quiz");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{isEditing ? "Edit Quiz" : "Create New Quiz"}</h1>
                    <p className="text-sm text-slate-500 mt-1">{isEditing ? "Update existing quiz details" : "Build a reusable quiz with custom questions"}</p>
                </div>
                {/* Bulk Import Button */}
                <button
                    onClick={() => setShowBulkImport(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition font-medium text-sm"
                >
                    <Wand2 size={16} />
                    Bulk Import
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left: Quiz Settings */}
                <div className="col-span-1 space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="font-bold text-slate-800 mb-4">Quiz Settings</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. JavaScript Basics Quiz"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="What is this quiz about?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="practice">Practice</option>
                                    <option value="final_exam">Final Exam</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Time Limit (minutes)
                                </label>
                                <input
                                    type="number"
                                    value={timeLimit}
                                    onChange={(e) => setTimeLimit(e.target.value ? parseInt(e.target.value) : "")}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Leave empty for unlimited"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Attempt Limit
                                </label>
                                <input
                                    type="number"
                                    value={attemptLimit}
                                    onChange={(e) => setAttemptLimit(e.target.value ? parseInt(e.target.value) : "")}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Leave empty for unlimited"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Passing Score (%)
                                </label>
                                <input
                                    type="number"
                                    value={passingScore}
                                    onChange={(e) => setPassingScore(parseInt(e.target.value))}
                                    min="0"
                                    max="100"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={randomize}
                                    onChange={(e) => setRandomize(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-700">Randomize questions</span>
                            </label>
                        </div>
                    </div>

                    {/* Questions Summary */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="font-bold text-slate-800 mb-2">Questions ({questions.length})</h3>
                        <p className="text-xs text-slate-500 mb-4">Preview of questions</p>

                        {questions.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-4">No questions added yet</p>
                        ) : (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {questions.map((q, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-2 bg-slate-50 rounded-lg group"
                                    >
                                        <div className="flex items-center gap-2 flex-1 overflow-hidden">
                                            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-slate-200 rounded-full text-xs font-bold text-slate-600">
                                                {index + 1}
                                            </div>
                                            <span className="text-xs text-slate-600 truncate">{q.question}</span>
                                        </div>
                                        <button
                                            onClick={() => removeQuestion(index)}
                                            className="opacity-100 md:opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded transition"
                                            title="Delete Question"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Question Builder */}
                <div className="col-span-1 md:col-span-2">
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="font-bold text-slate-800 mb-4">Add Question</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Question Type</label>
                                <select
                                    value={currentQuestion.type}
                                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="multiple_choice">Multiple Choice</option>
                                    <option value="true_false">True/False</option>
                                    <option value="short_answer">Short Answer</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Question <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={currentQuestion.question}
                                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter your question here..."
                                />
                            </div>

                            {currentQuestion.type === "multiple_choice" && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Options</label>
                                    {currentQuestion.options?.map((option, index) => (
                                        <div key={index} className="flex items-center gap-2 mb-2">
                                            <span className="text-sm font-medium text-slate-600 w-6">{String.fromCharCode(65 + index)}.</span>
                                            <input
                                                type="text"
                                                value={option}
                                                onChange={(e) => {
                                                    const newOptions = [...(currentQuestion.options || [])];
                                                    newOptions[index] = e.target.value;
                                                    setCurrentQuestion({ ...currentQuestion, options: newOptions });
                                                }}
                                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Correct Answer <span className="text-red-500">*</span>
                                </label>
                                {currentQuestion.type === "multiple_choice" ? (
                                    <select
                                        value={currentQuestion.correctAnswer}
                                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select correct answer</option>
                                        {currentQuestion.options?.map((option, index) => (
                                            <option key={index} value={option}>
                                                {String.fromCharCode(65 + index)}. {option}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        value={currentQuestion.correctAnswer}
                                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter correct answer"
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Explanation (Optional)</label>
                                <textarea
                                    value={currentQuestion.explanation}
                                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Explain why this is the correct answer..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Score</label>
                                <input
                                    type="number"
                                    value={currentQuestion.score}
                                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, score: parseInt(e.target.value) || 1 })}
                                    min="1"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <button
                                onClick={addQuestion}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                            >
                                <Plus size={20} />
                                Add Question
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 mt-6 pb-20">
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    onClick={() => handleSubmit("draft")}
                    className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition disabled:opacity-50 flex items-center gap-2"
                    disabled={loading}
                >
                    <Save size={18} />
                    Save as Draft
                </button>
                <button
                    onClick={() => handleSubmit("active")}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                    disabled={loading}
                >
                    <Save size={18} />
                    {loading ? "Saving..." : "Save & Activate"}
                </button>
            </div>

            {/* Bulk Import Modal */}
            {showBulkImport && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Wand2 className="text-indigo-500" />
                                Bulk Import Questions
                            </h3>
                            <button onClick={() => setShowBulkImport(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg mb-4 text-sm text-indigo-800">
                                <h4 className="font-bold flex items-center gap-2 mb-2">
                                    <HelpCircle size={16} />
                                    Format Guide
                                </h4>
                                <p className="mb-2">Paste your questions in the following format:</p>
                                <pre className="bg-white/50 p-3 rounded border border-indigo-100 font-mono text-xs">
                                    {`1. What is the capital of Indonesia?
A. Jakarta
B. Bandung
C. Surabaya
ANSWER: A

2. Which planet is the Red Planet?
A. Venus
B. Mars
ANSWER: Mars`}
                                </pre>
                            </div>

                            <textarea
                                value={bulkText}
                                onChange={(e) => setBulkText(e.target.value)}
                                className="w-full h-64 p-4 border border-slate-200 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Paste your questions here..."
                            />
                        </div>

                        <div className="p-6 border-t flex justify-end gap-3 bg-slate-50 rounded-b-xl">
                            <button
                                onClick={() => setShowBulkImport(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={parseBulkQuestions}
                                disabled={!bulkText.trim()}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Process Questions
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
