"use client";

import React from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminBottomNavigation } from "./AdminBottomNavigation";
import { AdminMobileHeader } from "./AdminMobileHeader";

interface AdminLayoutProps {
    children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar (Desktop only) */}
            <AdminSidebar />

            <div className="flex-1 flex flex-col min-h-screen relative w-full overflow-x-hidden">
                {/* Mobile Header */}
                <AdminMobileHeader />

                {/* Main Content Area */}
                <main className="flex-1 w-full pb-24 lg:pb-0">
                    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>

            {/* Bottom Navigation (Mobile only) */}
            <AdminBottomNavigation />
        </div>
    );
};
