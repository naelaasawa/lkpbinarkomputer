"use client";

import { Globe, Lock, Users, Award, FileCheck } from "lucide-react";

interface SettingsData {
    visibility: string;
    enrollmentType: string;
    completionRule: string;
    certificateEnabled: boolean;
}

interface SettingsStepProps {
    settings: SettingsData;
    setSettings: (settings: SettingsData) => void;
}

const visibilityOptions = [
    {
        value: "draft",
        icon: Lock,
        label: "Draft",
        description: "Hanya Anda yang dapat melihat",
        color: "border-slate-200 bg-slate-50",
        activeColor: "border-slate-500 bg-slate-100",
    },
    {
        value: "private",
        icon: Users,
        label: "Private",
        description: "Hanya siswa terdaftar yang dapat akses",
        color: "border-amber-200 bg-amber-50",
        activeColor: "border-amber-500 bg-amber-100",
    },
    {
        value: "public",
        icon: Globe,
        label: "Public",
        description: "Semua orang dapat melihat dan mendaftar",
        color: "border-emerald-200 bg-emerald-50",
        activeColor: "border-emerald-500 bg-emerald-100",
    },
];

export default function SettingsStep({ settings, setSettings }: SettingsStepProps) {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="pb-6 border-b border-slate-100">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Pengaturan Kursus
                </h2>
                <p className="text-slate-500 mt-1">Atur akses dan visibilitas kursus</p>
            </div>

            {/* Visibility */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-4">
                    Visibilitas
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {visibilityOptions.map((opt) => {
                        const Icon = opt.icon;
                        const isActive = settings.visibility === opt.value;

                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setSettings({ ...settings, visibility: opt.value })}
                                className={`relative p-5 rounded-2xl border-2 text-left transition-all ${isActive ? opt.activeColor : opt.color
                                    } hover:scale-[1.02]`}
                            >
                                {isActive && (
                                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                            <path
                                                d="M2 6L5 9L10 3"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                )}
                                <Icon
                                    size={24}
                                    className={`mb-3 ${opt.value === "draft"
                                            ? "text-slate-500"
                                            : opt.value === "private"
                                                ? "text-amber-500"
                                                : "text-emerald-500"
                                        }`}
                                />
                                <p className="font-semibold text-slate-800 mb-1">{opt.label}</p>
                                <p className="text-xs text-slate-500">{opt.description}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Enrollment Type */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <label className="block text-sm font-semibold text-slate-700 mb-4">
                    Tipe Pendaftaran
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label
                        className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${settings.enrollmentType === "open"
                                ? "border-blue-500 bg-blue-50"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                    >
                        <input
                            type="radio"
                            value="open"
                            checked={settings.enrollmentType === "open"}
                            onChange={(e) => setSettings({ ...settings, enrollmentType: e.target.value })}
                            className="mt-1"
                        />
                        <div>
                            <p className="font-semibold text-slate-800">Open</p>
                            <p className="text-xs text-slate-500">Langsung terdaftar saat klik enroll</p>
                        </div>
                    </label>
                    <label
                        className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${settings.enrollmentType === "approval"
                                ? "border-blue-500 bg-blue-50"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                    >
                        <input
                            type="radio"
                            value="approval"
                            checked={settings.enrollmentType === "approval"}
                            onChange={(e) => setSettings({ ...settings, enrollmentType: e.target.value })}
                            className="mt-1"
                        />
                        <div>
                            <p className="font-semibold text-slate-800">Perlu Persetujuan</p>
                            <p className="text-xs text-slate-500">Admin harus menyetujui pendaftaran</p>
                        </div>
                    </label>
                </div>
            </div>

            {/* Completion Rule */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <label className="block text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <FileCheck size={18} className="text-slate-500" />
                    Aturan Penyelesaian
                </label>
                <select
                    value={settings.completionRule}
                    onChange={(e) => setSettings({ ...settings, completionRule: e.target.value })}
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
                >
                    <option value="manual">Manual - Instruktur menandai selesai</option>
                    <option value="all_lessons">Semua Materi - Selesaikan semua materi</option>
                    <option value="quiz_pass">Lulus Kuis - Harus lulus semua kuis</option>
                </select>
            </div>

            {/* Certificate */}
            <label className="flex items-center gap-4 p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 cursor-pointer hover:from-amber-100 hover:to-orange-100 transition">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Award size={24} className="text-amber-600" />
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-slate-800">Sertifikat Kelulusan</p>
                    <p className="text-xs text-slate-500">
                        Berikan sertifikat kepada siswa yang menyelesaikan kursus
                    </p>
                </div>
                <div className="relative">
                    <input
                        type="checkbox"
                        checked={settings.certificateEnabled}
                        onChange={(e) => setSettings({ ...settings, certificateEnabled: e.target.checked })}
                        className="sr-only peer"
                    />
                    <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-500" />
                </div>
            </label>
        </div>
    );
}
