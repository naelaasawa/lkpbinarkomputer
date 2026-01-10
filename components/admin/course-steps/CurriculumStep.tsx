"use client";

import { useState, useRef } from "react";
import {
    Plus,
    Trash2,
    GripVertical,
    Video,
    FileText,
    Link as LinkIcon,
    Upload,
    HelpCircle,
    ChevronDown,
    ChevronUp,
    Play,
    FileUp,
    Loader2,
    Eye,
    BookOpen,
    Check,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface Lesson {
    id: string;
    title: string;
    contentType: "video" | "text" | "file" | "link" | "quiz";
    content?: string;
    order: number;
}

interface Module {
    id: string;
    title: string;
    description: string;
    order: number;
    lessons: Lesson[];
}

interface PDFStructure {
    title: string;
    totalPages: number;
    modules: { title: string; lessons: { title: string; type: string; content?: string }[] }[];
}

interface CurriculumStepProps {
    modules: Module[];
    setModules: (modules: Module[]) => void;
}

const contentTypeIcons = {
    video: Video,
    text: FileText,
    file: Upload,
    link: LinkIcon,
    quiz: HelpCircle,
};

const contentTypeLabels = {
    video: "Video",
    text: "Artikel",
    file: "File",
    link: "Link",
    quiz: "Kuis",
};

const contentTypeColors = {
    video: "text-blue-500 bg-blue-50",
    text: "text-emerald-500 bg-emerald-50",
    file: "text-purple-500 bg-purple-50",
    link: "text-orange-500 bg-orange-50",
    quiz: "text-red-500 bg-red-50",
};

export default function CurriculumStep({ modules, setModules }: CurriculumStepProps) {
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
    const [deleteTarget, setDeleteTarget] = useState<{ type: "module" | "lesson"; moduleIdx: number; lessonIdx?: number } | null>(null);
    const [uploading, setUploading] = useState(false);
    const [pdfPreview, setPdfPreview] = useState<{ structure: PDFStructure; url: string } | null>(null);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addToast } = useToast();

    const toggleModule = (moduleId: string) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(moduleId)) {
            newExpanded.delete(moduleId);
        } else {
            newExpanded.add(moduleId);
        }
        setExpandedModules(newExpanded);
    };

    const addModule = () => {
        const newModule: Module = {
            id: `mod-${Date.now()}`,
            title: "",
            description: "",
            order: modules.length,
            lessons: [],
        };
        setModules([...modules, newModule]);
        setExpandedModules(new Set([...expandedModules, newModule.id]));
        addToast({ type: "success", title: "Modul baru ditambahkan" });
    };

    const updateModule = (index: number, field: string, value: string) => {
        const newModules = [...modules];
        newModules[index] = { ...newModules[index], [field]: value };
        setModules(newModules);
    };

    const deleteModule = (index: number) => {
        const newModules = modules.filter((_, i) => i !== index);
        setModules(newModules);
        setDeleteTarget(null);
        addToast({ type: "success", title: "Modul dihapus" });
    };

    const addLesson = (moduleIndex: number) => {
        const newModules = [...modules];
        const newLesson: Lesson = {
            id: `les-${Date.now()}`,
            title: "",
            contentType: "video",
            order: newModules[moduleIndex].lessons.length,
        };
        newModules[moduleIndex].lessons.push(newLesson);
        setModules(newModules);
    };

    const updateLesson = (moduleIndex: number, lessonIndex: number, field: string, value: string) => {
        const newModules = [...modules];
        newModules[moduleIndex].lessons[lessonIndex] = {
            ...newModules[moduleIndex].lessons[lessonIndex],
            [field]: value,
        };
        setModules(newModules);
    };

    const deleteLesson = (moduleIndex: number, lessonIndex: number) => {
        const newModules = [...modules];
        newModules[moduleIndex].lessons = newModules[moduleIndex].lessons.filter((_, i) => i !== lessonIndex);
        setModules(newModules);
        setDeleteTarget(null);
        addToast({ type: "success", title: "Materi dihapus" });
    };

    // PDF/Word Upload Handler
    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf" && file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            addToast({ type: "error", title: "Format tidak valid", message: "Hanya file PDF atau Word (.docx) yang diperbolehkan" });
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            // Use dedicated upload route with parsing
            const res = await fetch("/api/upload-pdf", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                if (data.structure) {
                    // Transform structure for preview
                    const structure = {
                        title: data.structure.title || file.name.replace(/\.[^/.]+$/, ""),
                        totalPages: data.structure.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0,
                        modules: data.structure.modules || [],
                    };

                    setPdfPreview({
                        structure,
                        url: data.filepath || `/files/${data.filename}`,
                    });
                    setShowPdfModal(true);
                    addToast({
                        type: "success",
                        title: "Dokumen berhasil dianalisis!",
                        message: `${structure.modules.length} modul terdeteksi`
                    });
                } else {
                    addToast({ type: "warning", title: "Struktur tidak terdeteksi", message: "Dokumen tidak memiliki struktur modul yang jelas" });
                }
            } else {
                const errData = await res.json().catch(() => ({}));
                addToast({ type: "error", title: "Gagal upload dokumen", message: errData.error });
            }
        } catch (err) {
            console.error(err);
            addToast({ type: "error", title: "Terjadi kesalahan" });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // Apply PDF Structure to Modules
    const applyPdfStructure = () => {
        if (!pdfPreview?.structure?.modules) return;

        const newModules: Module[] = pdfPreview.structure.modules.map((m, idx) => ({
            id: `mod-${Date.now()}-${idx}`,
            title: m.title,
            description: "",
            order: modules.length + idx,
            lessons: m.lessons.map((l, lIdx) => ({
                id: `les-${Date.now()}-${idx}-${lIdx}`,
                title: l.title,
                contentType: (l.content ? "text" : "file") as any,
                content: l.content || pdfPreview.url,
                order: lIdx,
            })),
        }));

        setModules([...modules, ...newModules]);
        const newExpanded = new Set(expandedModules);
        newModules.forEach((m) => newExpanded.add(m.id));
        setExpandedModules(newExpanded);
        setShowPdfModal(false);
        setPdfPreview(null);
        addToast({ type: "success", title: "Struktur PDF diterapkan!", message: `${newModules.length} modul ditambahkan` });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="pb-6 border-b border-slate-100">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Kurikulum
                </h2>
                <p className="text-slate-500 mt-1">
                    Susun struktur modul dan materi pembelajaran
                </p>
            </div>

            {/* PDF Upload Area */}
            <div className="bg-gradient-to-br from-violet-50 to-purple-50/30 rounded-2xl p-6 border-2 border-dashed border-violet-200">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                        <FileUp size={24} className="text-violet-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 mb-1">Import dari Dokumen</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Upload file PDF atau Word (.docx) dan sistem akan otomatis mendeteksi struktur modul & materi
                        </p>
                        <div className="flex items-center gap-3">
                            <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl cursor-pointer hover:bg-violet-700 transition font-medium text-sm">
                                {uploading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Menganalisis...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={18} />
                                        Pilih File
                                    </>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    onChange={handlePdfUpload}
                                    className="hidden"
                                    disabled={uploading}
                                />
                            </label>
                            <span className="text-xs text-slate-400">
                                Contoh: Silabus, Materi, Modul Pembelajaran
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modules List */}
            <div className="space-y-4">
                {modules.map((module, moduleIdx) => {
                    const isExpanded = expandedModules.has(module.id);
                    const Icon = isExpanded ? ChevronUp : ChevronDown;

                    return (
                        <div
                            key={module.id}
                            className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition"
                        >
                            {/* Module Header */}
                            <div className="bg-gradient-to-r from-slate-50 to-white p-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 text-slate-300 cursor-grab hover:text-slate-400">
                                        <GripVertical size={20} />
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                                        {moduleIdx + 1}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="text"
                                            value={module.title}
                                            onChange={(e) => updateModule(moduleIdx, "title", e.target.value)}
                                            placeholder="Judul Modul"
                                            className="w-full px-3 py-2 bg-transparent border-b-2 border-transparent focus:border-blue-500 font-semibold text-slate-800 focus:outline-none transition"
                                        />
                                        <input
                                            type="text"
                                            value={module.description}
                                            onChange={(e) => updateModule(moduleIdx, "description", e.target.value)}
                                            placeholder="Deskripsi singkat (opsional)"
                                            className="w-full px-3 py-1 text-sm text-slate-500 bg-transparent focus:outline-none"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                                            {module.lessons.length} materi
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => toggleModule(module.id)}
                                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                        >
                                            <Icon size={20} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeleteTarget({ type: "module", moduleIdx })}
                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Lessons */}
                            {isExpanded && (
                                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                                    <div className="space-y-3">
                                        {module.lessons.map((lesson, lessonIdx) => {
                                            const LessonIcon = contentTypeIcons[lesson.contentType];
                                            const colorClass = contentTypeColors[lesson.contentType];

                                            return (
                                                <div
                                                    key={lesson.id}
                                                    className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 group"
                                                >
                                                    <div className="text-slate-200 cursor-grab">
                                                        <GripVertical size={16} />
                                                    </div>
                                                    <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0`}>
                                                        {LessonIcon && <LessonIcon size={16} />}
                                                    </div>
                                                    <span className="text-xs text-slate-400 font-mono">
                                                        {moduleIdx + 1}.{lessonIdx + 1}
                                                    </span>
                                                    <input
                                                        type="text"
                                                        value={lesson.title}
                                                        onChange={(e) => updateLesson(moduleIdx, lessonIdx, "title", e.target.value)}
                                                        placeholder="Judul Materi"
                                                        className="flex-1 px-3 py-2 bg-slate-50 rounded-lg text-sm focus:outline-none focus:bg-slate-100 transition"
                                                    />
                                                    <select
                                                        value={lesson.contentType}
                                                        onChange={(e) => updateLesson(moduleIdx, lessonIdx, "contentType", e.target.value)}
                                                        className="px-3 py-2 text-xs bg-slate-50 rounded-lg border-none focus:outline-none font-medium"
                                                    >
                                                        {Object.entries(contentTypeLabels).map(([value, label]) => (
                                                            <option key={value} value={value}>
                                                                {label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteTarget({ type: "lesson", moduleIdx, lessonIdx })}
                                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => addLesson(moduleIdx)}
                                        className="mt-3 w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition flex items-center justify-center gap-2 text-sm font-medium"
                                    >
                                        <Plus size={18} />
                                        Tambah Materi
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Add Module Button */}
            <button
                type="button"
                onClick={addModule}
                className="w-full py-6 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/30 transition flex items-center justify-center gap-3 font-semibold"
            >
                <Plus size={24} />
                Tambah Modul Baru
            </button>

            {/* Empty State */}
            {modules.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-2xl">
                    <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                        <Play size={24} className="text-slate-400" />
                    </div>
                    <h3 className="font-semibold text-slate-700 mb-2">Belum ada modul</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto">
                        Mulai dengan menambahkan modul pertama atau import dari PDF
                    </p>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => {
                    if (deleteTarget?.type === "module") {
                        deleteModule(deleteTarget.moduleIdx);
                    } else if (deleteTarget?.type === "lesson" && deleteTarget.lessonIdx !== undefined) {
                        deleteLesson(deleteTarget.moduleIdx, deleteTarget.lessonIdx);
                    }
                }}
                title={deleteTarget?.type === "module" ? "Hapus Modul?" : "Hapus Materi?"}
                message={
                    deleteTarget?.type === "module"
                        ? "Semua materi dalam modul ini akan ikut terhapus."
                        : "Materi ini akan dihapus secara permanen."
                }
                confirmText="Hapus"
                variant="danger"
            />

            {/* PDF Preview Modal */}
            <Modal
                isOpen={showPdfModal}
                onClose={() => {
                    setShowPdfModal(false);
                    setPdfPreview(null);
                }}
                title="Preview Struktur Dokumen"
                size="lg"
            >
                {pdfPreview && (
                    <div className="space-y-6">
                        {/* PDF Info */}
                        <div className="flex items-center gap-4 p-4 bg-violet-50 rounded-xl">
                            <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center">
                                <FileText size={24} className="text-violet-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">{pdfPreview.structure.title}</h4>
                                <p className="text-sm text-slate-500">
                                    {pdfPreview.structure.totalPages} halaman • {pdfPreview.structure.modules.length} modul terdeteksi
                                </p>
                            </div>
                            <a
                                href={pdfPreview.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-auto p-2 text-violet-600 hover:bg-violet-100 rounded-lg transition"
                            >
                                <Eye size={20} />
                            </a>
                        </div>

                        {/* Structure Preview */}
                        <div className="max-h-80 overflow-y-auto space-y-3">
                            {pdfPreview.structure.modules.length > 0 ? (
                                pdfPreview.structure.modules.map((mod, idx) => (
                                    <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                                        <div className="flex items-center gap-3 p-3 bg-slate-50">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                                                {idx + 1}
                                            </div>
                                            <span className="font-semibold text-slate-800">{mod.title}</span>
                                            <span className="ml-auto text-xs text-slate-400">{mod.lessons.length} materi</span>
                                        </div>
                                        {mod.lessons.length > 0 && (
                                            <div className="p-3 space-y-2">
                                                {mod.lessons.slice(0, 5).map((les, lIdx) => (
                                                    <div key={lIdx} className="flex items-center gap-2 text-sm text-slate-600">
                                                        <BookOpen size={14} className="text-slate-400" />
                                                        {les.title}
                                                    </div>
                                                ))}
                                                {mod.lessons.length > 5 && (
                                                    <p className="text-xs text-slate-400 pl-6">
                                                        +{mod.lessons.length - 5} materi lainnya
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <p className="mb-2">Tidak ada struktur modul yang terdeteksi</p>
                                    <p className="text-sm">PDF akan disimpan sebagai 1 modul utama</p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-slate-200">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setShowPdfModal(false);
                                    setPdfPreview(null);
                                }}
                                className="flex-1"
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={applyPdfStructure}
                                icon={<Check size={18} />}
                                className="flex-1"
                            >
                                Terapkan Struktur
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
