"use client";

import Link from "next/link";
import { Plus, User, Star, FileQuestion, ArrowRight, BookOpen, Shield } from "lucide-react";

interface DashboardWidgetProps {
    title: string;
    icon: any;
    href?: string;
    children: React.ReactNode;
}

const WidgetContainer = ({ title, icon: Icon, href, children }: DashboardWidgetProps) => {
    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
            {/* added flex flex-col h-full to make it stretch if needed, though mostly for consistent look */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Icon size={18} />
                    </div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                </div>
                {href && (
                    <Link href={href} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                        View All <ArrowRight size={14} />
                    </Link>
                )}
            </div>
            <div className="p-0 flex-1">
                {children}
            </div>
        </div>
    );
};

export const CreateCourseCard = () => {
    return (
        <Link href="/admin/courses/create" className="group relative overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white shadow-lg transition hover:shadow-blue-200/50 flex flex-col justify-center h-full min-h-[150px]">
            <div className="relative z-10 w-full">
                <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-white/20 p-3 backdrop-blur-sm group-hover:bg-white/30 transition">
                    <Plus size={24} className="text-white" />
                </div>
                <h3 className="mb-1 text-lg font-bold">Create New Course</h3>
                <p className="text-blue-100 text-sm">Add a new course to your catalogue and start enrolling students.</p>
            </div>

            {/* Decorative circles */}
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl transition group-hover:bg-white/20"></div>
            <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-white/10 blur-3xl transition group-hover:bg-blue-500/20"></div>
        </Link>
    );
};

export const RecentUsersWidget = ({ users }: { users: any[] }) => {
    if (!users || users.length === 0) {
        return (
            <WidgetContainer title="Recent Users" icon={User} href="/admin/users">
                <div className="p-8 text-center text-slate-500 text-sm">No users found.</div>
            </WidgetContainer>
        );
    }
    return (
        <WidgetContainer title="Recent Users" icon={User} href="/admin/users">
            <div className="divide-y divide-slate-50">
                {users.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-4 hover:bg-slate-50 transition">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 shrink-0">
                            <User size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">{user.email}</p>
                            <p className="truncate text-xs text-slate-500">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                ))}
            </div>
        </WidgetContainer>
    );
};

export const AdminListWidget = ({ admins }: { admins: any[] }) => {
    if (!admins || admins.length === 0) {
        return (
            <WidgetContainer title="High Command" icon={Shield}>
                <div className="p-8 text-center text-slate-500 text-sm">No admins found.</div>
            </WidgetContainer>
        );
    }
    return (
        <WidgetContainer title="High Command" icon={Shield}>
            <div className="divide-y divide-slate-50">
                {admins.slice(0, 5).map((admin) => (
                    <div key={admin.id} className="flex items-center gap-3 p-4 hover:bg-slate-50 transition">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 shrink-0">
                            <Shield size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">{admin.email}</p>
                            <p className="truncate text-xs text-slate-500">Administrator</p>
                        </div>
                    </div>
                ))}
            </div>
        </WidgetContainer>
    );
};

export const RecentReviewsWidget = ({ reviews }: { reviews: any[] }) => {
    if (!reviews || reviews.length === 0) {
        return (
            <WidgetContainer title="Recent Reviews" icon={Star} href="/admin/reviews">
                <div className="p-8 text-center text-slate-500 text-sm">No reviews yet.</div>
            </WidgetContainer>
        );
    }

    return (
        <WidgetContainer title="Recent Reviews" icon={Star} href="/admin/reviews">
            <div className="divide-y divide-slate-50">
                {reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="p-4 hover:bg-slate-50 transition">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-900 truncate max-w-[150px]">{review.course?.title}</span>
                            <div className="flex items-center gap-0.5 text-amber-500">
                                <Star size={10} fill="currentColor" />
                                <span className="text-xs font-bold">{review.rating}</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 italic">"{review.comment}"</p>
                        <div className="mt-2 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">{review.user?.email}</span>
                            <span className="text-[10px] text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </WidgetContainer>
    );
};

export const RecentQuizzesWidget = ({ quizzes }: { quizzes: any[] }) => {
    if (!quizzes || quizzes.length === 0) {
        return (
            <WidgetContainer title="Recent Quizzes" icon={FileQuestion} href="/admin/quizzes">
                <div className="p-8 text-center text-slate-500 text-sm">No quizzes found.</div>
            </WidgetContainer>
        );
    }

    return (
        <WidgetContainer title="Recent Quizzes" icon={FileQuestion} href="/admin/quizzes">
            <div className="divide-y divide-slate-50">
                {quizzes.map((quiz) => (
                    <div key={quiz.id} className="p-4 hover:bg-slate-50 transition">
                        <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium text-slate-900 truncate">{quiz.title}</h4>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize border ${quiz.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                                }`}>
                                {quiz.status}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                            <span>{quiz.type}</span>
                            <span>{quiz._count?.assignments || 0} Assignments</span>
                        </div>
                    </div>
                ))}
            </div>
        </WidgetContainer>
    );
};
