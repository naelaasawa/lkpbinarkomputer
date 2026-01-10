"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronRight,
    ChevronLeft,
    Check,
    Save,
    Rocket,
    FileText,
    BookOpen,
    Settings,
    DollarSign,
    ClipboardCheck,
    X,
    Loader2,
    Upload,
    HelpCircle,
    Sparkles,
} from "lucide-react";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Button from "@/components/ui/Button";

// Step Components
import BasicInfoStep from "@/components/admin/course-steps/BasicInfoStep";
import DescriptionStep from "@/components/admin/course-steps/DescriptionStep";
import CurriculumStep from "@/components/admin/course-steps/CurriculumStep";
import ContentStep from "@/components/admin/course-steps/ContentStep";
import AssessmentStep from "@/components/admin/course-steps/AssessmentStep";
import SettingsStep from "@/components/admin/course-steps/SettingsStep";
import PricingStep from "@/components/admin/course-steps/PricingStep";
import ReviewStep from "@/components/admin/course-steps/ReviewStep";

// Types
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

interface SettingsData {
    visibility: string;
    enrollmentType: string;
    completionRule: string;
    certificateEnabled: boolean;
}

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

// Steps Configuration
const STEPS = [
    { id: 1, name: "Info Dasar", icon: FileText, required: true },
    { id: 2, name: "Deskripsi", icon: BookOpen, required: true },
    { id: 3, name: "Kurikulum", icon: ClipboardCheck, required: true },
    { id: 4, name: "Konten", icon: Upload, required: false },
    { id: 5, name: "Asesmen", icon: HelpCircle, required: false },
    { id: 6, name: "Pengaturan", icon: Settings, required: true },
    { id: 7, name: "Harga", icon: DollarSign, required: false },
    { id: 8, name: "Review", icon: Rocket, required: true },
];

interface CourseBuilderProps {
    mode: "create" | "edit";
    initialData?: any;
}

function CourseBuilderContent({ mode, initialData }: CourseBuilderProps) {
    const router = useRouter();
    const { addToast } = useToast();

    const [currentStep, setCurrentStep] = useState(1);
    const [quickPublish, setQuickPublish] = useState(false);
    const [loading, setLoading] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // State
    const [courseData, setCourseData] = useState<CourseData>({
        title: "",
        slug: "",
        shortDescription: "",
        categoryId: "",
        level: "Beginner",
        language: "id",
        imageUrl: "",
        fullDescription: "",
        whatYouLearn: ["", "", ""],
        targetAudience: "",
        prerequisites: "",
        price: 0,
    });

    const [settings, setSettings] = useState<SettingsData>({
        visibility: "draft",
        enrollmentType: "open",
        completionRule: "manual",
        certificateEnabled: false,
    });

    const [modules, setModules] = useState<Module[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            setCategories(data);
        } catch (err) {
            console.error("Failed to fetch categories", err);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Load initial data for edit mode
    useEffect(() => {
        if (mode === "edit" && initialData) {
            let wyl = ["", "", ""];
            try {
                wyl = typeof initialData.whatYouLearn === "string"
                    ? JSON.parse(initialData.whatYouLearn)
                    : initialData.whatYouLearn || [];
            } catch { }

            setCourseData({
                title: initialData.title || "",
                slug: initialData.slug || "",
                shortDescription: initialData.shortDescription || initialData.description || "",
                categoryId: initialData.categoryId || "",
                level: initialData.level || "Beginner",
                language: initialData.language || "id",
                imageUrl: initialData.imageUrl || "",
                fullDescription: initialData.fullDescription || initialData.description || "",
                whatYouLearn: wyl,
                targetAudience: initialData.targetAudience || "",
                prerequisites: initialData.prerequisites || "",
                price: Number(initialData.price) || 0,
            });

            if (initialData.modules) {
                setModules(initialData.modules.map((m: any) => ({
                    id: m.id,
                    title: m.title,
                    description: m.description || "",
                    order: m.order,
                    lessons: m.lessons ? m.lessons.map((l: any) => ({
                        id: l.id,
                        title: l.title,
                        contentType: l.type || "video",
                        content: l.contentUrl || "",
                        order: l.order,
                    })) : [],
                })));
            }

            setSettings({
                visibility: initialData.published ? "public" : "draft",
                enrollmentType: initialData.enrollmentType || "open",
                completionRule: initialData.completionRule || "manual",
                certificateEnabled: initialData.certificateEnabled || false,
            });
        }
    }, [mode, initialData]);

    // Track changes
    useEffect(() => {
        setHasChanges(true);
    }, [courseData, settings, modules]);

    // Handlers
    const handleTitleChange = (title: string) => {
        setCourseData({
            ...courseData,
            title,
            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        });
    };

    const updateModuleLesson = (moduleIdx: number, lessonIdx: number, field: string, value: string) => {
        const newModules = [...modules];
        newModules[moduleIdx].lessons[lessonIdx] = {
            ...newModules[moduleIdx].lessons[lessonIdx],
            [field]: value,
        };
        setModules(newModules);
    };

    const visibleSteps = quickPublish
        ? STEPS.filter((s) => s.id <= 3 || s.id === 8)
        : STEPS;

    const handleNext = () => {
        if (quickPublish && currentStep === 3) {
            setCurrentStep(8);
        } else {
            setCurrentStep(Math.min(currentStep + 1, visibleSteps.length));
        }
    };

    const handleBack = () => {
        if (quickPublish && currentStep === 8) {
            setCurrentStep(3);
        } else {
            setCurrentStep(Math.max(currentStep - 1, 1));
        }
    };

    const handleSaveDraft = async () => {
        setSavingDraft(true);
        try {
            const payload = buildPayload();
            payload.visibility = "draft";

            const res = await fetch(mode === "create" ? "/api/courses" : `/api/courses/${initialData?.id}`, {
                method: mode === "create" ? "POST" : "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                addToast({ type: "success", title: "Draft tersimpan!" });
                setHasChanges(false);
            } else {
                addToast({ type: "error", title: "Gagal menyimpan draft" });
            }
        } catch {
            addToast({ type: "error", title: "Terjadi kesalahan" });
        } finally {
            setSavingDraft(false);
        }
    };

    const buildPayload = () => ({
        ...courseData,
        description: courseData.shortDescription,
        isPublished: settings.visibility === "public",
        ...settings,
        modules: modules.map((m, idx) => ({
            ...m,
            order: idx,
            lessons: m.lessons.map((l, lIdx) => ({
                ...l,
                contentType: l.contentType,
                content: l.content || "",
                order: lIdx,
            })),
        })),
        whatYouLearn: courseData.whatYouLearn.filter(Boolean),
    });

    const handlePublish = async () => {
        setLoading(true);
        try {
            const payload = buildPayload();

            const res = await fetch(mode === "create" ? "/api/courses" : `/api/courses/${initialData?.id}`, {
                method: mode === "create" ? "POST" : "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                addToast({
                    type: "success",
                    title: mode === "create" ? "Kursus berhasil dibuat!" : "Kursus berhasil diupdate!",
                });
                setTimeout(() => router.push("/admin"), 500);
            } else {
                const err = await res.text();
                addToast({ type: "error", title: "Gagal menyimpan", message: err });
            }
        } catch {
            addToast({ type: "error", title: "Terjadi kesalahan" });
        } finally {
            setLoading(false);
        }
    };

    const handleExit = () => {
        if (hasChanges) {
            setShowExitConfirm(true);
        } else {
            router.push("/admin");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Left: Title & Cancel */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleExit}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
                            >
                                <X size={22} />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    {mode === "create" ? (
                                        <>
                                            <Sparkles size={20} className="text-violet-500" />
                                            Buat Kursus Baru
                                        </>
                                    ) : (
                                        "Edit Kursus"
                                    )}
                                </h1>
                                <p className="text-sm text-slate-500">
                                    Langkah {currentStep} dari {visibleSteps.length}
                                </p>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3">
                            {/* Quick Publish Toggle */}
                            <label className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={quickPublish}
                                    onChange={(e) => setQuickPublish(e.target.checked)}
                                    className="w-4 h-4 rounded"
                                />
                                <span className="text-sm font-medium text-slate-700">Quick Mode</span>
                            </label>

                            {/* Save Draft */}
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleSaveDraft}
                                loading={savingDraft}
                                icon={<Save size={16} />}
                            >
                                Save Draft
                            </Button>
                        </div>
                    </div>

                    {/* Step Progress */}
                    <div className="mt-6 overflow-x-auto pb-2 -mx-6 px-6">
                        <div className="flex items-center justify-between gap-2 min-w-[700px]">
                            {visibleSteps.map((step, index) => {
                                const Icon = step.icon;
                                const isCompleted = currentStep > step.id;
                                const isActive = currentStep === step.id;

                                return (
                                    <div key={step.id} className="flex items-center flex-1 last:flex-none">
                                        <button
                                            onClick={() => setCurrentStep(step.id)}
                                            className={`flex flex-col items-center relative z-10 group ${isActive ? "scale-110" : ""
                                                } transition-transform`}
                                        >
                                            <div
                                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm ${isCompleted
                                                    ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-200"
                                                    : isActive
                                                        ? "bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-blue-200"
                                                        : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                                                    }`}
                                            >
                                                {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                                            </div>
                                            <span
                                                className={`mt-2 text-xs font-medium whitespace-nowrap ${isActive ? "text-blue-600" : "text-slate-500"
                                                    }`}
                                            >
                                                {step.name}
                                            </span>
                                        </button>
                                        {index < visibleSteps.length - 1 && (
                                            <div
                                                className={`flex-1 h-1 mx-2 rounded-full transition-colors ${isCompleted ? "bg-emerald-400" : "bg-slate-200"
                                                    }`}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-6 pb-32">
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-8">
                    {currentStep === 1 && (
                        <BasicInfoStep
                            data={courseData}
                            onChange={setCourseData}
                            onTitleChange={handleTitleChange}
                            categories={categories}
                            onCategoryAdded={fetchCategories}
                        />
                    )}
                    {currentStep === 2 && (
                        <DescriptionStep data={courseData} onChange={setCourseData} />
                    )}
                    {currentStep === 3 && (
                        <CurriculumStep modules={modules} setModules={setModules} />
                    )}
                    {currentStep === 4 && (
                        <ContentStep modules={modules} updateModuleLesson={updateModuleLesson} />
                    )}
                    {currentStep === 5 && (
                        <AssessmentStep modules={modules} updateModuleLesson={updateModuleLesson} />
                    )}
                    {currentStep === 6 && (
                        <SettingsStep settings={settings} setSettings={setSettings} />
                    )}
                    {currentStep === 7 && (
                        <PricingStep data={courseData} onChange={setCourseData} />
                    )}
                    {currentStep === 8 && (
                        <ReviewStep
                            courseData={courseData}
                            modules={modules}
                            settings={settings}
                        />
                    )}
                </div>
            </div>

            {/* Footer Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200/50 p-4 z-20">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={currentStep === 1 || loading}
                        icon={<ChevronLeft size={20} />}
                    >
                        Kembali
                    </Button>

                    {currentStep < visibleSteps.length ? (
                        <Button onClick={handleNext} icon={<ChevronRight size={20} />}>
                            Lanjutkan
                        </Button>
                    ) : (
                        <Button
                            variant="success"
                            onClick={handlePublish}
                            loading={loading}
                            icon={<Rocket size={18} />}
                        >
                            {mode === "create" ? "Publish Kursus" : "Update Kursus"}
                        </Button>
                    )}
                </div>
            </div>

            {/* Exit Confirmation */}
            <ConfirmDialog
                isOpen={showExitConfirm}
                onClose={() => setShowExitConfirm(false)}
                onConfirm={() => router.push("/admin")}
                title="Keluar tanpa menyimpan?"
                message="Perubahan yang belum disimpan akan hilang."
                confirmText="Keluar"
                cancelText="Batal"
                variant="warning"
            />
        </div>
    );
}

// Wrapper with ToastProvider
export default function CourseBuilder(props: CourseBuilderProps) {
    return (
        <ToastProvider>
            <CourseBuilderContent {...props} />
        </ToastProvider>
    );
}
