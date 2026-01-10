
"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";

interface Review {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: {
        email: string;
    };
    course: {
        title: string;
    }
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch("/api/admin/reviews");
                if (res.ok) {
                    const data = await res.json();
                    setReviews(data);
                }
            } catch (error) {
                console.error("Failed to fetch reviews", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Course Reviews</h1>
                    <p className="text-slate-500">Monitor student feedback and ratings</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                    <Star size={18} className="text-yellow-400 fill-current" />
                    <span className="font-bold text-slate-700">
                        {reviews.length > 0
                            ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                            : "0.0"}
                    </span>
                    <span className="text-slate-400 text-sm">/ 5.0 Average</span>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-bold text-slate-700">Course</th>
                                <th className="px-6 py-4 font-bold text-slate-700">Student</th>
                                <th className="px-6 py-4 font-bold text-slate-700">Rating</th>
                                <th className="px-6 py-4 font-bold text-slate-700">Comment</th>
                                <th className="px-6 py-4 font-bold text-slate-700">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <tr key={review.id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 font-medium text-slate-900 max-w-xs truncate" title={review.course.title}>
                                            {review.course.title}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {review.user.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex text-yellow-400 gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={14}
                                                        fill={i < review.rating ? "currentColor" : "none"}
                                                        className={i >= review.rating ? "text-slate-200" : ""}
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 max-w-md">
                                            <p className="line-clamp-2" title={review.comment}>{review.comment}</p>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-8">
                                        <EmptyState
                                            icon={MessageSquare}
                                            title="No reviews yet"
                                            description="Student reviews will appear here once they are submitted."
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
