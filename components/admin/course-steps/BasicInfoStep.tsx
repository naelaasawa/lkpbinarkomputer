"use client";

import { useState } from "react";
import Input, { Textarea, Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { Plus, Image as ImageIcon, Upload, Loader2, X, Check } from "lucide-react";

interface Category {
    id: string;
    name: string;
}

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

interface BasicInfoStepProps {
    data: CourseData;
    onChange: (data: CourseData) => void;
    onTitleChange: (title: string) => void;
    categories: Category[];
    onCategoryAdded: () => void;
}

export default function BasicInfoStep({
    data,
    onChange,
    onTitleChange,
    categories,
    onCategoryAdded,
}: BasicInfoStepProps) {
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const { addToast } = useToast();

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;

        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newCategoryName,
                    color: "bg-blue-100 text-blue-800",
                }),
            });

            if (res.ok) {
                addToast({
                    type: "success",
                    title: "Kategori ditambahkan!",
                    message: newCategoryName,
                });
                setNewCategoryName("");
                setShowCategoryModal(false);
                onCategoryAdded();
            } else {
                addToast({
                    type: "error",
                    title: "Gagal menambahkan kategori",
                });
            }
        } catch {
            addToast({
                type: "error",
                title: "Terjadi kesalahan",
            });
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setUploadError("Ukuran file maksimal 2MB");
            addToast({ type: "error", title: "File terlalu besar", message: "Maksimal 2MB" });
            return;
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setUploadError("Hanya file gambar yang diperbolehkan");
            addToast({ type: "error", title: "Format tidak valid", message: "Pilih file gambar" });
            return;
        }

        setUploading(true);
        setUploadError(null);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const responseData = await res.json();
                const url = responseData.file?.url || responseData.url;
                onChange({ ...data, imageUrl: url });
                addToast({
                    type: "success",
                    title: "Gambar berhasil diupload!",
                });
            } else {
                const errData = await res.json().catch(() => ({}));
                setUploadError(errData.error || "Gagal upload gambar");
                addToast({
                    type: "error",
                    title: "Gagal upload gambar",
                    message: errData.error,
                });
            }
        } catch (err) {
            setUploadError("Terjadi kesalahan saat upload");
            addToast({
                type: "error",
                title: "Terjadi kesalahan upload",
            });
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        onChange({ ...data, imageUrl: undefined });
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="pb-6 border-b border-slate-100">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Informasi Dasar
                </h2>
                <p className="text-slate-500 mt-2">
                    Mulai dengan detail penting tentang kursus Anda
                </p>
            </div>

            {/* Course Thumbnail */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-6 border-2 border-dashed border-slate-200">
                <label className="block text-sm font-semibold text-slate-700 mb-4">
                    Thumbnail Kursus
                </label>
                <div className="flex items-start gap-6">
                    {/* Preview */}
                    <div className="relative w-48 h-28 rounded-xl bg-slate-200 overflow-hidden flex-shrink-0 group">
                        {uploading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 z-10">
                                <Loader2 size={32} className="animate-spin text-white mb-2" />
                                <span className="text-xs text-white font-medium">Uploading...</span>
                            </div>
                        ) : null}

                        {data.imageUrl ? (
                            <>
                                <img
                                    src={data.imageUrl}
                                    alt="Thumbnail"
                                    className="w-full h-full object-cover"
                                    onError={() => onChange({ ...data, imageUrl: "" })}
                                />
                                {/* Success indicator */}
                                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                                    <Check size={14} className="text-white" />
                                </div>
                                {/* Remove button on hover */}
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 left-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={14} className="text-white" />
                                </button>
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <ImageIcon size={32} />
                            </div>
                        )}
                    </div>

                    {/* Upload Button */}
                    <div className="flex-1">
                        <label className={`
                            inline-flex items-center gap-2 px-5 py-3 rounded-xl cursor-pointer transition
                            ${uploading
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-white border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50"
                            }
                        `}>
                            {uploading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Upload size={18} className="text-blue-500" />
                            )}
                            <span className="font-medium text-slate-700">
                                {uploading ? "Mengupload..." : data.imageUrl ? "Ganti Gambar" : "Pilih Gambar"}
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={uploading}
                            />
                        </label>

                        {/* Error message */}
                        {uploadError && (
                            <p className="text-xs text-red-500 mt-2 font-medium flex items-center gap-1">
                                <X size={12} />
                                {uploadError}
                            </p>
                        )}

                        {/* Success message */}
                        {data.imageUrl && !uploadError && (
                            <p className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1">
                                <Check size={12} />
                                Gambar berhasil diupload
                            </p>
                        )}

                        <p className="text-xs text-slate-400 mt-2">
                            Rekomendasi: 1280×720px, format JPG/PNG, max 2MB
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
                <Input
                    label="Judul Kursus *"
                    value={data.title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Contoh: Belajar Microsoft Word Lengkap"
                />

                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">
                        URL Slug
                    </label>
                    <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-500 transition">
                        <span className="px-4 py-3.5 text-sm text-slate-500 font-medium bg-slate-100">
                            /courses/
                        </span>
                        <input
                            type="text"
                            value={data.slug}
                            onChange={(e) => onChange({ ...data, slug: e.target.value })}
                            className="flex-1 px-2 py-3.5 bg-transparent focus:outline-none text-slate-700 font-medium"
                            placeholder="url-kursus"
                        />
                    </div>
                </div>

                <Textarea
                    label="Deskripsi Singkat *"
                    value={data.shortDescription}
                    onChange={(e) =>
                        onChange({ ...data, shortDescription: e.target.value })
                    }
                    rows={3}
                    maxLength={160}
                    placeholder="Deskripsi singkat tentang kursus ini..."
                    hint={`${data.shortDescription.length}/160 karakter`}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-2">
                            Kategori *
                        </label>
                        <div className="flex gap-2">
                            <select
                                value={data.categoryId}
                                onChange={(e) =>
                                    onChange({ ...data, categoryId: e.target.value })
                                }
                                className="flex-1 px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-medium"
                            >
                                <option value="">Pilih Kategori</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => setShowCategoryModal(true)}
                                className="p-3.5 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>

                    <Select
                        label="Level *"
                        value={data.level}
                        onChange={(e) => onChange({ ...data, level: e.target.value })}
                        options={[
                            { value: "Beginner", label: "Pemula" },
                            { value: "Intermediate", label: "Menengah" },
                            { value: "Advanced", label: "Mahir" },
                        ]}
                    />
                </div>

                <Select
                    label="Bahasa"
                    value={data.language}
                    onChange={(e) => onChange({ ...data, language: e.target.value })}
                    options={[
                        { value: "id", label: "Indonesia" },
                        { value: "en", label: "English" },
                    ]}
                />
            </div>

            {/* Category Modal */}
            <Modal
                isOpen={showCategoryModal}
                onClose={() => setShowCategoryModal(false)}
                title="Tambah Kategori Baru"
                size="sm"
            >
                <div className="space-y-4">
                    <Input
                        label="Nama Kategori"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Contoh: Microsoft Office"
                    />
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => setShowCategoryModal(false)}
                            className="flex-1"
                        >
                            Batal
                        </Button>
                        <Button onClick={handleCreateCategory} className="flex-1">
                            Tambah
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
