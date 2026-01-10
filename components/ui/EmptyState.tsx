import { LucideIcon } from "lucide-react";
import React from "react";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 text-slate-300 shadow-sm">
                <Icon size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 text-center">{title}</h3>
            <p className="text-slate-500 text-sm text-center max-w-sm mt-1 mb-6">{description}</p>
            {action && (
                <div>
                    {action}
                </div>
            )}
        </div>
    );
}
