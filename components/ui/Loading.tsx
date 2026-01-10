import React from 'react';

export default function Loading() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 border-blue-600"></div>
                <p className="text-slate-500 font-medium animate-pulse">Memuat...</p>
            </div>
        </div>
    );
}
