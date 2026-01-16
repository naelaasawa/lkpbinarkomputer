"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";

export const AdminMobileHeader = () => {
    const { user } = useUser();

    return (
        <div className="lg:hidden bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-200">
                        <Sparkles size={16} fill="currentColor" />
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-900 tracking-tight leading-none text-sm">
                            Admin Panel
                        </h1>
                        <p className="text-[10px] text-blue-600 font-semibold tracking-wider uppercase">
                            LKP Binar
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <UserButton afterSignOutUrl="/" />
                </div>
            </div>
        </div>
    );
};
