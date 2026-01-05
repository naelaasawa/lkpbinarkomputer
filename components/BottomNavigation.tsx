"use client";

import { Home, BookOpen, User, GraduationCap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const BottomNavigation = () => {
    const pathname = usePathname();

    const navItems = [
        { label: "Home", href: "/", icon: Home },
        { label: "Courses", href: "/courses", icon: BookOpen },
        { label: "My Learning", href: "/my-learning", icon: GraduationCap },
        { label: "Profile", href: "/profile", icon: User },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <div className="w-full max-w-md bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pointer-events-auto">
                <div className="flex justify-between items-center px-6 py-3">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 transition-colors duration-200 ${isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
                                    }`}
                            >
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
