"use client";

import React, { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { Menu } from "lucide-react";

interface AdminLayoutProps {
    children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar (Responsive) */}
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content Area */}
            <main className="flex-1 min-h-screen relative w-full overflow-x-hidden flex flex-col">
                {/* Mobile Header */}
                <div className="lg:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-30 flex items-center justify-between">
                    <div className="font-bold text-slate-800">Admin Panel</div>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                        <Menu size={24} />
                    </button>
                </div>

                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
};
