
import React, { useState } from "react";
import { BookOpen, Monitor, Plus, Trash2 } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { IconPicker } from "./IconPicker";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface ProgramsFacilitiesFormProps {
    settings: any;
    updateField: (path: string, value: any) => void;
}

export const ProgramsFacilitiesForm = ({ settings, updateField }: ProgramsFacilitiesFormProps) => {
    // --- Delete States ---
    const [deleteProgramIndex, setDeleteProgramIndex] = useState<number | null>(null);
    const [deleteFacilityIndex, setDeleteFacilityIndex] = useState<number | null>(null);

    // --- Add Program State ---
    const [isAddProgramOpen, setIsAddProgramOpen] = useState(false);
    const [newProgram, setNewProgram] = useState({
        title: "",
        description: "",
        color: "blue"
    });

    // --- Add Facility State ---
    const [isAddFacilityOpen, setIsAddFacilityOpen] = useState(false);
    const [newFacility, setNewFacility] = useState({
        label: "",
        icon: "Monitor",
        color: "blue"
    });

    // --- Generic Helper for Inline Updates ---
    const updateItem = (path: string, index: number, field: string, value: any) => {
        const pathParts = path.split('.');
        const parent = pathParts.reduce((acc, part) => acc[part], settings);
        const newArray = [...parent];
        newArray[index] = { ...newArray[index], [field]: value };
        updateField(path, newArray);
    };

    // --- Program Handlers ---
    const handleAddProgram = () => {
        setNewProgram({ title: "", description: "", color: "blue" });
        setIsAddProgramOpen(true);
    };

    const saveNewProgram = () => {
        if (!newProgram.title) return alert("Nama program harus diisi");
        const currentItems = settings.programs.items || [];
        updateField("programs.items", [...currentItems, newProgram]);
        setIsAddProgramOpen(false);
    };

    const confirmDeleteProgram = () => {
        if (deleteProgramIndex === null) return;
        const newItems = settings.programs.items.filter((_: any, i: number) => i !== deleteProgramIndex);
        updateField("programs.items", newItems);
        setDeleteProgramIndex(null);
    };

    // --- Facility Handlers ---
    const handleAddFacility = () => {
        setNewFacility({ label: "", icon: "Monitor", color: "blue" });
        setIsAddFacilityOpen(true);
    };

    const saveNewFacility = () => {
        if (!newFacility.label) return alert("Nama fasilitas harus diisi");
        const currentItems = settings.facilities.items || [];
        updateField("facilities.items", [...currentItems, newFacility]);
        setIsAddFacilityOpen(false);
    };

    const confirmDeleteFacility = () => {
        if (deleteFacilityIndex === null) return;
        const newItems = settings.facilities.items.filter((_: any, i: number) => i !== deleteFacilityIndex);
        updateField("facilities.items", newItems);
        setDeleteFacilityIndex(null);
    };

    return (
        <div className="space-y-6">
            {/* Programs Section */}
            <SectionCard
                title="Program Kami"
                description="Daftar program kursus yang tersedia."
                icon={BookOpen}
                iconColor="text-blue-500"
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1">Judul Seksi</label>
                        <input
                            type="text"
                            value={settings.programs.title}
                            onChange={(e) => updateField("programs.title", e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1">Sub Judul</label>
                        <input
                            type="text"
                            value={settings.programs.subtitle}
                            onChange={(e) => updateField("programs.subtitle", e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="flex items-center justify-between border-t border-dashed pt-4">
                        <label className="text-sm font-semibold text-slate-700">Daftar Program</label>
                        <button
                            onClick={handleAddProgram}
                            className="text-xs flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 transition-colors"
                        >
                            <Plus size={14} /> Tambah
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {settings.programs.items.map((item: any, idx: number) => (
                            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative">
                                <button
                                    onClick={() => setDeleteProgramIndex(idx)}
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
                                                onChange={(e) => updateItem("programs.items", idx, "title", e.target.value)}
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold text-sm focus:outline-none focus:border-blue-500"
                                                placeholder="Nama Program"
                                            />
                                        </div>
                                        <div className="w-32">
                                            <select
                                                value={item.color}
                                                onChange={(e) => updateItem("programs.items", idx, "color", e.target.value)}
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
                                        onChange={(e) => updateItem("programs.items", idx, "description", e.target.value)}
                                        rows={2}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-blue-500 resize-none"
                                        placeholder="Deskripsi Singkat"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </SectionCard>

            {/* Facilities Section */}
            <SectionCard
                title="Fasilitas Belajar"
                description="Sarana dan prasarana yang tersedia."
                icon={Monitor}
                iconColor="text-orange-500"
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1">Judul Seksi</label>
                        <input
                            type="text"
                            value={settings.facilities.title}
                            onChange={(e) => updateField("facilities.title", e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1">Sub Judul</label>
                        <input
                            type="text"
                            value={settings.facilities.subtitle}
                            onChange={(e) => updateField("facilities.subtitle", e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="flex items-center justify-between border-t border-dashed pt-4">
                        <label className="text-sm font-semibold text-slate-700">Daftar Fasilitas</label>
                        <button
                            onClick={handleAddFacility}
                            className="text-xs flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 transition-colors"
                        >
                            <Plus size={14} /> Tambah
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {settings.facilities.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-2 items-center p-2 bg-slate-50 rounded-lg border border-slate-200 group">
                                <div className="w-10">
                                    <IconPicker
                                        value={item.icon}
                                        onChange={(icon) => updateItem("facilities.items", idx, "icon", icon)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={item.label}
                                        onChange={(e) => updateItem("facilities.items", idx, "label", e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                        placeholder="Nama Fasilitas"
                                    />
                                </div>
                                <div className="w-24">
                                    <select
                                        value={item.color}
                                        onChange={(e) => updateItem("facilities.items", idx, "color", e.target.value)}
                                        className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                                    >
                                        <option value="blue">Blue</option>
                                        <option value="orange">Orange</option>
                                        <option value="purple">Purple</option>
                                        <option value="green">Green</option>
                                        <option value="red">Red</option>
                                    </select>
                                </div>
                                <button
                                    onClick={() => setDeleteFacilityIndex(idx)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </SectionCard>

            {/* --- Modals --- */}

            {/* Add Program Modal */}
            <Modal isOpen={isAddProgramOpen} onClose={() => setIsAddProgramOpen(false)} title="Tambah Program Kursus">
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Nama Program</label>
                        <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:blue-500"
                            placeholder="Contoh: Web Development" value={newProgram.title}
                            onChange={(e) => setNewProgram({ ...newProgram, title: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Warna Aksen</label>
                        <select className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                            value={newProgram.color} onChange={(e) => setNewProgram({ ...newProgram, color: e.target.value })}>
                            <option value="blue">Blue</option> <option value="purple">Purple</option> <option value="orange">Orange</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Deskripsi Singkat</label>
                        <textarea className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                            placeholder="Deskripsi..." rows={3} value={newProgram.description}
                            onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button onClick={() => setIsAddProgramOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Batal</button>
                        <button onClick={saveNewProgram} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium">Simpan</button>
                    </div>
                </div>
            </Modal>
            <ConfirmDialog isOpen={deleteProgramIndex !== null} onClose={() => setDeleteProgramIndex(null)}
                onConfirm={confirmDeleteProgram} title="Hapus Program?" message="Tindakan ini tidak dapat dibatalkan." variant="danger" />

            {/* Add Facility Modal */}
            <Modal isOpen={isAddFacilityOpen} onClose={() => setIsAddFacilityOpen(false)} title="Tambah Fasilitas">
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Nama Fasilitas</label>
                        <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:blue-500"
                            placeholder="Contoh: Komputer i7" value={newFacility.label}
                            onChange={(e) => setNewFacility({ ...newFacility, label: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Warna Aksen</label>
                        <select className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                            value={newFacility.color} onChange={(e) => setNewFacility({ ...newFacility, color: e.target.value })}>
                            <option value="blue">Blue</option> <option value="orange">Orange</option>
                            <option value="purple">Purple</option> <option value="green">Green</option> <option value="red">Red</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Ikon</label>
                        <div className="w-full">
                            <IconPicker value={newFacility.icon} onChange={(icon) => setNewFacility({ ...newFacility, icon })} align="left" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button onClick={() => setIsAddFacilityOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Batal</button>
                        <button onClick={saveNewFacility} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium">Simpan</button>
                    </div>
                </div>
            </Modal>
            <ConfirmDialog isOpen={deleteFacilityIndex !== null} onClose={() => setDeleteFacilityIndex(null)}
                onConfirm={confirmDeleteFacility} title="Hapus Fasilitas?" message="Tindakan ini tidak dapat dibatalkan." variant="danger" />

        </div>
    );
};
