"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    HelpCircle,
    Users,
    Star,
    Database,
    Sparkles,
    LogOut,
    ChevronDown,
    ChevronRight,
    TrendingUp,
    FileQuestion
} from "lucide-react";
import { SignOutButton, useUser } from "@clerk/nextjs";

type NavItem = {
    href?: string;
    label: string;
    icon: any;
    subItems?: { href: string; label: string }[];
};

export const AdminSidebar = () => {
    const pathname = usePathname();
    const { user } = useUser();
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

    const navItems: NavItem[] = [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        {
            label: "Courses",
            icon: BookOpen,
            href: "/admin/courses", // Root match
            subItems: [
                { href: "/admin/courses", label: "All Courses" },
                { href: "/admin/courses/create", label: "Create Course" },
                { href: "/admin/top-courses", label: "Top Performing" },
                { href: "/admin/enrollments", label: "Enrollments" },
            ]
        },
        {
            label: "Quizzes",
            icon: HelpCircle, // or FileQuestion
            href: "/admin/quizzes",
            subItems: [
                { href: "/admin/quizzes", label: "All Quizzes" },
                { href: "/admin/assignments", label: "Assignments" },
            ]
        },
        { href: "/admin/users", label: "Users", icon: Users },
        { href: "/admin/activity", label: "Activity", icon: TrendingUp },
        { href: "/admin/reviews", label: "Reviews", icon: Star },
        { href: "/admin/backup", label: "Backup & Restore", icon: Database },
    ];

    // Auto-expand based on active path
    useEffect(() => {
        navItems.forEach(item => {
            if (item.subItems && item.subItems.some(sub => pathname === sub.href || pathname.startsWith(sub.href + "/"))) {
                setExpandedGroups(prev => prev.includes(item.label) ? prev : [...prev, item.label]);
            }
        });
    }, [pathname]);

    const toggleGroup = (label: string) => {
        setExpandedGroups(prev =>
            prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
        );
    };

    return (
        <aside
            className="hidden lg:flex sticky top-0 left-0 h-screen w-72 bg-white border-r border-slate-200 flex-col z-50 transition-all"
        >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                        <Sparkles size={20} fill="currentColor" />
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-900 tracking-tight leading-none">
                            Admin Panel
                        </h1>
                        <p className="text-[10px] text-blue-600 font-semibold tracking-wider mt-1 uppercase">
                            LKP Binar Komputer
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto no-scrollbar">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    // Check if *any* subitem is active or the item itself
                    const isGroupActive = item.subItems
                        ? item.subItems.some(sub => pathname === sub.href || pathname.startsWith(sub.href + "/"))
                        : pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href!));

                    const isExpanded = expandedGroups.includes(item.label);

                    if (item.subItems) {
                        return (
                            <div key={item.label} className="space-y-1">
                                <button
                                    onClick={() => toggleGroup(item.label)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${isGroupActive
                                            ? "bg-blue-50/50 text-blue-700 font-semibold"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon size={20} className={isGroupActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"} />
                                        <span className="text-sm">{item.label}</span>
                                    </div>
                                    {isExpanded ? (
                                        <ChevronDown size={16} className={isGroupActive ? "text-blue-500" : "text-slate-400"} />
                                    ) : (
                                        <ChevronRight size={16} className={isGroupActive ? "text-blue-500" : "text-slate-400"} />
                                    )}
                                </button>

                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                                    <div className="pl-4 pr-2 py-1 space-y-1 relative">
                                        {/* Line indicator for indent */}
                                        <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-100"></div>

                                        {item.subItems.map(sub => {
                                            const isSubActive = pathname === sub.href || pathname.startsWith(sub.href + "/");
                                            return (
                                                <Link
                                                    key={sub.href}
                                                    href={sub.href}
                                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all relative z-10 ${isSubActive
                                                            ? "bg-blue-50 text-blue-700 font-medium translate-x-1"
                                                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:translate-x-1"
                                                        }`}
                                                >
                                                    {/* Bullet for subitems */}
                                                    <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isSubActive ? "bg-blue-500" : "bg-slate-300 group-hover:bg-slate-400"}`}></div>
                                                    {sub.label}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href!}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${isGroupActive
                                ? "bg-blue-50 text-blue-600 font-semibold"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                        >
                            {isGroupActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                            )}
                            <Icon
                                size={20}
                                className={`transition-colors ${isGroupActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                                    }`}
                            />
                            <span className="text-sm">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-white border border-slate-100 shadow-sm">
                    <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden shrink-0">
                        <img
                            src={user?.imageUrl}
                            alt="User"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="overflow-hidden flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">
                            {user?.fullName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                            {user?.primaryEmailAddress?.emailAddress}
                        </p>
                    </div>
                </div>

                <SignOutButton>
                    <button className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-xl transition-all text-sm font-medium shadow-sm transition-all active:scale-[0.98]">
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </SignOutButton>
            </div>
        </aside>
    );
};
