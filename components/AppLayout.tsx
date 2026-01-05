"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { MobileContainer } from "@/components/MobileContainer";
import { BottomNavigation } from "@/components/BottomNavigation";

interface AppLayoutProps {
    children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
    const pathname = usePathname();
    const isLandingPage = pathname === "/";

    if (isLandingPage) {
        return <main className="w-full min-h-screen bg-white">{children}</main>;
    }

    return (
        <MobileContainer>
            <main className="flex-1 pb-20">{children}</main>
            <BottomNavigation />
        </MobileContainer>
    );
};
