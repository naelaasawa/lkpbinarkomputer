"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, XCircle, ChevronRight, AlertCircle, X } from "lucide-react";
import { getDeviceType, isLowEndDevice, isTouchDevice } from "@/lib/utils/platformDetection";

interface Question {
    id: string;
    type: string;
    question: string;
    options: string; // JSON string from DB
    order: number;
    score: number;
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

    const [isFullScreen, setIsFullScreen] = useState(false);
    const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
    const [isTouch, setIsTouch] = useState(false);
    const [isLowEnd, setIsLowEnd] = useState(false);

    // Detect device type and capabilities on mount
    useEffect(() => {
        setDeviceType(getDeviceType());
        setIsTouch(isTouchDevice());
        setIsLowEnd(isLowEndDevice());

        // Automatically enter full-screen mode
        setIsFullScreen(true);

        // Prevent body scroll when in full-screen
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    // Handle escape key to exit full-screen
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullScreen) {
                handleExitFullScreen();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isFullScreen]);

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

    const handleExitFullScreen = () => {
        setIsFullScreen(false);
        document.body.style.overflow = '';
        router.push('/courses');
    };

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

    // Platform-specific classes
    const isMobileDevice = deviceType === 'mobile' || deviceType === 'tablet';
    const containerPadding = isMobileDevice ? 'p-4' : 'p-6 md:p-8';
    const buttonSize = isMobileDevice ? 'min-h-[48px] px-6 py-3' : 'px-6 py-2';
    const optionSize = isMobileDevice ? 'min-h-[56px] p-4' : 'p-4';

    // Reduce animations on low-end devices
    const animationClass = isLowEnd ? '' : 'transition-all duration-200';
    const shadowClass = isLowEnd ? 'shadow-sm' : 'shadow-xl';

    if (loading) return (
        <div className={`${isFullScreen ? 'fixed inset-0 z-50' : 'min-h-screen'} flex items-center justify-center bg-slate-50`}>
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 font-medium">Loading quiz...</p>
            </div>
        </div>
    );

    if (error || !quiz) return (
        <div className={`${isFullScreen ? 'fixed inset-0 z-50' : 'min-h-screen'} flex items-center justify-center text-red-500 bg-slate-50`}>
            <div className="text-center">
                <XCircle size={48} className="mx-auto mb-4" />
                <p className="font-medium">{error || "Quiz not found"}</p>
            </div>
        </div>
    );

    const currentQ = quiz.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

    // Results View
    if (isSubmitted) {
        return (
            <div className={`${isFullScreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-slate-50 overflow-y-auto ${animationClass}`}>
                {/* Exit Full-Screen Button */}
                {isFullScreen && (
                    <button
                        onClick={handleExitFullScreen}
                        className={`fixed top-4 right-4 z-50 ${buttonSize} bg-white text-slate-700 rounded-xl hover:bg-slate-50 ${animationClass} ${shadowClass} flex items-center gap-2 font-semibold`}
                        aria-label="Exit and return to courses"
                    >
                        <X size={isMobileDevice ? 24 : 20} />
                        <span className={isMobileDevice ? 'text-base' : 'text-sm'}>Exit</span>
                    </button>
                )}

                <div className={`max-w-2xl mx-auto ${containerPadding} ${isMobileDevice ? 'pt-20' : 'py-10'}`}>
                    <div className={`bg-white rounded-2xl ${shadowClass} border border-slate-200 overflow-hidden`}>
                        <div className={`${containerPadding} text-center border-b border-slate-100`}>
                            <div className={`${isMobileDevice ? 'w-24 h-24' : 'w-20 h-20'} bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4`}>
                                <CheckCircle2 size={isMobileDevice ? 48 : 40} />
                            </div>
                            <h1 className={`${isMobileDevice ? 'text-3xl' : 'text-2xl'} font-bold text-slate-900 mb-2`}>Quiz Completed!</h1>
                            <p className={`text-slate-500 ${isMobileDevice ? 'text-base' : 'text-sm'}`}>You have finished {quiz.title}</p>
                        </div>

                        <div className={containerPadding}>
                            <div className={`grid ${isMobileDevice ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'} text-center mb-8`}>
                                <div className={`${containerPadding} bg-slate-50 rounded-xl`}>
                                    <div className="text-sm text-slate-500 mb-1">Your Score</div>
                                    <div className={`${isMobileDevice ? 'text-4xl' : 'text-3xl'} font-bold text-slate-900`}>{score}%</div>
                                </div>
                                <div className={`${containerPadding} bg-slate-50 rounded-xl`}>
                                    <div className="text-sm text-slate-500 mb-1">Questions</div>
                                    <div className={`${isMobileDevice ? 'text-4xl' : 'text-3xl'} font-bold text-slate-900`}>{quiz.questions.length}</div>
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
                                                    <div className={`font-medium text-slate-900 mb-2 ${isMobileDevice ? 'text-base' : 'text-sm'}`}>{q.question}</div>
                                                    <div className={`flex flex-col gap-2 ${isMobileDevice ? 'text-base' : 'text-sm'}`}>
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
                                                        <div className={`mt-3 ${isMobileDevice ? 'text-base' : 'text-sm'} text-slate-500 bg-white/50 p-2 rounded`}>
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

                        <div className={`${containerPadding} bg-slate-50 border-t border-slate-200 flex justify-center`}>
                            <button
                                onClick={handleExitFullScreen}
                                className={`${buttonSize} ${isMobileDevice ? 'w-full' : ''} bg-slate-900 text-white rounded-lg hover:bg-slate-800 ${animationClass} font-medium active:scale-95`}
                            >
                                Back to Courses
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Quiz Taking View
    return (
        <div className={`${isFullScreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-slate-50 overflow-y-auto ${animationClass}`}>
            {/* Exit Full-Screen Button */}
            {isFullScreen && (
                <button
                    onClick={handleExitFullScreen}
                    className={`fixed top-4 right-4 z-50 ${buttonSize} bg-white text-slate-700 rounded-xl hover:bg-slate-50 ${animationClass} ${shadowClass} flex items-center gap-2 font-semibold`}
                    aria-label="Exit and return to courses"
                >
                    <X size={isMobileDevice ? 24 : 20} />
                    <span className={isMobileDevice ? 'text-base' : 'text-sm'}>Exit</span>
                </button>
            )}

            <div className={`max-w-3xl mx-auto ${containerPadding} ${isMobileDevice ? 'pt-20' : 'py-10'}`}>
                {/* Header */}
                <div className={`flex ${isMobileDevice ? 'flex-col gap-3' : 'justify-between items-center'} mb-6`}>
                    <div>
                        <h1 className={`${isMobileDevice ? 'text-2xl' : 'text-xl'} font-bold text-slate-900`}>{quiz.title}</h1>
                        <p className={`${isMobileDevice ? 'text-base' : 'text-sm'} text-slate-500 max-w-md ${isMobileDevice ? '' : 'truncate'}`}>{quiz.description}</p>
                    </div>
                    {quiz.timeLimit && (
                        <div className={`flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full ${isMobileDevice ? 'text-base' : 'text-sm'} font-medium border border-amber-100`}>
                            <Clock size={16} />
                            {quiz.timeLimit} mins
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className={`w-full bg-slate-200 rounded-full ${isMobileDevice ? 'h-3' : 'h-2'} mb-8`}>
                    <div
                        className={`bg-blue-600 ${isMobileDevice ? 'h-3' : 'h-2'} rounded-full ${animationClass}`}
                        style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                    />
                </div>

                {/* Question Card */}
                <div className={`bg-white rounded-2xl ${shadowClass} border border-slate-200 overflow-hidden min-h-[400px] flex flex-col`}>
                    <div className={`${containerPadding} flex-1`}>
                        <div className="mb-6">
                            <span className={`inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full ${isMobileDevice ? 'text-sm' : 'text-xs'} font-bold mb-3`}>
                                Question {currentQuestionIndex + 1} of {quiz.questions.length}
                            </span>
                            <h2 className={`${isMobileDevice ? 'text-xl' : 'text-xl'} font-medium text-slate-900 leading-relaxed`}>
                                {currentQ.question}
                            </h2>
                        </div>

                        <div className={`${isMobileDevice ? 'space-y-3' : 'grid md:grid-cols-2 gap-3'}`}>
                            {(currentQ.options as unknown as string[]).map((option, idx) => {
                                const letter = String.fromCharCode(65 + idx);
                                const isSelected = answers[currentQ.id] === option;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(option)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handleOptionSelect(option);
                                            }
                                        }}
                                        tabIndex={0}
                                        role="radio"
                                        aria-checked={isSelected}
                                        className={`
                                            w-full group flex items-center
                                            ${isMobileDevice ? 'min-h-[64px] gap-4 p-4' : 'min-h-[64px] gap-4 px-4 py-4'}
                                            rounded-xl border-2 ${animationClass}
                                            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                                            ${isSelected
                                                ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
                                                : `border-slate-200 bg-white ${isTouch ? 'active:border-blue-300 active:bg-slate-50' : 'hover:border-blue-300 hover:bg-slate-50/80'} hover:shadow-sm`
                                            }
                                        `}
                                    >
                                        {/* Fixed-size Label Circle */}
                                        <div
                                            className={`
                                                w-10 h-10
                                                rounded-full
                                                flex items-center justify-center
                                                font-bold text-sm
                                                flex-shrink-0
                                                ${animationClass}
                                                ${isSelected
                                                    ? 'bg-blue-500 text-white border-2 border-blue-500 shadow-sm'
                                                    : `bg-slate-100 text-slate-600 border-2 border-slate-200 ${isTouch ? 'group-active:bg-blue-100 group-active:border-blue-400 group-active:text-blue-700' : 'group-hover:bg-blue-50 group-hover:border-blue-300 group-hover:text-blue-600'}`
                                                }
                                            `}
                                        >
                                            {letter}
                                        </div>

                                        {/* Answer Text - Aligned and Consistent */}
                                        <span
                                            className={`
                                                flex-1 
                                                text-sm
                                                leading-relaxed
                                                ${animationClass}
                                                ${isSelected
                                                    ? 'text-slate-900 font-semibold'
                                                    : `text-slate-700 ${isTouch ? 'group-active:text-slate-900' : 'group-hover:text-slate-900'}`
                                                }
                                            `}
                                        >
                                            {option}
                                        </span>

                                        {/* Selected Indicator */}
                                        {isSelected && (
                                            <CheckCircle2
                                                size={20}
                                                className="text-blue-500 flex-shrink-0"
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className={`${containerPadding} bg-slate-50 border-t border-slate-200 flex ${isMobileDevice ? 'flex-col gap-3' : 'justify-between items-center'}`}>
                        <button
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                            className={`${buttonSize} ${isMobileDevice ? 'w-full order-2' : ''} text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500 font-medium ${animationClass} active:scale-95`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={!answers[currentQ.id]}
                            className={`${buttonSize} ${isMobileDevice ? 'w-full order-1' : ''} bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ${animationClass} font-medium flex items-center ${isMobileDevice ? 'justify-center' : ''} gap-2 active:scale-95`}
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
