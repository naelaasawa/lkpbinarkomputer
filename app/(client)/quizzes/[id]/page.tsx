"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, XCircle, ChevronRight, AlertCircle } from "lucide-react";

interface Question {
    id: string;
    type: string;
    question: string;
    options: string; // JSON string from DB
    order: number;
    score: number;
    // We don't fetch answer/explanation for client side security usually, 
    // but for simple implementation we might fetch it and hide it?
    // Better: Submit to API to check. 
    // BUT user asked for simple client side implementation first?
    // "Terapkan juga di sisi client" -> Apply on client side.
    // Let's implement local checking for now for immediate feedback, 
    // but IDEALLY we should use a /submit API.
    // Given the previous code, the public API `GET /api/quizzes/[id]` returns questions. 
    // Does it return correct answers?
    // Let's check `app/api/quizzes/[id]/route.ts`.
    // It returns `questions: true`.
    // If Question model has `correctAnswer`, it WILL be returned.
    // This is insecure for a real app (students can inspect network), 
    // but acceptable for this "Course Creator" demo scope unless specified otherwise.
    correctAnswer: string;
    explanation: string;
}

interface Quiz {
    id: string;
    title: string;
    description: string;
    timeLimit: number | null;
    questions: Question[];
}

export default function ClientQuizPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await fetch(`/api/quizzes/${id}`);
                if (!res.ok) throw new Error("Quiz not found");
                const data = await res.json();

                // Parse options if they are strings
                const parsedQuestions = data.questions.map((q: any) => ({
                    ...q,
                    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options || []
                }));

                // Sort by order
                parsedQuestions.sort((a: any, b: any) => a.order - b.order);

                setQuiz({ ...data, questions: parsedQuestions });
            } catch (err) {
                setError("Failed to load quiz");
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [id]);

    const handleOptionSelect = (option: string) => {
        if (isSubmitted) return;
        const currentQ = quiz?.questions[currentQuestionIndex];
        if (!currentQ) return;

        setAnswers(prev => ({
            ...prev,
            [currentQ.id]: option
        }));
    };

    const handleNext = () => {
        if (!quiz) return;
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        if (!quiz) return;

        // Calculate score
        let correctCount = 0;
        let totalScore = 0;
        let earnedScore = 0;

        quiz.questions.forEach(q => {
            totalScore += q.score;
            if (answers[q.id] === q.correctAnswer) {
                correctCount++;
                earnedScore += q.score;
            }
        });

        // Calculate percentage only if totalScore > 0, else 0
        const finalPercentage = totalScore > 0 ? Math.round((earnedScore / totalScore) * 100) : 0;

        setScore(finalPercentage);
        setIsSubmitted(true);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading quiz...</div>;
    if (error || !quiz) return <div className="min-h-screen flex items-center justify-center text-red-500">{error || "Quiz not found"}</div>;

    const currentQ = quiz.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

    // Results View
    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-slate-50 py-10 px-4">
                <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-8 text-center border-b border-slate-100">
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={40} />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Quiz Completed!</h1>
                        <p className="text-slate-500">You have finished {quiz.title}</p>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-2 gap-4 text-center mb-8">
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <div className="text-sm text-slate-500 mb-1">Your Score</div>
                                <div className="text-3xl font-bold text-slate-900">{score}%</div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <div className="text-sm text-slate-500 mb-1">Questions</div>
                                <div className="text-3xl font-bold text-slate-900">{quiz.questions.length}</div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="font-bold text-slate-800">Review Answers</h3>
                            {quiz.questions.map((q, idx) => {
                                const userAnswer = answers[q.id];
                                const isCorrect = userAnswer === q.correctAnswer;

                                return (
                                    <div key={q.id} className={`p-4 rounded-xl border ${isCorrect ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"}`}>
                                        <div className="flex gap-3">
                                            <span className="font-bold text-slate-400">{idx + 1}.</span>
                                            <div className="flex-1">
                                                <div className="font-medium text-slate-900 mb-2">{q.question}</div>
                                                <div className="flex flex-col gap-2 text-sm">
                                                    <div className={`flex items-center gap-2 ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                                                        {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                                        Your answer: {userAnswer || "Skipped"}
                                                    </div>
                                                    {!isCorrect && (
                                                        <div className="text-slate-600 flex items-center gap-2">
                                                            <CheckCircle2 size={16} className="text-green-600" />
                                                            Correct answer: <span className="font-medium">{q.correctAnswer}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {q.explanation && (
                                                    <div className="mt-3 text-sm text-slate-500 bg-white/50 p-2 rounded">
                                                        <span className="font-semibold">Explanation:</span> {q.explanation}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-center">
                        <button
                            onClick={() => router.push("/courses")}
                            className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-medium"
                        >
                            Back to Courses
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Quiz Taking View
    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">{quiz.title}</h1>
                        <p className="text-sm text-slate-500 max-w-md truncate">{quiz.description}</p>
                    </div>
                    {quiz.timeLimit && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium border border-amber-100">
                            <Clock size={16} />
                            {quiz.timeLimit} mins
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 mb-8">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                    />
                </div>

                {/* Question Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px] flex flex-col">
                    <div className="p-8 flex-1">
                        <div className="mb-6">
                            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold mb-3">
                                Question {currentQuestionIndex + 1} of {quiz.questions.length}
                            </span>
                            <h2 className="text-xl font-medium text-slate-900 leading-relaxed">
                                {currentQ.question}
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {(currentQ.options as unknown as string[]).map((option, idx) => {
                                const isSelected = answers[currentQ.id] === option;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(option)}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group
                                            ${isSelected
                                                ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                                                : "border-slate-100 hover:border-blue-200 hover:bg-slate-50 text-slate-700"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors
                                                ${isSelected
                                                    ? "bg-blue-500 border-blue-500 text-white"
                                                    : "bg-white border-slate-200 text-slate-400 group-hover:border-blue-300 group-hover:text-blue-500"
                                                }`}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <span>{option}</span>
                                        </div>
                                        {isSelected && <CheckCircle2 size={20} className="text-blue-500" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                        <button
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                            className="px-4 py-2 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500 font-medium transition"
                        >
                            Previous
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={!answers[currentQ.id]}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center gap-2"
                        >
                            {isLastQuestion ? "Finish Quiz" : "Next Question"}
                            {!isLastQuestion && <ChevronRight size={18} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
