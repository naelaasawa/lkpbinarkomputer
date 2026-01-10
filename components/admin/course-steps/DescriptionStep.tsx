"use client";

import TiptapEditor from "@/components/admin/editors/TiptapEditor";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface CourseData {
    title: string;
    slug: string;
    shortDescription: string;
    categoryId: string;
    level: string;
    language: string;
    imageUrl?: string;
    fullDescription: string;
    whatYouLearn: string[];
    targetAudience: string;
    prerequisites: string;
    price: number;
}

interface DescriptionStepProps {
    data: CourseData;
    onChange: (data: CourseData) => void;
}

export default function DescriptionStep({ data, onChange }: DescriptionStepProps) {
    const updateLearningPoint = (index: number, value: string) => {
        const updated = [...data.whatYouLearn];
        updated[index] = value;
        onChange({ ...data, whatYouLearn: updated });
    };

    const addLearningPoint = () => {
        onChange({ ...data, whatYouLearn: [...data.whatYouLearn, ""] });
    };

    const removeLearningPoint = (index: number) => {
        if (data.whatYouLearn.length <= 3) return;
        const updated = data.whatYouLearn.filter((_, i) => i !== index);
        onChange({ ...data, whatYouLearn: updated });
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="pb-6 border-b border-slate-100">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Deskripsi Kursus
                </h2>
                <p className="text-slate-500 mt-1">
                    Berikan informasi detail tentang kurikulum dan tujuan pembelajaran
                </p>
            </div>

            {/* Full Description */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Deskripsi Lengkap <span className="text-red-500">*</span>
                </label>
                <TiptapEditor
                    content={data.fullDescription}
                    onChange={(content) =>
                        onChange({ ...data, fullDescription: content })
                    }
                    placeholder="Jelaskan secara detail tentang kursus ini, apa yang akan dipelajari, metodologi pengajaran, dll..."
                />
            </div>

            {/* What You'll Learn */}
            <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/30 rounded-2xl p-6 border border-emerald-100">
                <label className="block text-sm font-semibold text-slate-700 mb-4">
                    🎯 Apa yang Akan Dipelajari
                    <span className="text-slate-400 font-normal ml-2">(Min. 3 poin)</span>
                </label>
                <div className="space-y-3">
                    {data.whatYouLearn.map((point, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 group"
                        >
                            <div className="text-slate-300 cursor-grab">
                                <GripVertical size={16} />
                            </div>
                            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {index + 1}
                            </span>
                            <input
                                type="text"
                                value={point}
                                onChange={(e) => updateLearningPoint(index, e.target.value)}
                                placeholder={
                                    index === 0
                                        ? "Contoh: Menguasai dasar-dasar Microsoft Word"
                                        : index === 1
                                            ? "Contoh: Membuat dokumen profesional"
                                            : "Contoh: Tips & trik produktif"
                                }
                                className="flex-1 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition"
                            />
                            {data.whatYouLearn.length > 3 && (
                                <button
                                    type="button"
                                    onClick={() => removeLearningPoint(index)}
                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={addLearningPoint}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-emerald-600 font-medium hover:bg-emerald-50 rounded-lg transition"
                >
                    <Plus size={18} />
                    Tambah Poin
                </button>
            </div>

            {/* Target Audience & Prerequisites */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        👥 Target Peserta
                    </label>
                    <textarea
                        value={data.targetAudience}
                        onChange={(e) =>
                            onChange({ ...data, targetAudience: e.target.value })
                        }
                        rows={4}
                        placeholder="Siapa yang cocok mengikuti kursus ini? Contoh: Pemula yang ingin belajar komputer, Mahasiswa, Karyawan..."
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition resize-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        📋 Prasyarat
                    </label>
                    <textarea
                        value={data.prerequisites}
                        onChange={(e) =>
                            onChange({ ...data, prerequisites: e.target.value })
                        }
                        rows={4}
                        placeholder="Apa yang perlu disiapkan sebelum mengikuti kursus ini? Contoh: Memiliki laptop/PC, Koneksi internet..."
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition resize-none"
                    />
                </div>
            </div>
        </div>
    );
}
