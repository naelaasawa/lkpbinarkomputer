
import React from "react";
import { LucideIcon } from "lucide-react";

interface SectionCardProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    iconColor?: string;
    children: React.ReactNode;
    rightElement?: React.ReactNode;
}

export const SectionCard = ({
    title,
    description,
    icon: Icon,
    iconColor = "text-blue-500",
    children,
    rightElement
}: SectionCardProps) => {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-fade-in relative">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className={`p-2 rounded-xl bg-slate-50 ${iconColor}`}>
                            <Icon size={20} />
                        </div>
                    )}
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 leading-none">
                            {title}
                        </h2>
                        {description && (
                            <p className="text-sm text-slate-400 font-medium mt-1">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
                {rightElement && (
                    <div>{rightElement}</div>
                )}
            </div>

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};
