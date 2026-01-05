import React from "react";

interface MobileContainerProps {
    children: React.ReactNode;
}

export const MobileContainer = ({ children }: MobileContainerProps) => {
    return (
        <div className="min-h-screen w-full bg-slate-100 flex justify-center">
            <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col">
                {children}
            </div>
        </div>
    );
};
