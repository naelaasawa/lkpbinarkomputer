"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    HelpCircle,
    Users,
    Star,
    Settings,
    LogOut,
    Database,
    X,
    Sparkles,
} from "lucide-react";
import { SignOutButton, useUser } from "@clerk/nextjs";

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
    const pathname = usePathname();
    const { user } = useUser();

    const links = [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/courses/create", label: "Courses", icon: BookOpen },
        { href: "/admin/quizzes", label: "Quizzes", icon: HelpCircle },
        { href: "/admin/users", label: "Users", icon: Users },
        { href: "/admin/reviews", label: "Reviews", icon: Star },
        { href: "/admin/backup", label: "Backup & Restore", icon: Database },
    ];

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-white border-r border-slate-200 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
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
                    {/* Close button (Mobile only) */}
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg lg:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => onClose()} // Close on click (mobile)
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                                    ? "bg-blue-50 text-blue-600 font-semibold"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                                )}
                                <Icon
                                    size={20}
                                    className={`transition-colors ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                                        }`}
                                />
                                <span className="text-sm">{link.label}</span>
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
        </>
    );
};
