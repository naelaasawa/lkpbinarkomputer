"use client";

import Link from "next/link";
import { Plus, User, Star, FileQuestion, ArrowRight, BookOpen, Shield, TrendingUp, Users } from "lucide-react";

interface DashboardWidgetProps {
    title: string;
    icon: any;
    href?: string;
    children: React.ReactNode;
}

const WidgetContainer = ({ title, icon: Icon, href, children }: DashboardWidgetProps) => {
    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[420px]">
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
                <div className="h-full flex items-center justify-center p-8 text-center text-slate-500 text-sm">No users found.</div>
            </WidgetContainer>
        );
    }
    return (
        <WidgetContainer title="Recent Users" icon={User} href="/admin/users">
            <div className="divide-y divide-slate-50">
                {users.slice(0, 4).map((user) => (
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
                <div className="h-full flex items-center justify-center p-8 text-center text-slate-500 text-sm">No admins found.</div>
            </WidgetContainer>
        );
    }
    return (
        <WidgetContainer title="High Command" icon={Shield}>
            <div className="divide-y divide-slate-50">
                {admins.slice(0, 4).map((admin) => (
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
                <div className="h-full flex items-center justify-center p-8 text-center text-slate-500 text-sm">No reviews yet.</div>
            </WidgetContainer>
        );
    }

    return (
        <WidgetContainer title="Recent Reviews" icon={Star} href="/admin/reviews">
            <div className="divide-y divide-slate-50">
                {reviews.slice(0, 4).map((review) => (
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
                <div className="h-full flex items-center justify-center p-8 text-center text-slate-500 text-sm">No quizzes found.</div>
            </WidgetContainer>
        );
    }

    return (
        <WidgetContainer title="Recent Quizzes" icon={FileQuestion} href="/admin/quizzes">
            <div className="divide-y divide-slate-50">
                {quizzes.slice(0, 4).map((quiz) => (
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

export const RecentEnrollmentsWidget = ({ enrollments }: { enrollments: any[] }) => {
    if (!enrollments || enrollments.length === 0) {
        return (
            <WidgetContainer title="Recent Enrollments" icon={BookOpen} href="/admin/enrollments">
                <div className="h-full flex items-center justify-center p-8 text-center text-slate-500 text-sm">No enrollments yet.</div>
            </WidgetContainer>
        );
    }
    return (
        <WidgetContainer title="Recent Enrollments" icon={BookOpen} href="/admin/enrollments">
            <div className="divide-y divide-slate-50">
                {enrollments.slice(0, 4).map((enrollment) => (
                    <div key={enrollment.id} className="p-4 hover:bg-slate-50 transition">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-900 truncate max-w-[150px]">
                                {enrollment.course?.title}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                                Rp {Number(enrollment.course?.price || 0).toLocaleString()}
                            </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                            <span className="truncate">{enrollment.user?.email}</span>
                            <span>{new Date(enrollment.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </WidgetContainer>
    );
};

export const TopCoursesWidget = ({ courses }: { courses: any[] }) => {
    if (!courses || courses.length === 0) {
        return (
            <WidgetContainer title="Top Courses" icon={TrendingUp} href="/admin/top-courses">
                <div className="h-full flex items-center justify-center p-8 text-center text-slate-500 text-sm">No courses data available.</div>
            </WidgetContainer>
        );
    }
    return (
        <WidgetContainer title="Top Performing Courses" icon={TrendingUp} href="/admin/top-courses">
            <div className="divide-y divide-slate-50">
                {courses.slice(0, 4).map((course, index) => (
                    <div key={course.id} className="p-4 hover:bg-slate-50 transition flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-sm shrink-0 ${index === 0 ? 'bg-amber-100 text-amber-600' :
                            index === 1 ? 'bg-slate-100 text-slate-600' :
                                index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400'
                            }`}>
                            #{index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-slate-900 truncate">{course.title}</h4>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                <span className="flex items-center gap-1">
                                    <Users size={12} />
                                    {course._count?.enrollments || 0} Students
                                </span>
                                <span className="flex items-center gap-1">
                                    <Star size={12} />
                                    {course._count?.reviews || 0} Reviews
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                Rp {Number(course.price).toLocaleString('id-ID', { notation: 'compact' })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </WidgetContainer>
    );
};

export const RecentAssignmentsWidget = ({ assignments }: { assignments: any[] }) => {
    if (!assignments || assignments.length === 0) {
        return (
            <WidgetContainer title="Recent Assignments" icon={FileQuestion} href="/admin/assignments">
                <div className="h-full flex items-center justify-center p-8 text-center text-slate-500 text-sm">No assignments found.</div>
            </WidgetContainer>
        );
    }
    return (
        <WidgetContainer title="Recent Assignments" icon={FileQuestion} href="/admin/assignments">
            <div className="divide-y divide-slate-50">
                {assignments.slice(0, 4).map((assignment) => (
                    <div key={assignment.id} className="p-4 hover:bg-slate-50 transition">
                        <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium text-slate-900 truncate">{assignment.quiz?.title}</h4>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize border ${assignment.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                assignment.status === 'in_progress' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                    'bg-slate-50 text-slate-500 border-slate-100'
                                }`}>
                                {assignment.status.replace('_', ' ')}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                            <span className="truncate max-w-[120px]">{assignment.user?.email}</span>
                            <span>{assignment.score !== null ? `Score: ${assignment.score}` : 'Pending'}</span>
                        </div>
                    </div>
                ))}
            </div>
        </WidgetContainer>
    );
};

export const RecentActivityWidget = ({ activity }: { activity: any[] }) => {
    if (!activity || activity.length === 0) {
        return (
            <WidgetContainer title="Recent Activity" icon={TrendingUp} href="/admin/activity">
                <div className="h-full flex items-center justify-center p-8 text-center text-slate-500 text-sm">No activity recorded.</div>
            </WidgetContainer>
        );
    }
    return (
        <WidgetContainer title="Recent Activity" icon={TrendingUp} href="/admin/activity">
            <div className="divide-y divide-slate-50">
                {activity.slice(0, 4).map((item) => (
                    <div key={item.id} className="p-4 hover:bg-slate-50 transition">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-900 truncate max-w-[180px]">
                                {item.lesson?.title}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                                Completed
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mb-1">
                            {item.lesson?.module?.course?.title}
                        </p>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="truncate">{item.user?.email}</span>
                            <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </WidgetContainer>
    );
};
