"use client";

import { DollarSign, Gift, Tag } from "lucide-react";

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

interface PricingStepProps {
    data: CourseData;
    onChange: (data: CourseData) => void;
}

export default function PricingStep({ data, onChange }: PricingStepProps) {
    const formatPrice = (value: number) => {
        return new Intl.NumberFormat("id-ID").format(value);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="pb-6 border-b border-slate-100">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Harga Kursus
                </h2>
                <p className="text-slate-500 mt-1">Tentukan harga untuk kursus Anda</p>
            </div>

            {/* Price Input */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/30 rounded-2xl p-8 border border-emerald-100">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                        <DollarSign size={28} className="text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800">Harga Kursus</h3>
                        <p className="text-sm text-slate-500">Masukkan 0 untuk kursus gratis</p>
                    </div>
                </div>

                <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                        Rp
                    </span>
                    <input
                        type="number"
                        min="0"
                        step="10000"
                        value={data.price}
                        onChange={(e) => onChange({ ...data, price: parseInt(e.target.value) || 0 })}
                        className="w-full pl-16 pr-6 py-5 text-3xl font-bold text-slate-800 bg-white border-2 border-emerald-200 rounded-2xl focus:border-emerald-500 focus:outline-none transition"
                        placeholder="0"
                    />
                </div>

                {data.price > 0 && (
                    <p className="mt-3 text-lg text-emerald-700 font-semibold text-center">
                        {formatPrice(data.price)} IDR
                    </p>
                )}
            </div>

            {/* Quick Price Options */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-4">
                    Template Harga
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: "Gratis", value: 0, icon: Gift },
                        { label: "Rp 99.000", value: 99000, icon: Tag },
                        { label: "Rp 199.000", value: 199000, icon: Tag },
                        { label: "Rp 499.000", value: 499000, icon: Tag },
                    ].map((option) => {
                        const Icon = option.icon;
                        const isActive = data.price === option.value;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => onChange({ ...data, price: option.value })}
                                className={`p-4 rounded-xl border-2 text-center transition hover:scale-[1.02] ${isActive
                                    ? "border-emerald-500 bg-emerald-50"
                                    : "border-slate-200 bg-white hover:border-slate-300"
                                    }`}
                            >
                                <Icon
                                    size={20}
                                    className={`mx-auto mb-2 ${isActive ? "text-emerald-600" : "text-slate-400"}`}
                                />
                                <p className={`font-semibold ${isActive ? "text-emerald-700" : "text-slate-700"}`}>
                                    {option.label}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Note */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-sm text-slate-500">
                    💡 <strong>Tips:</strong> Kursus gratis dapat menarik lebih banyak siswa. Pertimbangkan untuk
                    menawarkan beberapa modul gratis dan premium content berbayar.
                </p>
            </div>
        </div>
    );
}
