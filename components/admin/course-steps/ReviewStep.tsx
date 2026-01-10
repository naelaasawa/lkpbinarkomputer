"use client";

import { Check, X, AlertCircle, BookOpen, Users, Clock, DollarSign } from "lucide-react";

interface ReviewData {
    title: string;
    shortDescription: string;
    categoryId: string;
    imageUrl?: string;
    price: number;
}

interface Module {
    id: string;
    title: string;
    lessons: { id: string; title: string }[];
}

interface Settings {
    visibility: string;
    certificateEnabled: boolean;
}

interface ReviewStepProps {
    courseData: ReviewData;
    modules: Module[];
    settings: Settings;
}

export default function ReviewStep({ courseData, modules, settings }: ReviewStepProps) {
    // Validation checks
    const validations = {
        title: Boolean(courseData.title),
        description: Boolean(courseData.shortDescription),
        category: Boolean(courseData.categoryId),
        modules: modules.length > 0,
        lessons: modules.some((m) => m.lessons.length > 0),
    };

    const isValid = Object.values(validations).every(Boolean);
    const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);

    const formatPrice = (value: number) => {
        if (value === 0) return "Gratis";
        return "Rp " + new Intl.NumberFormat("id-ID").format(value);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="pb-6 border-b border-slate-100">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Review & Publish
                </h2>
                <p className="text-slate-500 mt-1">Periksa kembali sebelum mempublikasikan</p>
            </div>

            {/* Validation Status */}
            <div
                className={`p-6 rounded-2xl border-2 ${isValid
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-amber-50 border-amber-200"
                    }`}
            >
                <div className="flex items-start gap-4">
                    <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${isValid ? "bg-emerald-100" : "bg-amber-100"
                            }`}
                    >
                        {isValid ? (
                            <Check size={24} className="text-emerald-600" />
                        ) : (
                            <AlertCircle size={24} className="text-amber-600" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h3
                            className={`font-bold text-lg ${isValid ? "text-emerald-800" : "text-amber-800"
                                }`}
                        >
                            {isValid ? "Siap untuk dipublikasikan! ✅" : "Lengkapi data berikut"}
                        </h3>
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.entries(validations).map(([key, valid]) => (
                                <div
                                    key={key}
                                    className={`flex items-center gap-2 text-sm ${valid ? "text-emerald-700" : "text-red-600"
                                        }`}
                                >
                                    {valid ? <Check size={16} /> : <X size={16} />}
                                    <span className="capitalize">{key}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Preview Card */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
                {/* Image */}
                <div className="h-40 bg-gradient-to-br from-blue-500 to-violet-600 relative">
                    {courseData.imageUrl && (
                        <img
                            src={courseData.imageUrl}
                            alt="Thumbnail"
                            className="w-full h-full object-cover"
                        />
                    )}
                    <div className="absolute top-4 left-4">
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${settings.visibility === "public"
                                    ? "bg-emerald-500 text-white"
                                    : settings.visibility === "private"
                                        ? "bg-amber-500 text-white"
                                        : "bg-slate-500 text-white"
                                }`}
                        >
                            {settings.visibility}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                        {courseData.title || "Judul Kursus"}
                    </h3>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                        {courseData.shortDescription || "Deskripsi singkat kursus..."}
                    </p>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1.5">
                            <BookOpen size={16} className="text-blue-500" />
                            <span>{modules.length} Modul</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock size={16} className="text-violet-500" />
                            <span>{totalLessons} Materi</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <DollarSign size={16} className="text-emerald-500" />
                            <span className="font-semibold">{formatPrice(courseData.price)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Table */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-4">Ringkasan Kursus</h4>
                <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-500">Judul</span>
                        <span className="font-medium text-slate-800">{courseData.title || "-"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-500">Modul</span>
                        <span className="font-medium text-slate-800">{modules.length}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-500">Total Materi</span>
                        <span className="font-medium text-slate-800">{totalLessons}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-500">Visibilitas</span>
                        <span className="font-medium text-slate-800 capitalize">{settings.visibility}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200">
                        <span className="text-slate-500">Sertifikat</span>
                        <span className="font-medium text-slate-800">
                            {settings.certificateEnabled ? "Ya" : "Tidak"}
                        </span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-slate-500">Harga</span>
                        <span className="font-bold text-emerald-600">{formatPrice(courseData.price)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
