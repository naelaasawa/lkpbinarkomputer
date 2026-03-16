"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, ChevronRight, RotateCcw, Trophy, Target, AlertCircle, X, ChevronLeft } from "lucide-react";
import { getDeviceType, isLowEndDevice, isTouchDevice } from "@/lib/utils/platformDetection";
import toast from "react-hot-toast";

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
    isFinalQuiz: boolean;
    questions: Question[];
}

interface QuizPlayerProps {
    quizId: string;
    courseId?: string; // Optional: if provided, exit will go to course player
    onComplete?: (quizId: string, isFinalQuiz: boolean, score: number) => void;
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

    // Quiz attempt and review mode state
    const [quizAttempt, setQuizAttempt] = useState<any>(null);
    const [isLoadingAttempt, setIsLoadingAttempt] = useState(true);
    const [isReviewMode, setIsReviewMode] = useState(false);
    const [isLocked, setIsLocked] = useState(false); // ONE-TRY: Lock state

    // Detect device type and capabilities on mount
    useEffect(() => {
        setDeviceType(getDeviceType());
        setIsTouch(isTouchDevice());
        setIsLowEnd(isLowEndDevice());
    }, []);



    // Load quiz
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

    // Load quiz attempt
    useEffect(() => {
        if (!quiz) return;

        const fetchAttempt = async () => {
            try {
                console.log('[QuizPlayer] Fetching attempt for quiz:', quizId);
                const res = await fetch(`/api/quizzes/${quizId}/attempt`);
                console.log('[QuizPlayer] Attempt response status:', res.status);

                if (res.ok) {
                    const attempt = await res.json();
                    console.log('[QuizPlayer] Attempt data:', attempt);
                    setQuizAttempt(attempt);

                    if (attempt && (attempt.status === 'completed' || attempt.isLocked)) {
                        console.log('[QuizPlayer] 🔒 Quiz is LOCKED - showing results immediately');
                        // Lock the quiz - show results immediately
                        setIsLocked(true);
                        setSelectedAnswers(attempt.answers);
                        setSubmittedAnswers(attempt.answers);
                        setShowResults(true); // Show results, not quiz questions
                        setIsReviewMode(false); // Don't enter review mode yet
                    } else {
                        console.log('[QuizPlayer] Quiz available for attempt');
                    }
                }
            } catch (error) {
                console.error("Failed to load quiz attempt", error);
            } finally {
                setIsLoadingAttempt(false);
            }
        };

        fetchAttempt();
    }, [quiz, quizId]);

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

    if (loading || isLoadingAttempt) {
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
        // Block if quiz is completed or locked (ONE-TRY ENFORCEMENT)
        if (isReviewMode || isLocked || quizAttempt?.isLocked) {
            toast("Quiz already completed - answers are locked", {
                icon: '🔒',
            });
            return;
        }

        setSelectedAnswers({
            ...selectedAnswers,
            [currentQuestionIndex]: answer,
        });
    };

    const handleNext = () => {
        if (!selectedAnswers[currentQuestionIndex]) {
            return;
        }

        setIsTransitioning(true);
        setSubmittedAnswers({
            ...submittedAnswers,
            [currentQuestionIndex]: selectedAnswers[currentQuestionIndex],
        });

        setTimeout(() => {
            if (isLastQuestion) {
                // VALIDATE ALL QUESTIONS BEFORE  SUBMISSION
                const allAnswers = { ...submittedAnswers, ...selectedAnswers };
                const allAnswered = quiz.questions.every((_, idx) => allAnswers[idx]);

                if (!allAnswered) {
                    toast.error("Please answer all questions before submitting!");
                    setIsTransitioning(false);
                    return;
                }

                calculateResults();
            } else {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            }
            setIsTransitioning(false);
        }, 300);
    };

    const calculateResults = async () => {
        setShowResults(true);

        // Save to backend
        try {
            const allAnswers = { ...submittedAnswers, ...selectedAnswers };
            console.log('[QuizPlayer] Submitting quiz with answers:', allAnswers);

            const response = await fetch(`/api/quizzes/${quizId}/attempt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: allAnswers })
            });

            console.log('[QuizPlayer] Response status:', response.status);
            console.log('[QuizPlayer] Response headers:', Object.fromEntries(response.headers.entries()));

            // Handle non-JSON responses (like "Internal Error")
            let data;
            const contentType = response.headers.get('content-type');
            console.log('[QuizPlayer] Content-Type:', contentType);

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
                console.log('[QuizPlayer] JSON response data:', data);
            } else {
                // Handle text responses
                const text = await response.text();
                console.log('[QuizPlayer] Text response:', text);
                data = { error: text };
            }

            if (response.status === 403) {
                // Quiz is locked - already completed
                console.log('[QuizPlayer] Quiz is locked (403)');
                toast("Quiz already completed - one try only", {
                    icon: '🔒',
                });
                setIsLocked(true);
                return;
            }

            if (response.ok) {
                // Mark as locked locally
                setIsLocked(true);
                console.log('[QuizPlayer] Quiz submitted successfully:', data);

                // Show success notification ONLY for final quiz
                if (quiz.isFinalQuiz) {
                    toast.success("Lesson Complete");
                }

                // Trigger onComplete callback for lesson completion
                if (onComplete) {
                    const score = getScore();
                    console.log('[QuizPlayer] Calling onComplete with score:', score);
                    onComplete(quizId, quiz.isFinalQuiz || false, score);
                }
            } else {
                console.error('[QuizPlayer] Quiz submission failed:', data);
                toast.error(data.error || "Failed to submit quiz");
            }
        } catch (error) {
            console.error("Failed to save quiz attempt", error);
            toast.error("Failed to submit quiz. Please try again.");
        }
    };

    const getCorrectCount = () => {
        let correct = 0;
        quiz.questions.forEach((q, idx) => {
            if (submittedAnswers[idx] === q.correctAnswer || selectedAnswers[idx] === q.correctAnswer) {
                correct++;
            }
        });
        return correct;
    };

    const getScore = () => {
        const correct = getCorrectCount();
        const total = quiz.questions.length;
        return Math.round((correct / total) * 100);
    };

    // Retake removed - one attempt only

    const handleEnterReviewMode = () => {
        setIsReviewMode(true);
        setIsLocked(true); // Ensure locked state in review mode
        setShowResults(false);
        setCurrentQuestionIndex(0);
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

    if (showResults && !isReviewMode) {
        const totalScore = getScore();
        const correctCount = getCorrectCount();
        const totalQuestions = quiz.questions.length;
        const passed = totalScore >= quiz.passingScore;

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
                    {quizAttempt && (quizAttempt.status === 'completed' || quizAttempt.isLocked) && (
                        <div className="mb-6 px-4 py-3 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">🔒</span>
                                <div>
                                    <p className="font-bold text-blue-900">Quiz Locked - One Try Only</p>
                                    <p className="text-sm text-blue-700">Hasil quiz Anda yang sebelumnya. Quiz tidak dapat diulang.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="text-center mb-8">
                        <div className={`w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center ${passed ? 'bg-emerald-100' : 'bg-orange-100'}`}>
                            {passed ? (
                                <Trophy size={64} className="text-emerald-600" />
                            ) : (
                                <Target size={64} className="text-orange-600" />
                            )}
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold mb-4">
                            {passed ? '🎉 Congratulations!' : '📊 Quiz Complete'}
                        </h1>

                        <p className="text-slate-600 text-lg mb-6">
                            {passed
                                ? 'You\'ve successfully passed the quiz!'
                                : 'Keep practicing to improve your score!'}
                        </p>

                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                            <p className="text-slate-600 text-sm mb-2">Your Score</p>
                            <p className="text-5xl font-bold text-slate-800 mb-1">{totalScore}%</p>
                            <p className="text-slate-500 text-sm">
                                {correctCount} out of {totalQuestions} correct
                            </p>
                        </div>

                        {quizAttempt && quizAttempt.status === 'completed' && (
                            <button
                                onClick={handleEnterReviewMode}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                            >
                                <CheckCircle size={20} />
                                Review Answers
                            </button>
                        )}

                        {(!quizAttempt || quizAttempt.status !== 'completed') && (
                            <p className="text-slate-500 text-sm italic">
                                Quiz completed. You can return to the course.
                            </p>
                        )}
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
                        <div className="flex-1 flex items-center gap-3">
                            <h1 className={`${isMobileDevice ? 'text-2xl' : 'text-2xl md:text-3xl'} font-bold text-slate-900 mb-1`}>{quiz.title}</h1>
                            {isReviewMode && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex-shrink-0">
                                    Review Mode
                                </span>
                            )}
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
                    {/* Review Mode Warning Banner */}
                    {(isReviewMode || isLocked) && (
                        <div className="mb-4 px-5 py-4 bg-amber-50 border-2 border-amber-300 rounded-xl">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">🔒</span>
                                <div>
                                    <p className="font-bold text-amber-900 mb-1">Mode Review - Read Only</p>
                                    <p className="text-sm text-amber-700">Quiz sudah selesai dan terkunci. Anda tidak dapat mengubah jawaban.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={`bg-white rounded-2xl ${shadowClass} border border-slate-100 ${containerPadding} min-h-[600px]`}>
                        <h2 className={`${isMobileDevice ? 'text-xl' : 'text-xl md:text-2xl'} font-bold text-slate-900 mb-8 leading-relaxed`}>
                            {currentQuestion.question}
                        </h2>

                        {/* Answer Options - 2 Column Grid Layout */}
                        <div className={`${isMobileDevice ? 'space-y-3' : 'grid md:grid-cols-2 gap-3'} mb-8`}>
                            {currentQuestion.options && currentQuestion.options.map((option, idx) => {
                                const letter = String.fromCharCode(65 + idx);
                                const isSelected = selectedAnswer === option;
                                const isSubmitted = submittedAnswers[currentQuestionIndex] === option;

                                // Review mode indicators
                                const isCorrectAnswer = isReviewMode && option === currentQuestion.correctAnswer;
                                const isWrongAnswer = isReviewMode && isSubmitted && option !== currentQuestion.correctAnswer;

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelectAnswer(option)}
                                        disabled={isReviewMode || isLocked}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                if (!isReviewMode && !isLocked) {
                                                    handleSelectAnswer(option);
                                                }
                                            }
                                        }}
                                        tabIndex={isReviewMode || isLocked ? -1 : 0}
                                        role="radio"
                                        aria-checked={isSelected}
                                        className={`
                                            w-full group flex items-center
                                            ${isMobileDevice ? 'min-h-[64px] gap-4 p-4' : 'min-h-[64px] gap-4 px-4 py-4'}
                                            rounded-xl border-2 ${animationClass}
                                            ${(isReviewMode || isLocked) ? 'cursor-not-allowed pointer-events-none' : 'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2'}
                                            ${isReviewMode && isCorrectAnswer
                                                ? 'border-emerald-500 bg-emerald-50 shadow-md'
                                                : isReviewMode && isWrongAnswer
                                                    ? 'border-red-500 bg-red-50 shadow-md'
                                                    : isSelected
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
                                        {isSelected && !isReviewMode && (
                                            <CheckCircle
                                                size={20}
                                                className={`text-blue-500 flex-shrink-0 ${isLowEnd ? '' : 'animate-[scaleIn_0.2s_ease-out]'}`}
                                            />
                                        )}

                                        {/* Review mode indicators */}
                                        {isReviewMode && isCorrectAnswer && (
                                            <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
                                        )}
                                        {isReviewMode && isWrongAnswer && (
                                            <XCircle size={20} className="text-red-600 flex-shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Navigation with Helper Text */}
                        <div className={`flex ${isMobileDevice ? 'flex-col gap-4' : 'items-center justify-between'} pt-6 border-t border-slate-100`}>
                            {isReviewMode ? (
                                <>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle size={isMobileDevice ? 20 : 18} className="text-emerald-500" />
                                        <p className={`${isMobileDevice ? 'text-base' : 'text-sm'} text-slate-600 font-medium`}>
                                            You've completed this quiz
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                                            disabled={currentQuestionIndex === 0}
                                            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                                        >
                                            <ChevronLeft size={16} />
                                            <span className={isMobileDevice ? '' : 'hidden md:inline'}>Previous</span>
                                        </button>
                                        <button
                                            onClick={() => setCurrentQuestionIndex(Math.min(totalQuestions - 1, currentQuestionIndex + 1))}
                                            disabled={currentQuestionIndex === totalQuestions - 1}
                                            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                                        >
                                            <span className={isMobileDevice ? '' : 'hidden md:inline'}>Next</span>
                                            <ChevronRight size={16} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowResults(true);
                                                setIsReviewMode(false);
                                            }}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                                        >
                                            Back to Results
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
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
                                        disabled={!selectedAnswer || isLocked}
                                        className={`inline-flex items-center justify-center gap-2 ${buttonSize} rounded-xl font-bold ${isMobileDevice ? 'text-lg w-full' : 'text-base'} ${animationClass}
                                    ${selectedAnswer && !isLocked
                                                ? `bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 ${shadowClass} shadow-blue-500/30 hover:shadow-blue-500/40 ${isLowEnd ? '' : 'hover:scale-105'} active:scale-95`
                                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {isLocked ? '🔒 Locked' : (isLastQuestion ? "Submit Quiz" : "Next Question")}
                                        {!isLocked && <ChevronRight size={isMobileDevice ? 24 : 20} className={selectedAnswer && !isLowEnd ? 'animate-[bounceX_1s_infinite]' : ''} />}
                                    </button>
                                </>
                            )}
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
