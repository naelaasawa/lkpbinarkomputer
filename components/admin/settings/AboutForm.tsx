
import React, { useState } from "react";
import { Quote, Target, Plus, Trash2 } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { IconPicker } from "./IconPicker";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface AboutFormProps {
    settings: any;
    updateField: (path: string, value: any) => void;
}

export const AboutForm = ({ settings, updateField }: AboutFormProps) => {
    // Delete States
    const [deleteMissionIndex, setDeleteMissionIndex] = useState<number | null>(null);
    const [deleteWhyUsIndex, setDeleteWhyUsIndex] = useState<number | null>(null);

    // Add Mission State
    const [isAddMissionOpen, setIsAddMissionOpen] = useState(false);
    const [newMission, setNewMission] = useState({
        title: "",
        description: "",
        icon: "Target",
        color: "blue"
    });

    // Add Why Us State
    const [isAddWhyUsOpen, setIsAddWhyUsOpen] = useState(false);
    const [newWhyUs, setNewWhyUs] = useState({
        title: "",
        description: "",
        icon: "Star",
        color: "blue"
    });

    // --- Mission Handlers ---
    const handleAddMission = () => {
        setNewMission({ title: "", description: "", icon: "Target", color: "blue" });
        setIsAddMissionOpen(true);
    };

    const saveNewMission = () => {
        if (!newMission.title) return alert("Judul misi harus diisi");
        const newMissions = [...settings.visionMission.missions, newMission];
        updateField("visionMission.missions", newMissions);
        setIsAddMissionOpen(false);
    };

    const confirmDeleteMission = () => {
        if (deleteMissionIndex === null) return;
        const newMissions = settings.visionMission.missions.filter((_: any, i: number) => i !== deleteMissionIndex);
        updateField("visionMission.missions", newMissions);
        setDeleteMissionIndex(null);
    };

    const updateMission = (index: number, field: string, value: any) => {
        const newMissions = [...settings.visionMission.missions];
        newMissions[index] = { ...newMissions[index], [field]: value };
        updateField("visionMission.missions", newMissions);
    };

    // --- Why Us Handlers ---
    const handleAddWhyUs = () => {
        setNewWhyUs({ title: "", description: "", icon: "Star", color: "blue" });
        setIsAddWhyUsOpen(true);
    };

    const saveNewWhyUs = () => {
        if (!newWhyUs.title) return alert("Judul keunggulan harus diisi");
        const currentItems = settings.whyUs?.items || [];
        updateField("whyUs.items", [...currentItems, newWhyUs]);
        setIsAddWhyUsOpen(false);
    };

    const confirmDeleteWhyUs = () => {
        if (deleteWhyUsIndex === null) return;
        const newItems = settings.whyUs.items.filter((_: any, i: number) => i !== deleteWhyUsIndex);
        updateField("whyUs.items", newItems);
        setDeleteWhyUsIndex(null);
    };

    return (
        <div className="space-y-6">
            <SectionCard
                title="Sekilas Tentang"
                description="Informasi singkat mengenai lembaga."
                icon={Quote}
                iconColor="text-purple-500"
            >
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1">Judul</label>
                        <input
                            type="text"
                            value={settings.about.title}
                            onChange={(e) => updateField("about.title", e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1">Deskripsi Singkat</label>
                        <textarea
                            value={settings.about.description}
                            onChange={(e) => updateField("about.description", e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors resize-none"
                        />
                    </div>
                </div>
            </SectionCard>

            <SectionCard
                title="Visi & Misi"
                description="Tujuan dan cita-cita lembaga."
                icon={Target}
                iconColor="text-red-500"
            >
                <div className="space-y-6">
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1">Visi (Quote Utama)</label>
                        <textarea
                            value={settings.visionMission.vision}
                            onChange={(e) => updateField("visionMission.vision", e.target.value)}
                            rows={2}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors italic text-lg text-slate-600"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-slate-700">Daftar Misi</label>
                            <button
                                onClick={handleAddMission}
                                className="text-xs flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 transition-colors"
                            >
                                <Plus size={14} /> Tambah Misi
                            </button>
                        </div>

                        <div className="grid gap-4">
                            {settings.visionMission.missions.map((item: any, idx: number) => (
                                <div key={idx} className="flex gap-4 items-start p-4 bg-slate-50 rounded-xl border border-slate-200 relative group hover:border-blue-200 transition-colors">
                                    <div className="w-10 pt-1 flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs">
                                            {idx + 1}
                                        </div>
                                        <button
                                            onClick={() => setDeleteMissionIndex(idx)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Hapus Misi"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={item.title}
                                                    onChange={(e) => updateMission(idx, "title", e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold text-sm focus:outline-none focus:border-blue-500"
                                                    placeholder="Judul Misi"
                                                />
                                            </div>
                                            <div className="w-40">
                                                <select
                                                    value={item.color}
                                                    onChange={(e) => updateMission(idx, "color", e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                                                >
                                                    <option value="blue">Blue</option>
                                                    <option value="green">Green</option>
                                                    <option value="purple">Purple</option>
                                                    <option value="orange">Orange</option>
                                                    <option value="red">Red</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={item.description}
                                                    onChange={(e) => updateMission(idx, "description", e.target.value)}
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-blue-500"
                                                    placeholder="Deskripsi Misi"
                                                />
                                            </div>
                                            <div className="w-40">
                                                <IconPicker
                                                    value={item.icon}
                                                    onChange={(icon) => updateMission(idx, "icon", icon)}
                                                    align="right"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </SectionCard>

            {/* Why Us Section */}
            <SectionCard
                title="Keunggulan (Why Us)"
                description="Alasan kenapa orang harus memilih lembaga ini."
                icon={Target}
                iconColor="text-yellow-500"
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1">Judul Seksi</label>
                        <input
                            type="text"
                            value={settings.whyUs?.title || ""}
                            onChange={(e) => updateField("whyUs.title", e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1">Deskripsi Singkat</label>
                        <textarea
                            value={settings.whyUs?.description || ""}
                            onChange={(e) => updateField("whyUs.description", e.target.value)}
                            rows={2}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                        />
                    </div>

                    <div className="flex items-center justify-between border-t border-dashed pt-4">
                        <label className="text-sm font-semibold text-slate-700">Daftar Keunggulan</label>
                        <button
                            onClick={handleAddWhyUs}
                            className="text-xs flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 transition-colors"
                        >
                            <Plus size={14} /> Tambah
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {(settings.whyUs?.items || []).map((item: any, idx: number) => (
                            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative">
                                <button
                                    onClick={() => setDeleteWhyUsIndex(idx)}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <div className="space-y-3 pr-8">
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={item.title}
                                                onChange={(e) => {
                                                    const newItems = [...settings.whyUs.items];
                                                    newItems[idx].title = e.target.value;
                                                    updateField("whyUs.items", newItems);
                                                }}
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold text-sm"
                                                placeholder="Judul"
                                            />
                                        </div>
                                        <div className="w-32">
                                            <select
                                                value={item.color}
                                                onChange={(e) => {
                                                    const newItems = [...settings.whyUs.items];
                                                    newItems[idx].color = e.target.value;
                                                    updateField("whyUs.items", newItems);
                                                }}
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                            >
                                                <option value="blue">Blue</option>
                                                <option value="purple">Purple</option>
                                                <option value="orange">Orange</option>
                                            </select>
                                        </div>
                                    </div>
                                    <textarea
                                        value={item.description}
                                        onChange={(e) => {
                                            const newItems = [...settings.whyUs.items];
                                            newItems[idx].description = e.target.value;
                                            updateField("whyUs.items", newItems);
                                        }}
                                        rows={2}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 resize-none"
                                        placeholder="Deskripsi"
                                    />
                                    <div className="w-48">
                                        <IconPicker
                                            value={item.icon}
                                            onChange={(icon) => {
                                                const newItems = [...settings.whyUs.items];
                                                newItems[idx].icon = icon;
                                                updateField("whyUs.items", newItems);
                                            }}
                                            align="left"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </SectionCard>

            {/* --- Modals --- */}

            {/* Mission Modals */}
            <Modal isOpen={isAddMissionOpen} onClose={() => setIsAddMissionOpen(false)} title="Tambah Misi Baru">
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Judul Misi</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:blue-500"
                            placeholder="Contoh: Kolaborasi Industri"
                            value={newMission.title}
                            onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Warna Aksen</label>
                        <select
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                            value={newMission.color}
                            onChange={(e) => setNewMission({ ...newMission, color: e.target.value })}
                        >
                            <option value="blue">Blue</option>
                            <option value="green">Green</option>
                            <option value="purple">Purple</option>
                            <option value="orange">Orange</option>
                            <option value="red">Red</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Deskripsi</label>
                        <textarea
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                            placeholder="Deskripsi singkat..."
                            rows={3}
                            value={newMission.description}
                            onChange={(e) => setNewMission({ ...newMission, description: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Ikon</label>
                        <div className="w-full">
                            <IconPicker
                                value={newMission.icon}
                                onChange={(icon) => setNewMission({ ...newMission, icon })}
                                align="left"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            onClick={() => setIsAddMissionOpen(false)}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                        >
                            Batal
                        </button>
                        <button
                            onClick={saveNewMission}
                            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium"
                        >
                            Simpan Misi
                        </button>
                    </div>
                </div>
            </Modal>

            <ConfirmDialog
                isOpen={deleteMissionIndex !== null}
                onClose={() => setDeleteMissionIndex(null)}
                onConfirm={confirmDeleteMission}
                title="Hapus Misi?"
                message="Tindakan ini tidak dapat dibatalkan."
                variant="danger"
            />

            {/* Why Us Modals */}
            <Modal isOpen={isAddWhyUsOpen} onClose={() => setIsAddWhyUsOpen(false)} title="Tambah Keunggulan Baru">
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Judul Keunggulan</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:blue-500"
                            placeholder="Contoh: Mentor Ahli"
                            value={newWhyUs.title}
                            onChange={(e) => setNewWhyUs({ ...newWhyUs, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Warna Aksen</label>
                        <select
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                            value={newWhyUs.color}
                            onChange={(e) => setNewWhyUs({ ...newWhyUs, color: e.target.value })}
                        >
                            <option value="blue">Blue</option>
                            <option value="purple">Purple</option>
                            <option value="orange">Orange</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Deskripsi</label>
                        <textarea
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                            placeholder="Penjelasan singkat..."
                            rows={3}
                            value={newWhyUs.description}
                            onChange={(e) => setNewWhyUs({ ...newWhyUs, description: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Ikon</label>
                        <div className="w-full">
                            <IconPicker
                                value={newWhyUs.icon}
                                onChange={(icon) => setNewWhyUs({ ...newWhyUs, icon })}
                                align="left"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            onClick={() => setIsAddWhyUsOpen(false)}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                        >
                            Batal
                        </button>
                        <button
                            onClick={saveNewWhyUs}
                            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium"
                        >
                            Simpan Keunggulan
                        </button>
                    </div>
                </div>
            </Modal>

            <ConfirmDialog
                isOpen={deleteWhyUsIndex !== null}
                onClose={() => setDeleteWhyUsIndex(null)}
                onConfirm={confirmDeleteWhyUs}
                title="Hapus Keunggulan?"
                message="Item ini akan dihapus dari daftar."
                variant="danger"
            />
        </div>
    );
};
