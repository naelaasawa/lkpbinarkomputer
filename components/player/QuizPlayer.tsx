"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, ChevronRight, RotateCcw, Trophy, Target, AlertCircle, X } from "lucide-react";
import { getDeviceType, isLowEndDevice, isTouchDevice } from "@/lib/utils/platformDetection";

interface Question {
    id: string;
    type: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
    order: number;
}

interface Quiz {
    id: string;
    title: string;
    description?: string;
    passingScore: number;
    questions: Question[];
}

interface QuizPlayerProps {
    quizId: string;
    courseId?: string; // Optional: if provided, exit will go to course player
    onComplete?: () => void;
}

export default function QuizPlayer({ quizId, courseId, onComplete }: QuizPlayerProps) {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
    const [showResults, setShowResults] = useState(false);
    const [submittedAnswers, setSubmittedAnswers] = useState<{ [key: number]: string }>({});
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
    const [isTouch, setIsTouch] = useState(false);
    const [isLowEnd, setIsLowEnd] = useState(false);

    // Detect device type and capabilities on mount
    useEffect(() => {
        setDeviceType(getDeviceType());
        setIsTouch(isTouchDevice());
        setIsLowEnd(isLowEndDevice());
    }, []);



    useEffect(() => {
        console.log('QuizPlayer mounted, quiz ID:', quizId);
        const fetchQuiz = async () => {
            try {
                console.log('Fetching quiz from:', `/api/quizzes/${quizId}`);
                const res = await fetch(`/api/quizzes/${quizId}`);
                console.log('Quiz fetch response status:', res.status);
                if (res.ok) {
                    const data = await res.json();
                    console.log('Quiz data fetched successfully:', data);
                    console.log('Number of questions:', data.questions?.length || 0);
                    setQuiz(data);
                } else {
                    const errorText = await res.text();
                    console.error('Failed to fetch quiz!');
                    console.error('Status:', res.status);
                    console.error('Error:', errorText);
                    console.error('Quiz ID that failed:', quizId);
                }
            } catch (error) {
                console.error("Failed to fetch quiz - Exception:", error);
                console.error('Quiz ID:', quizId);
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [quizId]);

    const handleExitFullScreen = () => {
        setIsFullScreen(false);
        // Re-enable body scroll
        document.body.style.overflow = '';

        // If courseId is provided, navigate to course player
        // Otherwise, just close full-screen (for embedded quiz in course player)
        if (courseId && typeof window !== 'undefined') {
            window.location.href = `/courses/${courseId}`;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full bg-white">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Loading quiz...</p>
                </div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="flex items-center justify-center h-full bg-white">
                <div className="text-center">
                    <XCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Quiz not found</p>
                    <p className="text-xs text-slate-400 mt-2">Quiz ID: {quizId}</p>
                </div>
            </div>
        );
    }

    if (!quiz.questions || quiz.questions.length === 0) {
        return (
            <div className="flex items-center justify-center h-full bg-white">
                <div className="text-center max-w-md px-6">
                    <AlertCircle size={56} className="text-orange-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Quiz Has No Questions</h3>
                    <p className="text-slate-600 text-sm mb-6">
                        This quiz doesn't have any questions yet. Please add questions in the Quiz Manager.
                    </p>
                    <a
                        href={`/admin/quizzes`}
                        target="_blank"
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-semibold shadow-lg shadow-blue-500/30"
                    >
                        Go to Quiz Manager
                    </a>
                </div>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const totalQuestions = quiz.questions.length;
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

    const handleSelectAnswer = (answer: string) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [currentQuestionIndex]: answer,
        });
    };

    const handleNext = () => {
        if (selectedAnswers[currentQuestionIndex]) {
            setIsTransitioning(true);
            setSubmittedAnswers({
                ...submittedAnswers,
                [currentQuestionIndex]: selectedAnswers[currentQuestionIndex],
            });

            setTimeout(() => {
                if (isLastQuestion) {
                    calculateResults();
                } else {
                    setCurrentQuestionIndex(currentQuestionIndex + 1);
                }
                setIsTransitioning(false);
            }, 300);
        }
    };

    const calculateResults = () => {
        setShowResults(true);
        if (onComplete) {
            onComplete();
        }
    };

    const getScore = () => {
        let correct = 0;
        quiz.questions.forEach((q, idx) => {
            if (submittedAnswers[idx] === q.correctAnswer || selectedAnswers[idx] === q.correctAnswer) {
                correct++;
            }
        });
        return correct;
    };

    const handleRetake = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setSubmittedAnswers({});
        setShowResults(false);
    };

    // Platform-specific classes
    const isMobileDevice = deviceType === 'mobile' || deviceType === 'tablet';
    const containerPadding = isMobileDevice ? 'p-4' : 'p-8 md:p-12';
    const maxWidth = isMobileDevice ? 'max-w-full' : 'max-w-4xl';
    const fontSize = isMobileDevice ? 'text-lg' : 'text-base md:text-lg';
    const buttonSize = isMobileDevice ? 'min-h-[48px] px-6 py-4' : 'px-8 py-4';
    const optionSize = isMobileDevice ? 'min-h-[56px] p-5' : 'p-5';

    // Reduce animations on low-end devices
    const animationClass = isLowEnd ? '' : 'transition-all duration-300';
    const shadowClass = isLowEnd ? 'shadow-md' : 'shadow-xl';

    if (showResults) {
        const score = getScore();
        const percentage = Math.round((score / totalQuestions) * 100);
        const passed = percentage >= quiz.passingScore;

        return (
            <div className={`h-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-y-auto ${animationClass}`}>

                <div className={`${maxWidth} mx-auto ${containerPadding} ${isMobileDevice ? 'pt-20' : 'pt-8'}`}>
                    <div className={`bg-white rounded-3xl ${shadowClass} ${containerPadding} text-center border border-slate-100 ${animationClass}`}>
                        <div className={`${isMobileDevice ? 'w-32 h-32' : 'w-28 h-28'} mx-auto mb-6 rounded-full flex items-center justify-center ${shadowClass} ${passed ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : 'bg-gradient-to-br from-red-400 to-red-600'}`}>
                            {passed ? (
                                <Trophy size={isMobileDevice ? 64 : 56} className="text-white" />
                            ) : (
                                <Target size={isMobileDevice ? 64 : 56} className="text-white" />
                            )}
                        </div>

                        <h2 className={`${isMobileDevice ? 'text-3xl' : 'text-4xl'} font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3`}>
                            {passed ? "Congratulations! 🎉" : "Keep Trying!"}
                        </h2>
                        <p className={`text-slate-600 ${isMobileDevice ? 'text-base' : 'text-lg'} mb-10`}>
                            {passed ? "You passed the quiz!" : "You didn't pass this time, but don't give up!"}
                        </p>

                        <div className={`grid ${isMobileDevice ? 'grid-cols-1 gap-3' : 'grid-cols-3 gap-4'} mb-10`}>
                            <div className={`${containerPadding} bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200`}>
                                <p className="text-sm font-medium text-slate-500 mb-2">Score</p>
                                <p className={`${isMobileDevice ? 'text-5xl' : 'text-4xl'} font-bold text-slate-900`}>{percentage}%</p>
                            </div>
                            <div className={`${containerPadding} bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200`}>
                                <p className="text-sm font-medium text-emerald-600 mb-2">Correct</p>
                                <p className={`${isMobileDevice ? 'text-5xl' : 'text-4xl'} font-bold text-emerald-700`}>{score}</p>
                            </div>
                            <div className={`${containerPadding} bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200`}>
                                <p className="text-sm font-medium text-blue-600 mb-2">Total</p>
                                <p className={`${isMobileDevice ? 'text-5xl' : 'text-4xl'} font-bold text-blue-700`}>{totalQuestions}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleRetake}
                            className={`inline-flex items-center justify-center gap-3 ${buttonSize} bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold ${isMobileDevice ? 'text-lg w-full' : 'text-lg'} hover:from-blue-700 hover:to-blue-800 ${animationClass} ${shadowClass} shadow-blue-500/30 hover:shadow-blue-500/40 ${isLowEnd ? '' : 'hover:scale-105'} active:scale-95`}
                        >
                            <RotateCcw size={isMobileDevice ? 28 : 24} />
                            Retake Quiz
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const selectedAnswer = selectedAnswers[currentQuestionIndex];
    const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    return (
        <div className={`h-full bg-gradient-to-br from-slate-50 via-white to-blue-50/20 overflow-y-auto ${animationClass}`}>

            <div className={`${maxWidth} mx-auto ${containerPadding} ${isMobileDevice ? 'pt-20' : 'pt-8'}`}>
                {/* Header Card */}
                <div className={`bg-white rounded-2xl ${shadowClass} border border-slate-100 ${containerPadding} mb-6 ${animationClass}`}>
                    <div className={`flex ${isMobileDevice ? 'flex-col gap-4' : 'items-center justify-between'} mb-6`}>
                        <div className="flex-1">
                            <h1 className={`${isMobileDevice ? 'text-2xl' : 'text-2xl md:text-3xl'} font-bold text-slate-900 mb-1`}>{quiz.title}</h1>
                            {quiz.description && (
                                <p className={`text-slate-600 ${isMobileDevice ? 'text-base' : 'text-sm'}`}>{quiz.description}</p>
                            )}
                        </div>
                        <div className={`${isMobileDevice ? 'text-left' : 'text-right ml-6'}`}>
                            <p className="text-sm font-medium text-slate-500 mb-1">Question</p>
                            <p className={`${isMobileDevice ? 'text-4xl' : 'text-3xl'} font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                                {currentQuestionIndex + 1}/{totalQuestions}
                            </p>
                        </div>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="relative">
                        <div className={`w-full ${isMobileDevice ? 'h-4' : 'h-3'} bg-slate-100 rounded-full overflow-hidden`}>
                            <div
                                className={`h-full bg-gradient-to-r from-blue-500 to-purple-500 ${animationClass} ease-out rounded-full`}
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        <p className={`${isMobileDevice ? 'text-sm' : 'text-xs'} text-slate-500 mt-2 text-right font-medium`}>{Math.round(progressPercentage)}% Complete</p>
                    </div>
                </div>

                {/* Question Card with Fade Animation */}
                <div className={`${animationClass} ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                    <div className={`bg-white rounded-2xl ${shadowClass} border border-slate-100 ${containerPadding} min-h-[600px]`}>
                        <h2 className={`${isMobileDevice ? 'text-xl' : 'text-xl md:text-2xl'} font-bold text-slate-900 mb-8 leading-relaxed`}>
                            {currentQuestion.question}
                        </h2>

                        {/* Answer Options - 2 Column Grid Layout */}
                        <div className={`${isMobileDevice ? 'space-y-3' : 'grid md:grid-cols-2 gap-3'} mb-8`}>
                            {currentQuestion.options && currentQuestion.options.map((option, idx) => {
                                const letter = String.fromCharCode(65 + idx);
                                const isSelected = selectedAnswer === option;

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelectAnswer(option)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handleSelectAnswer(option);
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
                                            <CheckCircle
                                                size={20}
                                                className={`text-blue-500 flex-shrink-0 ${isLowEnd ? '' : 'animate-[scaleIn_0.2s_ease-out]'}`}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Navigation with Helper Text */}
                        <div className={`flex ${isMobileDevice ? 'flex-col gap-4' : 'items-center justify-between'} pt-6 border-t border-slate-100`}>
                            <div className="flex items-center gap-2">
                                {!selectedAnswer ? (
                                    <>
                                        <AlertCircle size={isMobileDevice ? 20 : 18} className="text-slate-400" />
                                        <p className={`${isMobileDevice ? 'text-base' : 'text-sm'} text-slate-500 font-medium`}>Please select an answer</p>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={isMobileDevice ? 20 : 18} className="text-emerald-500" />
                                        <p className={`${isMobileDevice ? 'text-base' : 'text-sm'} text-emerald-600 font-medium`}>Answer selected</p>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={handleNext}
                                disabled={!selectedAnswer}
                                className={`inline-flex items-center justify-center gap-2 ${buttonSize} rounded-xl font-bold ${isMobileDevice ? 'text-lg w-full' : 'text-base'} ${animationClass}
                                    ${selectedAnswer
                                        ? `bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 ${shadowClass} shadow-blue-500/30 hover:shadow-blue-500/40 ${isLowEnd ? '' : 'hover:scale-105'} active:scale-95`
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                {isLastQuestion ? "Submit Quiz" : "Next Question"}
                                <ChevronRight size={isMobileDevice ? 24 : 20} className={selectedAnswer && !isLowEnd ? 'animate-[bounceX_1s_infinite]' : ''} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {!isLowEnd && (
                <style jsx>{`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes scaleIn {
                        from { transform: scale(0); }
                        to { transform: scale(1); }
                    }
                    @keyframes bounceX {
                        0%, 100% { transform: translateX(0); }
                        50% { transform: translateX(4px); }
                    }
                `}</style>
            )}
        </div>
    );
}
