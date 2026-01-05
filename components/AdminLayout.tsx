"use client";

import React from "react";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
    children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Fixed Sidebar */}
            <div className="w-64 shrink-0">
                <AdminSidebar />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 min-h-screen relative w-full overflow-x-hidden">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};
