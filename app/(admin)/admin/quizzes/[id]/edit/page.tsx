"use client";

import { useEffect, useState, use } from "react";
import QuizForm, { QuizData } from "@/components/admin/QuizForm";
import { useRouter } from "next/navigation";

export default function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [quiz, setQuiz] = useState<QuizData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await fetch(`/api/quizzes/${id}`);
                if (!res.ok) throw new Error("Failed to fetch quiz");
                const data = await res.json();
                setQuiz(data);
            } catch (error) {
                console.error(error);
                alert("Quiz not found");
                router.push("/admin/quizzes");
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [id, router]);

    if (loading) return <div className="p-10 text-center">Loading quiz data...</div>;
    if (!quiz) return <div className="p-10 text-center">Quiz not found</div>;

    return (
        <div className="p-6">
            <QuizForm initialData={quiz} isEditing={true} />
        </div>
    );
}
