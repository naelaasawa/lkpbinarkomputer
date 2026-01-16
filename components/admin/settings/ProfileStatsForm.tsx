
import React, { useState } from "react";
import { Building2, TrendingUp, Users, Plus, Trash2 } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { IconPicker } from "./IconPicker";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface ProfileStatsFormProps {
    settings: any;
    updateField: (path: string, value: any) => void;
}

export const ProfileStatsForm = ({ settings, updateField }: ProfileStatsFormProps) => {
    // --- Delete States ---
    const [deleteProfileIndex, setDeleteProfileIndex] = useState<number | null>(null);
    const [deleteStatsIndex, setDeleteStatsIndex] = useState<number | null>(null);
    const [deleteTeamIndex, setDeleteTeamIndex] = useState<number | null>(null);

    // --- Add Profile State ---
    const [isAddProfileOpen, setIsAddProfileOpen] = useState(false);
    const [newProfile, setNewProfile] = useState({
        title: "",
        description: "",
        icon: "Star",
        color: "blue"
    });

    // --- Add Stats State ---
    const [isAddStatsOpen, setIsAddStatsOpen] = useState(false);
    const [newStats, setNewStats] = useState({
        value: "",
        label: "",
        description: "",
        icon: "TrendingUp",
        color: "blue"
    });

    // --- Add Team Feature State ---
    const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
    const [newTeam, setNewTeam] = useState({
        title: "",
        subtitle: ""
    });

    // --- Generic Helper for Inline Updates ---
    const updateItem = (path: string, index: number, field: string, value: any) => {
        const pathParts = path.split('.');
        const parent = pathParts.reduce((acc, part) => acc[part], settings);
        const newArray = [...parent];
        newArray[index] = { ...newArray[index], [field]: value };
        updateField(path, newArray);
    };

    // --- Profile Handlers ---
    const handleAddProfile = () => {
        setNewProfile({ title: "", description: "", icon: "Star", color: "blue" });
        setIsAddProfileOpen(true);
    };

    const saveNewProfile = () => {
        if (!newProfile.title) return alert("Judul harus diisi");
        const currentItems = settings.profile.items || [];
        updateField("profile.items", [...currentItems, newProfile]);
        setIsAddProfileOpen(false);
    };

    const confirmDeleteProfile = () => {
        if (deleteProfileIndex === null) return;
        const newItems = settings.profile.items.filter((_: any, i: number) => i !== deleteProfileIndex);
        updateField("profile.items", newItems);
        setDeleteProfileIndex(null);
    };

    // --- Stats Handlers ---
    const handleAddStats = () => {
        setNewStats({ value: "", label: "", description: "", icon: "TrendingUp", color: "blue" });
        setIsAddStatsOpen(true);
    };

    const saveNewStats = () => {
        if (!newStats.value || !newStats.label) return alert("Nilai dan Label harus diisi");
        const currentItems = settings.stats.items || [];
        updateField("stats.items", [...currentItems, newStats]);
        setIsAddStatsOpen(false);
    };

    const confirmDeleteStats = () => {
        if (deleteStatsIndex === null) return;
        const newItems = settings.stats.items.filter((_: any, i: number) => i !== deleteStatsIndex);
        updateField("stats.items", newItems);
        setDeleteStatsIndex(null);
    };

    // --- Team Handlers ---
    const handleAddTeam = () => {
        setNewTeam({ title: "", subtitle: "" });
        setIsAddTeamOpen(true);
    };

    const saveNewTeam = () => {
        if (!newTeam.title) return alert("Judul harus diisi");
        const currentItems = settings.team.features || [];
        updateField("team.features", [...currentItems, newTeam]);
        setIsAddTeamOpen(false);
    };

    const confirmDeleteTeam = () => {
        if (deleteTeamIndex === null) return;
        const newItems = settings.team.features.filter((_: any, i: number) => i !== deleteTeamIndex);
        updateField("team.features", newItems);
        setDeleteTeamIndex(null);
    };

    return (
        <div className="space-y-6">
            {/* Profile Section */}
            <SectionCard
                title="Profil Lembaga"
                description="Poin-poin profil lembaga (Sejarah, Sistem Privat, dll)."
                icon={Building2}
                iconColor="text-blue-500"
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-slate-700 block">Judul Seksi</label>
                        <input
                            type="text"
                            value={settings.profile.title}
                            onChange={(e) => updateField("profile.title", e.target.value)}
                            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        />
                    </div>

                    <div className="flex items-center justify-between border-t border-dashed pt-4">
                        <label className="text-sm font-semibold text-slate-700">Daftar Item Profil</label>
                        <button
                            onClick={handleAddProfile}
                            className="text-xs flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 transition-colors"
                        >
                            <Plus size={14} /> Tambah
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {settings.profile.items.map((item: any, idx: number) => (
                            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative">
                                <button
                                    onClick={() => setDeleteProfileIndex(idx)}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                                    title="Hapus"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <div className="space-y-3 pr-8">
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={item.title}
                                                onChange={(e) => updateItem("profile.items", idx, "title", e.target.value)}
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold text-sm focus:outline-none focus:border-blue-500"
                                                placeholder="Judul"
                                            />
                                        </div>
                                        <div className="w-32">
                                            <select
                                                value={item.color}
                                                onChange={(e) => updateItem("profile.items", idx, "color", e.target.value)}
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                                            >
                                                <option value="blue">Blue</option>
                                                <option value="purple">Purple</option>
                                                <option value="orange">Orange</option>
                                            </select>
                                        </div>
                                    </div>
                                    <textarea
                                        value={item.description}
                                        onChange={(e) => updateItem("profile.items", idx, "description", e.target.value)}
                                        rows={2}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-blue-500 resize-none"
                                        placeholder="Deskripsi"
                                    />
                                    <div className="w-48">
                                        <IconPicker
                                            value={item.icon}
                                            onChange={(icon) => updateItem("profile.items", idx, "icon", icon)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </SectionCard>

            {/* Stats Section */}
            <SectionCard
                title="Prestasi & Dampak"
                description="Angka-angka pencapaian lembaga."
                icon={TrendingUp}
                iconColor="text-green-500"
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1">Judul Seksi</label>
                        <input
                            type="text"
                            value={settings.stats.title}
                            onChange={(e) => updateField("stats.title", e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1">Sub Judul</label>
                        <input
                            type="text"
                            value={settings.stats.subtitle}
                            onChange={(e) => updateField("stats.subtitle", e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="flex items-center justify-between border-t border-dashed pt-4">
                        <label className="text-sm font-semibold text-slate-700">Daftar Statistik</label>
                        <button
                            onClick={handleAddStats}
                            className="text-xs flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 transition-colors"
                        >
                            <Plus size={14} /> Tambah
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {settings.stats.items.map((item: any, idx: number) => (
                            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative">
                                <button
                                    onClick={() => setDeleteStatsIndex(idx)}
                                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                                <div className="space-y-3 mt-2">
                                    <input
                                        type="text"
                                        value={item.value}
                                        onChange={(e) => updateItem("stats.items", idx, "value", e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-extrabold text-lg text-blue-600 focus:outline-none focus:border-blue-500"
                                        placeholder="Nilai (70+)"
                                    />
                                    <input
                                        type="text"
                                        value={item.label}
                                        onChange={(e) => updateItem("stats.items", idx, "label", e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold text-sm focus:outline-none focus:border-blue-500"
                                        placeholder="Label"
                                    />
                                    <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) => updateItem("stats.items", idx, "description", e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-500 focus:outline-none focus:border-blue-500"
                                        placeholder="Deskripsi"
                                    />
                                    <div className="w-full">
                                        <IconPicker
                                            value={item.icon}
                                            onChange={(icon) => updateItem("stats.items", idx, "icon", icon)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </SectionCard>

            {/* Team Section */}
            <SectionCard
                title="Tim & Pengajar"
                description="Bagian yang menjelaskan kualitas pengajar."
                icon={Users}
                iconColor="text-orange-500"
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1">Judul Seksi</label>
                        <input
                            type="text"
                            value={settings.team.title}
                            onChange={(e) => updateField("team.title", e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1">Deskripsi</label>
                        <textarea
                            value={settings.team.description}
                            onChange={(e) => updateField("team.description", e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1">URL Gambar Ilustrasi (Opsional)</label>
                        <input
                            type="text"
                            value={settings.team.imageUrl || ""}
                            onChange={(e) => updateField("team.imageUrl", e.target.value)}
                            placeholder="https://..."
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-mono text-slate-500"
                        />
                        <p className="text-xs text-slate-400 mt-1">Kosongkan untuk menggunakan ilustrasi default animasi CSS.</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-dashed pt-4">
                        <label className="text-sm font-semibold text-slate-700">Poin Keunggulan</label>
                        <button
                            onClick={handleAddTeam}
                            className="text-xs flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 transition-colors"
                        >
                            <Plus size={14} /> Tambah
                        </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        {settings.team.features.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-2 items-start p-3 bg-slate-50 rounded-lg">
                                <div className="flex-1 space-y-2">
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={(e) => updateItem("team.features", idx, "title", e.target.value)}
                                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-sm"
                                        placeholder="Judul"
                                    />
                                    <input
                                        type="text"
                                        value={item.subtitle}
                                        onChange={(e) => updateItem("team.features", idx, "subtitle", e.target.value)}
                                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                        placeholder="Sub-judul"
                                    />
                                </div>
                                <button onClick={() => setDeleteTeamIndex(idx)} className="text-slate-400 hover:text-red-500">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </SectionCard>

            {/* --- Modals --- */}

            {/* Add Profile Modal */}
            <Modal isOpen={isAddProfileOpen} onClose={() => setIsAddProfileOpen(false)} title="Tambah Item Profil">
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Judul Item</label>
                        <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:blue-500"
                            placeholder="Contoh: Sejarah Kami" value={newProfile.title}
                            onChange={(e) => setNewProfile({ ...newProfile, title: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Warna Aksen</label>
                        <select className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                            value={newProfile.color} onChange={(e) => setNewProfile({ ...newProfile, color: e.target.value })}>
                            <option value="blue">Blue</option> <option value="purple">Purple</option> <option value="orange">Orange</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Deskripsi</label>
                        <textarea className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                            placeholder="Penjelasan..." rows={3} value={newProfile.description}
                            onChange={(e) => setNewProfile({ ...newProfile, description: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Ikon</label>
                        <div className="w-full">
                            <IconPicker value={newProfile.icon} onChange={(icon) => setNewProfile({ ...newProfile, icon })} align="left" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button onClick={() => setIsAddProfileOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Batal</button>
                        <button onClick={saveNewProfile} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium">Simpan</button>
                    </div>
                </div>
            </Modal>
            <ConfirmDialog isOpen={deleteProfileIndex !== null} onClose={() => setDeleteProfileIndex(null)}
                onConfirm={confirmDeleteProfile} title="Hapus Item Profil?" message="Tindakan ini tidak dapat dibatalkan." variant="danger" />

            {/* Add Stats Modal */}
            <Modal isOpen={isAddStatsOpen} onClose={() => setIsAddStatsOpen(false)} title="Tambah Statistik">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1">Nilai</label>
                            <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:blue-500"
                                placeholder="Contoh: 100+" value={newStats.value}
                                onChange={(e) => setNewStats({ ...newStats, value: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1">Label</label>
                            <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:blue-500"
                                placeholder="Contoh: Siswa" value={newStats.label}
                                onChange={(e) => setNewStats({ ...newStats, label: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Deskripsi</label>
                        <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                            placeholder="Keterangan tambahan..." value={newStats.description}
                            onChange={(e) => setNewStats({ ...newStats, description: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Ikon</label>
                        <div className="w-full">
                            <IconPicker value={newStats.icon} onChange={(icon) => setNewStats({ ...newStats, icon })} align="left" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button onClick={() => setIsAddStatsOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Batal</button>
                        <button onClick={saveNewStats} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium">Simpan</button>
                    </div>
                </div>
            </Modal>
            <ConfirmDialog isOpen={deleteStatsIndex !== null} onClose={() => setDeleteStatsIndex(null)}
                onConfirm={confirmDeleteStats} title="Hapus Statistik?" message="Tindakan ini tidak dapat dibatalkan." variant="danger" />

            {/* Add Team Feature Modal */}
            <Modal isOpen={isAddTeamOpen} onClose={() => setIsAddTeamOpen(false)} title="Tambah Keunggulan Tim">
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Judul Keunggulan</label>
                        <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:blue-500"
                            placeholder="Contoh: Profesional" value={newTeam.title}
                            onChange={(e) => setNewTeam({ ...newTeam, title: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Keterangan Sub-judul</label>
                        <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:blue-500"
                            placeholder="Contoh: Tersertifikasi BNSP" value={newTeam.subtitle}
                            onChange={(e) => setNewTeam({ ...newTeam, subtitle: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button onClick={() => setIsAddTeamOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Batal</button>
                        <button onClick={saveNewTeam} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium">Simpan</button>
                    </div>
                </div>
            </Modal>
            <ConfirmDialog isOpen={deleteTeamIndex !== null} onClose={() => setDeleteTeamIndex(null)}
                onConfirm={confirmDeleteTeam} title="Hapus Keunggulan?" message="Tindakan ini tidak dapat dibatalkan." variant="danger" />

        </div>
    );
};
