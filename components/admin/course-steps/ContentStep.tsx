"use client";

import { useState, useRef } from "react";
import {
    Video,
    FileText,
    Link as LinkIcon,
    Upload,
    HelpCircle,
    Check,
    Loader2,
    ExternalLink,
    File,
    Play,
    Image as ImageIcon,
    X,
    Eye,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import TiptapEditor from "@/components/admin/editors/TiptapEditor";
import Modal from "@/components/ui/Modal";

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

interface ContentStepProps {
    modules: Module[];
    updateModuleLesson: (moduleIdx: number, lessonIdx: number, field: string, value: string) => void;
}

const contentTypeConfig = {
    video: { icon: Video, color: "from-blue-500 to-cyan-500", bgColor: "bg-blue-50 border-blue-200", label: "Video", description: "YouTube, Vimeo, atau upload video" },
    text: { icon: FileText, color: "from-emerald-500 to-teal-500", bgColor: "bg-emerald-50 border-emerald-200", label: "Artikel", description: "Tulis konten dengan editor rich text" },
    file: { icon: Upload, color: "from-purple-500 to-violet-500", bgColor: "bg-purple-50 border-purple-200", label: "File/PDF", description: "Upload dokumen pembelajaran" },
    link: { icon: LinkIcon, color: "from-orange-500 to-amber-500", bgColor: "bg-orange-50 border-orange-200", label: "Link Eksternal", description: "Tautan ke resource luar" },
    quiz: { icon: HelpCircle, color: "from-red-500 to-pink-500", bgColor: "bg-red-50 border-red-200", label: "Kuis", description: "Hubungkan dengan quiz yang ada" },
};

export default function ContentStep({ modules, updateModuleLesson }: ContentStepProps) {
    const [uploadingLesson, setUploadingLesson] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const { addToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeUpload, setActiveUpload] = useState<{ moduleIdx: number; lessonIdx: number } | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeUpload) return;

        const { moduleIdx, lessonIdx } = activeUpload;
        const lessonId = modules[moduleIdx].lessons[lessonIdx].id;
        setUploadingLesson(lessonId);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                const url = data.file?.url || data.url;
                updateModuleLesson(moduleIdx, lessonIdx, "content", url);
                addToast({ type: "success", title: "File berhasil diupload!", message: file.name });
            } else {
                addToast({ type: "error", title: "Gagal upload file" });
            }
        } catch {
            addToast({ type: "error", title: "Terjadi kesalahan" });
        } finally {
            setUploadingLesson(null);
            setActiveUpload(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const triggerFileUpload = (moduleIdx: number, lessonIdx: number) => {
        setActiveUpload({ moduleIdx, lessonIdx });
        fileInputRef.current?.click();
    };

    const getYouTubeEmbedUrl = (url: string) => {
        if (!url) return null;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]+)/);
        return match ? `https://www.youtube.com/embed/${match[1]}` : null;
    };

    if (modules.length === 0 || modules.every((m) => m.lessons.length === 0)) {
        return (
            <div className="space-y-6">
                <div className="pb-6 border-b border-slate-100">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        Konten Materi
                    </h2>
                    <p className="text-slate-500 mt-1">Upload konten untuk setiap materi pembelajaran</p>
                </div>
                <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="w-20 h-20 mx-auto bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6">
                        <FileText size={32} className="text-slate-400" />
                    </div>
                    <h3 className="font-bold text-xl text-slate-700 mb-2">Belum ada materi</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                        Tambahkan modul dan materi di langkah <strong>Kurikulum</strong> terlebih dahulu, lalu kembali ke sini untuk mengisi konten
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="pb-6 border-b border-slate-100">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Konten Materi
                </h2>
                <p className="text-slate-500 mt-1">
                    Upload atau tulis konten untuk setiap materi pembelajaran
                </p>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.mp4,.webm,.mov,image/*"
            />

            {/* Modules */}
            {modules.map((module, moduleIdx) => (
                <div key={module.id} className="space-y-5">
                    {/* Module Header */}
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/25">
                            {moduleIdx + 1}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800">
                                {module.title || `Modul ${moduleIdx + 1}`}
                            </h3>
                            <p className="text-sm text-slate-500">{module.lessons.length} materi</p>
                        </div>
                    </div>

                    {module.lessons.length === 0 ? (
                        <p className="text-sm text-slate-400 italic pl-16">Belum ada materi dalam modul ini</p>
                    ) : (
                        <div className="space-y-5 pl-16">
                            {module.lessons.map((lesson, lessonIdx) => {
                                const config = contentTypeConfig[lesson.contentType];
                                const Icon = config.icon;
                                const isUploading = uploadingLesson === lesson.id;
                                const embedUrl = lesson.contentType === "video" ? getYouTubeEmbedUrl(lesson.content || "") : null;

                                return (
                                    <div
                                        key={lesson.id}
                                        className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        {/* Lesson Header */}
                                        <div className={`px-6 py-4 border-b ${config.bgColor}`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${config.color} text-white flex items-center justify-center shadow-lg`}>
                                                    <Icon size={22} />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-slate-800 text-lg">
                                                        {lesson.title || `Materi ${lessonIdx + 1}`}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {config.description}
                                                    </p>
                                                </div>
                                                {lesson.content && (
                                                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-full text-xs font-bold">
                                                        <Check size={14} />
                                                        Konten Tersedia
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Content Input Area */}
                                        <div className="p-6">
                                            {lesson.contentType === "text" ? (
                                                <div className="space-y-3">
                                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                        <FileText size={16} className="text-emerald-500" />
                                                        Konten Artikel (Markdown/Rich Text)
                                                    </label>
                                                    <TiptapEditor
                                                        content={lesson.content || ""}
                                                        onChange={(content) => updateModuleLesson(moduleIdx, lessonIdx, "content", content)}
                                                        placeholder="Tulis konten pembelajaran di sini... Gunakan heading, list, bold, italic, dan lainnya..."
                                                    />
                                                </div>
                                            ) : lesson.contentType === "video" ? (
                                                <div className="space-y-4">
                                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                        <Video size={16} className="text-blue-500" />
                                                        URL Video (YouTube/Vimeo)
                                                    </label>
                                                    <div className="flex gap-3">
                                                        <input
                                                            type="url"
                                                            value={lesson.content || ""}
                                                            onChange={(e) => updateModuleLesson(moduleIdx, lessonIdx, "content", e.target.value)}
                                                            placeholder="https://youtube.com/watch?v=..."
                                                            className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition"
                                                        />
                                                        {lesson.content && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setPreviewUrl(lesson.content || null)}
                                                                className="px-4 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition font-medium flex items-center gap-2"
                                                            >
                                                                <Eye size={18} />
                                                                Preview
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Video Preview Thumbnail */}
                                                    {embedUrl && (
                                                        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
                                                            <iframe
                                                                src={embedUrl}
                                                                className="w-full h-full"
                                                                allowFullScreen
                                                                title="Video Preview"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : lesson.contentType === "link" ? (
                                                <div className="space-y-3">
                                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                        <LinkIcon size={16} className="text-orange-500" />
                                                        URL Resource Eksternal
                                                    </label>
                                                    <div className="flex gap-3">
                                                        <input
                                                            type="url"
                                                            value={lesson.content || ""}
                                                            onChange={(e) => updateModuleLesson(moduleIdx, lessonIdx, "content", e.target.value)}
                                                            placeholder="https://..."
                                                            className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition"
                                                        />
                                                        {lesson.content && (
                                                            <a
                                                                href={lesson.content}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="px-4 py-3 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition flex items-center gap-2"
                                                            >
                                                                <ExternalLink size={18} />
                                                                Buka
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : lesson.contentType === "file" ? (
                                                <div className="space-y-4">
                                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                        <File size={16} className="text-purple-500" />
                                                        Upload Dokumen
                                                    </label>
                                                    {lesson.content ? (
                                                        <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-2xl border border-purple-200">
                                                            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow">
                                                                <File size={24} className="text-purple-500" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-semibold text-slate-800 truncate">
                                                                    {lesson.content.split('/').pop()}
                                                                </p>
                                                                <p className="text-xs text-slate-500 mt-0.5">File berhasil diupload</p>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <a
                                                                    href={lesson.content}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="px-3 py-2 text-purple-600 bg-white rounded-lg text-sm font-medium hover:bg-purple-100 transition"
                                                                >
                                                                    Lihat
                                                                </a>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => triggerFileUpload(moduleIdx, lessonIdx)}
                                                                    className="px-3 py-2 text-slate-600 bg-white rounded-lg text-sm font-medium hover:bg-slate-100 transition"
                                                                >
                                                                    Ganti
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => triggerFileUpload(moduleIdx, lessonIdx)}
                                                            disabled={isUploading}
                                                            className="w-full py-10 bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-dashed border-purple-300 rounded-2xl hover:border-purple-400 hover:from-purple-100 hover:to-violet-100 transition flex flex-col items-center gap-3 text-slate-600 group"
                                                        >
                                                            {isUploading ? (
                                                                <Loader2 size={32} className="animate-spin text-purple-500" />
                                                            ) : (
                                                                <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center group-hover:scale-110 transition">
                                                                    <Upload size={28} className="text-purple-500" />
                                                                </div>
                                                            )}
                                                            <div className="text-center">
                                                                <p className="font-bold text-lg text-slate-700">
                                                                    {isUploading ? "Mengupload..." : "Klik untuk upload file"}
                                                                </p>
                                                                <p className="text-xs text-slate-400 mt-1">
                                                                    PDF, DOC, PPT, Excel, ZIP, Video (Max 50MB)
                                                                </p>
                                                            </div>
                                                        </button>
                                                    )}
                                                </div>
                                            ) : lesson.contentType === "quiz" ? (
                                                <div className="text-center py-8 bg-red-50/50 rounded-2xl border border-red-100">
                                                    <div className="w-16 h-16 mx-auto rounded-2xl bg-white shadow flex items-center justify-center mb-4">
                                                        <HelpCircle size={28} className="text-red-500" />
                                                    </div>
                                                    <p className="text-slate-600 mb-4">
                                                        Hubungkan dengan kuis yang sudah ada
                                                    </p>
                                                    <button
                                                        type="button"
                                                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 transition"
                                                    >
                                                        Pilih Kuis
                                                    </button>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ))}

            {/* Video Preview Modal */}
            <Modal
                isOpen={!!previewUrl}
                onClose={() => setPreviewUrl(null)}
                title="Preview Video"
                size="lg"
            >
                {previewUrl && (
                    <div className="aspect-video rounded-xl overflow-hidden bg-black">
                        <iframe
                            src={getYouTubeEmbedUrl(previewUrl) || previewUrl}
                            className="w-full h-full"
                            allowFullScreen
                            title="Video Preview"
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
}
