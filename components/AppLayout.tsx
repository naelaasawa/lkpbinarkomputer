"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { MobileContainer } from "@/components/MobileContainer";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Sidebar } from "@/components/Sidebar";

interface AppLayoutProps {
    children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
    const pathname = usePathname();
    const isLandingPage = pathname === "/";
    const isCourseLearnPage = pathname.includes('/learn') && pathname.includes('/courses');

    if (isLandingPage) {
        return <main className="w-full min-h-screen bg-white">{children}</main>;
    }

    if (isCourseLearnPage) {
        return <main className="w-full min-h-screen bg-white">{children}</main>;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Desktop Sidebar - Hidden on mobile */}
            <div className="hidden md:block w-64 shrink-0 transition-all duration-300">
                <Sidebar />
            </div>

            <main className="flex-1 pb-20 md:pb-0 relative w-full overflow-x-hidden">
                {/* Mobile Container logic for mobile screens, full width for desktop */}
                <div className="md:hidden">
                    <MobileContainer>
                        <div className="min-h-screen">
                            {children}
                        </div>
                        <BottomNavigation />
                    </MobileContainer>
                </div>

                {/* Desktop View */}
                <div className="hidden md:block w-full max-w-7xl mx-auto px-6 lg:px-8 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
};
