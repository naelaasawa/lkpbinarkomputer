"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, TrendingUp, CheckCircle, Clock, Activity, Zap, Users, BarChart3 } from "lucide-react";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie
} from 'recharts';

export default function ActivityPage() {
    const [activity, setActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const fetchActivity = async () => {
            setLoading(true);
            try {
                // Fetch all/large limit for meaningful charts
                const url = debouncedSearch
                    ? `/api/admin/progress?limit=100&query=${encodeURIComponent(debouncedSearch)}`
                    : `/api/admin/progress?limit=100`;

                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setActivity(data);
                }
            } catch (error) {
                console.error("Failed to fetch activity", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();
    }, [debouncedSearch]);

    // Data Processing for Charts & Widgets
    const stats = useMemo(() => {
        if (!activity.length) return null;

        const uniqueStudents = new Set(activity.map(a => a.user?.email)).size;
        const today = new Date().toDateString();
        const todayCount = activity.filter(a => new Date(a.updatedAt).toDateString() === today).length;

        // Group by course
        const courses: Record<string, number> = {};
        activity.forEach(a => {
            const course = a.lesson?.module?.course?.title || "Unknown";
            courses[course] = (courses[course] || 0) + 1;
        });
        const topCourseName = Object.keys(courses).reduce((a, b) => courses[a] > courses[b] ? a : b, "-");

        // Chart Data: Activity Trend (Last 7 days or just grouped by date from data)
        const dateMap: Record<string, number> = {};
        // Initialize last 7 days with 0? Or just use data.
        // Let's us data sorted by date.
        activity.forEach(a => {
            const date = new Date(a.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dateMap[date] = (dateMap[date] || 0) + 1;
        });
        const trendData = Object.keys(dateMap).map(date => ({ date, count: dateMap[date] })).reverse(); // reverse if API returns desc

        // Chart Data: Top 5 Courses
        const courseData = Object.keys(courses)
            .map(name => ({ name, value: courses[name] }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        return {
            uniqueStudents,
            todayCount,
            topCourseName,
            trendData,
            courseData,
            total: activity.length
        };
    }, [activity]);

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    if (loading && !activity.length) return <Loading />;

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Recent Activity</h1>
                    <p className="text-slate-500 mt-1">Track student progress and lesson completions.</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by student, lesson, or course..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>
            </div>

            {/* Stats Widgets */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider">
                            <Activity size={14} />
                            Total Activities
                        </div>
                        <div className="text-2xl font-bold text-slate-800">
                            {stats.total.toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider">
                            <Users size={14} />
                            Active Students
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                            {stats.uniqueStudents.toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider">
                            <Zap size={14} />
                            Today's Activity
                        </div>
                        <div className="text-2xl font-bold text-amber-500">
                            {stats.todayCount.toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider">
                            <TrendingUp size={14} />
                            Top Course
                        </div>
                        <div className="text-lg font-bold text-emerald-600 truncate" title={stats.topCourseName}>
                            {stats.topCourseName}
                        </div>
                    </div>
                </div>
            )}

            {/* Charts Section */}
            {stats && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Activity Trend Chart */}
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <BarChart3 size={18} className="text-slate-400" />
                            Activity Trend
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.trendData}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                                    />
                                    <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Course Distribution Chart */}
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Activity size={18} className="text-slate-400" />
                            Most Active Courses
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.courseData} layout="vertical" margin={{ left: 40, right: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" hide width={100} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ fill: '#f8fafc' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                        {stats.courseData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Legend/Labels for Bar Chart since YAxis is hidden or small */}
                        <div className="mt-4 space-y-2">
                            {stats.courseData.map((entry, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <span className="text-slate-600 truncate max-w-[200px]">{entry.name}</span>
                                    </div>
                                    <span className="font-semibold text-slate-800">{entry.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Table / List */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                {activity.length === 0 ? (
                    <div className="p-12">
                        <EmptyState
                            icon={TrendingUp}
                            title="No activity found"
                            description={searchQuery ? "Try adjusting your search query." : "No student activity recorded yet."}
                        />
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-slate-700">Lesson</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">Student</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">Course</th>
                                        <th className="px-6 py-4 font-semibold text-slate-700">Completed At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {activity.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                                                <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                                                {item.lesson?.title}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {item.user?.email}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {item.lesson?.module?.course?.title}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {new Date(item.updatedAt).toLocaleDateString()} {new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List (Cards) */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {activity.map((item) => (
                                <div key={item.id} className="p-4 space-y-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-medium text-slate-900 line-clamp-2">
                                            {item.lesson?.title}
                                        </h3>
                                        <span className="shrink-0 text-xs font-semibold bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full border border-emerald-100">
                                            Completed
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-500 line-clamp-1">
                                        in {item.lesson?.module?.course?.title}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                            <span className="truncate">{item.user?.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 pl-3.5">
                                            <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>{new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="text-center text-xs text-slate-400">
                Showing last {activity.length} activities
            </div>
        </div>
    );
}
