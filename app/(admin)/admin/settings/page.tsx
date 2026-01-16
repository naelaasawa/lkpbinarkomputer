"use client";

import { useState, useEffect } from "react";
import { Save, RotateCcw, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { HeroForm } from "@/components/admin/settings/HeroForm";
import { AboutForm } from "@/components/admin/settings/AboutForm";
import { ProfileStatsForm } from "@/components/admin/settings/ProfileStatsForm";
import { ProgramsFacilitiesForm } from "@/components/admin/settings/ProgramsFacilitiesForm";
import { ContactForm } from "@/components/admin/settings/ContactForm";

// Detailed Default Data (The "Seed")
const DEFAULT_SETTINGS = {
    navbar: {
        logoText: "LKP BINAR",
        authButtonText: "Masuk",
        signupButtonText: "Daftar Sekarang"
    },
    hero: {
        badge: "Pendaftaran Batch Baru Dibuka",
        title: "Binar Komputer Tegal",
        subtitle: "Rumah belajar komputer berbasis privat",
        description: "Mengembangkan keterampilan digital, kesiapan kerja, dan kemandirian peserta didik.",
        imageUrl: "", // Empty means default CSS illustration
        ctaPrimary: { text: "Lihat Program", link: "#courses" },
        ctaSecondary: { text: "Daftar Konsultasi", link: "https://wa.me/6281234567890" }
    },
    about: {
        badge: "Tentang Kami",
        title: "LKP Binar Komputer",
        description: "\"LKP Binar Komputer Tegal berdiri sejak 2016 sebagai rumah belajar komputer berbasis privat dengan pendekatan kekeluargaan dan pembelajaran personal.\""
    },
    profile: {
        title: "Profil Lembaga",
        items: [
            {
                title: "Sejarah Kami",
                description: "Binar Komputer Tegal berdiri sejak Februari 2016 sebagai bentuk kepedulian terhadap kebutuhan keterampilan komputer di dunia pendidikan dan kerja.",
                icon: "Building2",
                color: "blue"
            },
            {
                title: "Sistem Privat",
                description: "Dengan sistem belajar privat (1 guru 1 siswa atau maksimal 4 siswa), proses pembelajaran dibuat lebih fokus, efektif, dan personal.",
                icon: "Users",
                color: "purple"
            },
            {
                title: "Komitmen Kami",
                description: "Berawal dari inisiatif lima pemuda, Binar Komputer Tegal berkembang sebagai lembaga non-profit yang berkomitmen mencerdaskan masyarakat melalui pendidikan komputer yang aplikatif.",
                icon: "HeartHandshake",
                color: "orange"
            }
        ]
    },
    visionMission: {
        vision: "Menjadi partner pendidikan berkualitas berbasis kekeluargaan dalam dunia pendidikan komputer dan industri penunjangnya.",
        missions: [
            {
                title: "Kolaborasi Industri",
                description: "Kerja sama dengan praktisi pendidikan dan industri",
                icon: "Handshake",
                color: "green"
            },
            {
                title: "Peningkatan Keterampilan",
                description: "Peningkatan keterampilan komputer masyarakat, khususnya pelajar",
                icon: "Users",
                color: "purple"
            },
            {
                title: "Pembentukan Karakter",
                description: "Pembentukan mental, kreativitas, dan kemandirian",
                icon: "Smile",
                color: "orange"
            }
        ]
    },
    stats: {
        title: "Prestasi & Dampak",
        subtitle: "Bukti nyata komitmen kami dalam mencerdaskan kehidupan bangsa.",
        items: [
            {
                value: "70+",
                label: "Peserta Didik",
                description: "Dari berbagai usia telah bergabung dan belajar bersama kami.",
                icon: "Users",
                color: "blue"
            },
            {
                value: "2-3",
                label: "Bulan Siap Kerja",
                description: "Lulusan terserap bekerja, lanjut kuliah, atau berwirausaha.",
                icon: "Briefcase",
                color: "green"
            },
            {
                value: "30%",
                label: "Beasiswa Pendidikan",
                description: "Bantuan biaya bagi peserta didik yang kurang mampu.",
                icon: "Heart",
                color: "yellow"
            }
        ]
    },
    team: {
        title: "Tenaga Pengajar Profesional",
        description: "Didukung oleh praktisi berpengalaman di bidangnya.",
        imageUrl: "",
        features: [
            { title: "Praktisi Industri", subtitle: "Berpengalaman langsung di dunia kerja" },
            { title: "Sertifikasi Kompetensi", subtitle: "Memiliki sertifikat keahlian yang relevan" }
        ]
    },
    programs: {
        title: "Program Kami",
        subtitle: "Rencana pembelajaran terstruktur untuk masa depan yang lebih cerah.",
        items: [
            {
                title: "Program Jangka Pendek",
                description: "Motivasi belajar dan pembelajaran kilat",
                color: "blue"
            },
            {
                title: "Program Jangka Menengah",
                description: "Fokus skill Office, Desain, dan Website",
                color: "purple"
            },
            {
                title: "Program Jangka Panjang",
                description: "Pendampingan pendidikan dan kursus 1 tahun berbasis Industri 4.0",
                color: "orange"
            }
        ]
    },
    facilities: {
        title: "Fasilitas Belajar",
        subtitle: "Fasilitas lengkap untuk pengalaman belajar optimal",
        items: [
            { label: "Laptop", icon: "Monitor", color: "blue" },
            { label: "Printer", icon: "Printer", color: "orange" },
            { label: "Perpustakaan", icon: "BookOpen", color: "purple" },
            { label: "Internet", icon: "Wifi", color: "green" },
            { label: "Ruang Belajar", icon: "Home", color: "red" }
        ]
    },
    whyUs: {
        title: "Kenapa Memilih Kami?",
        description: "Keunggulan yang kami tawarkan untuk masa depan Anda.",
        items: [
            { title: "Mentor Berpengalaman", description: "Diajar oleh praktisi yang ahli di bidangnya.", icon: "UserCheck", color: "blue" },
            { title: "Kurikulum Terkini", description: "Materi menyesuaikan kebutuhan industri saat ini.", icon: "BookOpen", color: "purple" },
            { title: "Sertifikat Resmi", description: "Mendapatkan sertifikat kompetensi yang diakui.", icon: "Award", color: "orange" }
        ]
    },
    contact: {
        address: "Jl. Sipelem No. 22, Tegal Barat, Kota Tegal, Jawa Tengah",
        phone: "+62 812-3456-7890",
        email: "info@binarkomputer.com",
        googleMapsUrl: ""
    },
    footer: {
        description: "LKP Binar Komputer Tegal berdiri sejak 2016 sebagai rumah belajar komputer berbasis privat.",
        copyright: "© 2026 LKP Binar Komputer. All rights reserved.",
        links: [
            { label: "Privacy Policy", link: "#" },
            { label: "Terms of Service", link: "#" }
        ]
    },
    cta: {
        title: "Mulai belajar dan berkembang bersama Binar Komputer Tegal.",
        primaryButton: { text: "Lihat Kursus", link: "/courses" },
        secondaryButton: { text: "Chat Admin", link: "https://wa.me/6281234567890" }
    }
};

export default function SettingsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("hero");
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
    const { addToast } = useToast();

    // Sync active tab with URL
    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/admin/site-settings");
            if (res.ok) {
                const data = await res.json();
                if (data && Object.keys(data).length > 0) {
                    // Merge with defaults to ensure new fields (like 'team') exist
                    setSettings({ ...DEFAULT_SETTINGS, ...data });
                } else {
                    setSettings(DEFAULT_SETTINGS);
                }
            }
        } catch (error) {
            console.error(error);
            addToast({ type: "error", title: "Gagal memuat pengaturan. Menggunakan default." });
            setSettings(DEFAULT_SETTINGS);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/site-settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });

            if (res.ok) {
                addToast({ type: "success", title: "Pengaturan berhasil disimpan!" });
            } else {
                throw new Error("Failed to save");
            }
        } catch (error) {
            addToast({ type: "error", title: "Gagal menyimpan pengaturan" });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setIsResetDialogOpen(true);
    };

    const confirmReset = () => {
        setSettings(DEFAULT_SETTINGS);
        addToast({ type: "success", title: "Konten direset ke default. Jangan lupa klik Simpan." });
        setIsResetDialogOpen(false);
    };

    const updateField = (path: string, value: any) => {
        setSettings((prev: any) => {
            const newSettings = JSON.parse(JSON.stringify(prev)); // Deep copy
            const keys = path.split(".");
            let current = newSettings;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newSettings;
        });
    };

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        router.push(`?tab=${tabId}`);
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 size={40} className="animate-spin text-blue-600" />
            </div>
        );
    }

    if (!settings) return null;

    const tabs = [
        { id: "hero", label: "Hero & Utama" },
        { id: "about", label: "Tentang & Visi" },
        { id: "profile", label: "Profil & Tim" },
        { id: "programs", label: "Program & Fasilitas" },
        { id: "contact", label: "Kontak & Footer" },
    ];

    return (
        <div className="space-y-6 pb-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Pengaturan Landing Page
                    </h1>
                    <p className="text-slate-500">Sesuaikan konten halaman utama website Anda</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition flex items-center gap-2 font-medium"
                    >
                        <RotateCcw size={18} />
                        Reset Default
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2 font-bold shadow-lg shadow-blue-500/25 disabled:opacity-70"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Simpan Perubahan
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`px-5 py-2.5 rounded-full font-medium whitespace-nowrap transition ${activeTab === tab.id
                            ? "bg-slate-800 text-white shadow-lg"
                            : "bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Forms */}
            <div className="animate-fade-in">
                {activeTab === "hero" && <HeroForm settings={settings} updateField={updateField} />}
                {activeTab === "about" && <AboutForm settings={settings} updateField={updateField} />}
                {activeTab === "profile" && <ProfileStatsForm settings={settings} updateField={updateField} />}
                {activeTab === "programs" && <ProgramsFacilitiesForm settings={settings} updateField={updateField} />}
                {activeTab === "contact" && <ContactForm settings={settings} updateField={updateField} />}
            </div>

            <ConfirmDialog
                isOpen={isResetDialogOpen}
                onClose={() => setIsResetDialogOpen(false)}
                onConfirm={confirmReset}
                title="Reset Pengaturan?"
                message="Semua konten akan dikembalikan ke pengaturan awal (default). Perubahan yang belum disimpan akan hilang."
                confirmText="Reset Sekarang"
                cancelText="Batal"
                variant="warning"
            />
        </div>
    );
}
