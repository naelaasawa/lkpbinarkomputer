"use client";

import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
    return (
        <div className="max-w-4xl mx-auto p-6 md:py-10">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Account Settings</h1>
            {/* Clerk's UserProfile component handles everything securely */}
            <UserProfile
                path="/settings"
                routing="path"
                appearance={{
                    elements: {
                        rootBox: "w-full",
                        card: "shadow-none border border-slate-200 rounded-xl w-full",
                        navbar: "hidden md:flex",
                        navbarMobileMenuButton: "md:hidden",
                    }
                }}
            />
        </div>
    );
}
