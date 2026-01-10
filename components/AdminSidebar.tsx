"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, HelpCircle, Users, Star, Settings, LogOut, Database } from "lucide-react";
import { SignOutButton, useUser } from "@clerk/nextjs";

export const AdminSidebar = () => {
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
        <aside className="fixed top-0 left-0 h-screen w-64 bg-slate-900 text-white flex flex-col shadow-xl z-50">
            {/* Header */}
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Admin Panel
                </h1>
                <p className="text-xs text-slate-400 mt-1">LKP Binar Komputer</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {links.map((link) => {
                    const Icon = link.icon;
                    // Check if active (exact match or sub-route)
                    const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            <Icon size={20} className={isActive ? "text-white" : "text-slate-400 group-hover:text-white"} />
                            <span className="font-medium text-sm">{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User / Logout */}
            <div className="p-4 border-t border-slate-800 bg-slate-900">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
                        <img src={user?.imageUrl} alt="User" />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                    </div>
                </div>
                <SignOutButton>
                    <button className="flex items-center gap-2 w-full px-4 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition text-sm">
                        <LogOut size={16} />
                        <span>Sign Out</span>
                    </button>
                </SignOutButton>
            </div>
        </aside>
    );
};
