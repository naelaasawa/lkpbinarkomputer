
import React from "react";
import { LayoutTemplate } from "lucide-react";
import { SectionCard } from "./SectionCard";

interface HeroFormProps {
    settings: any;
    updateField: (path: string, value: any) => void;
}

export const HeroForm = ({ settings, updateField }: HeroFormProps) => {
    return (
        <div className="space-y-6">
            {/* Navbar & Branding */}
            <SectionCard
                title="Navbar & Branding"
                description="Pengaturan logo dan navigasi atas."
                icon={LayoutTemplate}
                iconColor="text-slate-500"
            >
                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1">Teks Logo</label>
                        <input
                            type="text"
                            value={settings.navbar?.logoText || "LKP BINAR"}
                            onChange={(e) => updateField("navbar.logoText", e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1">Tombol Masuk</label>
                        <input
                            type="text"
                            value={settings.navbar?.authButtonText || "Masuk"}
                            onChange={(e) => updateField("navbar.authButtonText", e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1">Tombol Daftar</label>
                        <input
                            type="text"
                            value={settings.navbar?.signupButtonText || "Daftar Sekarang"}
                            onChange={(e) => updateField("navbar.signupButtonText", e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>
            </SectionCard>

            <SectionCard
                title="Hero Section"
                description="Bagian paling atas halaman utama yang pertama kali dilihat pengunjung."
                icon={LayoutTemplate}
                iconColor="text-blue-500"
            >
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1">Badge (Tulisan Kecil)</label>
                            <input
                                type="text"
                                value={settings.hero.badge}
                                onChange={(e) => updateField("hero.badge", e.target.value)}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Contoh: Pendaftaran Batch Baru Dibuka"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1">URL Gambar Ilustrasi (Opsional)</label>
                            <input
                                type="text"
                                value={settings.hero.imageUrl || ""}
                                onChange={(e) => updateField("hero.imageUrl", e.target.value)}
                                placeholder="https://..."
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-mono text-slate-500"
                            />
                            <p className="text-xs text-slate-400 mt-1">Kosongkan untuk menggunakan ilustrasi default animasi CSS.</p>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1">Judul Utama</label>
                            <input
                                type="text"
                                value={settings.hero.title}
                                onChange={(e) => updateField("hero.title", e.target.value)}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-bold transition-colors"
                                placeholder="Judul Besar"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1">Sub Judul</label>
                            <input
                                type="text"
                                value={settings.hero.subtitle}
                                onChange={(e) => updateField("hero.subtitle", e.target.value)}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1">Deskripsi</label>
                            <textarea
                                value={settings.hero.description}
                                onChange={(e) => updateField("hero.description", e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors resize-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 block">Tombol Utama</label>
                                <input
                                    type="text"
                                    value={settings.hero.ctaPrimary.text}
                                    onChange={(e) => updateField("hero.ctaPrimary.text", e.target.value)}
                                    placeholder="Teks Tombol"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                                />
                                <input
                                    type="text"
                                    value={settings.hero.ctaPrimary.link}
                                    onChange={(e) => updateField("hero.ctaPrimary.link", e.target.value)}
                                    placeholder="Link (URL)"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-mono text-slate-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 block">Tombol Kedua</label>
                                <input
                                    type="text"
                                    value={settings.hero.ctaSecondary.text}
                                    onChange={(e) => updateField("hero.ctaSecondary.text", e.target.value)}
                                    placeholder="Teks Tombol"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                                />
                                <input
                                    type="text"
                                    value={settings.hero.ctaSecondary.link}
                                    onChange={(e) => updateField("hero.ctaSecondary.link", e.target.value)}
                                    placeholder="Link (URL)"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-mono text-slate-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </SectionCard>
        </div>
    );
};
