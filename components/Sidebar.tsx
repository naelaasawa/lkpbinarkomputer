"use client";

import { Home, BookOpen, User, GraduationCap, LogOut, Settings, HelpCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export const Sidebar = () => {
    const pathname = usePathname();
    const { user } = useUser();

    const navItems = [
        { label: "Home", href: "/dashboard", icon: Home },
        { label: "Courses", href: "/courses", icon: BookOpen },
        { label: "Quizzes", href: "/quizzes", icon: HelpCircle },
        { label: "My Learning", href: "/my-learning", icon: GraduationCap },
        { label: "Profile", href: "/profile", icon: User },
        { label: "Settings", href: "/settings", icon: Settings },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 hidden md:flex flex-col z-50">
            <div className="p-6 border-b border-slate-100">
                <h1 className="text-xl font-bold text-blue-600">LKP BINAR</h1>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? "bg-blue-50 text-blue-600 font-semibold"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                        >
                            <Icon size={20} className={isActive ? "text-blue-600" : "text-slate-400"} />
                            <span className="text-sm">{item.label}</span>
                        </Link>
                    );
                })}

                {/* Admin Link */}
                {user?.publicMetadata?.role === 'admin' && (
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-purple-50 hover:text-purple-600 transition-all duration-200 mt-4 border-t border-slate-100"
                    >
                        <Settings size={20} className="text-slate-400" />
                        <span className="text-sm font-medium">Admin Dashboard</span>
                    </Link>
                )}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut size={20} />
                    <span className="text-sm font-medium">Log Out</span>
                </button>
            </div>
        </aside>
    );
};
