"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    BookOpen,
    HelpCircle,
    Users,
    Star,
    Database,
    MoreHorizontal,
    X,
    TrendingUp,
    FileQuestion,
    ClipboardList
} from "lucide-react";

export const AdminBottomNavigation = () => {
    const pathname = usePathname();
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMoreOpen(false);
            }
        };

        if (isMoreOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMoreOpen]);

    // Close menu on route change
    useEffect(() => {
        setIsMoreOpen(false);
    }, [pathname]);

    const mainLinks = [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/courses", label: "Courses", icon: BookOpen },
        { href: "/admin/quizzes", label: "Quizzes", icon: HelpCircle },
    ];

    const moreLinks = [
        { href: "/admin/activity", label: "Activity", icon: TrendingUp },
        { href: "/admin/assignments", label: "Assignments", icon: FileQuestion },
        { href: "/admin/enrollments", label: "Enrollments", icon: ClipboardList },
        { href: "/admin/users", label: "Users", icon: Users },
        { href: "/admin/reviews", label: "Reviews", icon: Star },
        { href: "/admin/backup", label: "Backup", icon: Database },
    ];

    const isMoreActive = moreLinks.some(link =>
        pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href))
    );

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none lg:hidden">
            {/* Pop-up Menu for "Other" */}
            {isMoreOpen && (
                <div
                    ref={menuRef}
                    className="absolute bottom-20 right-4 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 flex flex-col gap-1 pointer-events-auto transform transition-all animate-in slide-in-from-bottom-5 fade-in zoom-in-95 origin-bottom-right max-h-[60vh] overflow-y-auto"
                >
                    <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        More Options
                    </div>
                    {moreLinks.map((link) => {
                        const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isActive
                                    ? "bg-blue-50 text-blue-600 font-semibold"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                            >
                                <Icon size={18} />
                                <span className="text-sm">{link.label}</span>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Bottom Bar */}
            <div className="w-full bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pointer-events-auto pb-[env(safe-area-inset-bottom)]">
                <div className="grid grid-cols-4  px-2 py-2">
                    {/* Main Links */}
                    {mainLinks.map((link) => {
                        const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
                        const Icon = link.icon;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-all duration-200 ${isActive
                                    ? "text-blue-600"
                                    : "text-slate-400 hover:text-slate-600"
                                    }`}
                            >
                                <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-blue-50" : ""}`}>
                                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className={`text-[10px] font-medium transition-all ${isActive ? "font-bold" : ""}`}>
                                    {link.label}
                                </span>
                            </Link>
                        );
                    })}

                    {/* "Other" Toggle Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMoreOpen(!isMoreOpen);
                        }}
                        className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-all duration-200 ${isMoreActive || isMoreOpen
                            ? "text-blue-600"
                            : "text-slate-400 hover:text-slate-600"
                            }`}
                    >
                        <div className={`p-1.5 rounded-xl transition-all ${isMoreActive || isMoreOpen ? "bg-blue-50" : ""}`}>
                            {isMoreOpen ? (
                                <X size={24} strokeWidth={2.5} />
                            ) : (
                                <MoreHorizontal size={24} strokeWidth={isMoreActive ? 2.5 : 2} />
                            )}
                        </div>
                        <span className={`text-[10px] font-medium transition-all ${isMoreActive || isMoreOpen ? "font-bold" : ""}`}>
                            Other
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};
