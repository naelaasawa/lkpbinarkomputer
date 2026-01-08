"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Check, Upload, FileText, Video, Link as LinkIcon, HelpCircle, ChevronDown, Trash2, GripVertical, Plus } from "lucide-react";
import RichTextEditor from "./RichTextEditor";

// --- Types ---

export interface CourseData {
    // Step 1: Basic Info
    title: string;
    slug: string;
    shortDescription: string;
    categoryId: string;
    level: string;
    language: string;
    imageUrl?: string;

    // Step 2: Description
    fullDescription: string;
    whatYouLearn: string[];
    targetAudience: string;
    prerequisites: string;

    // Step 7: Pricing
    price: number;
}

export interface SettingsData {
    // Step 6: Settings
    visibility: string;
    enrollmentType: string;
    completionRule: string;
    certificateEnabled: boolean;
}

export interface Lesson {
    id: string;
    title: string;
    contentType: "video" | "text" | "file" | "link" | "quiz";
    content?: string; // URL or text content
    duration?: number;
    order: number;
}

export interface Module {
    id: string;
    title: string;
    description: string;
    order: number;
    lessons: Lesson[];
}

const STEPS = [
    { id: 1, name: "Basic Info", required: true },
    { id: 2, name: "Description", required: true },
    { id: 3, name: "Curriculum", required: true },
    { id: 4, name: "Content", required: false },
    { id: 5, name: "Assessment", required: false },
    { id: 6, name: "Settings", required: true },
    { id: 7, name: "Pricing", required: false },
    { id: 8, name: "Review", required: true },
];

interface CourseBuilderProps {
    mode: "create" | "edit";
    initialData?: any; // Full course object from DB
}

export default function CourseBuilder({ mode, initialData }: CourseBuilderProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [quickPublish, setQuickPublish] = useState(false);
    const [loading, setLoading] = useState(false);

    // States
    const [courseData, setCourseData] = useState<CourseData>({
        title: "",
        slug: "",
        shortDescription: "",
        categoryId: "",
        level: "Beginner",
        language: "id",
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

    // Load Initial Data if Edit Mode
    useEffect(() => {
        if (mode === "edit" && initialData) {
            // Parse whatYouLearn if string
            let wyl = ["", "", ""];
            try {
                wyl = typeof initialData.whatYouLearn === 'string' ? JSON.parse(initialData.whatYouLearn) : initialData.whatYouLearn || [];
            } catch (e) {
                console.error("Failed to parse whatYouLearn", e);
            }

            setCourseData({
                title: initialData.title || "",
                slug: initialData.slug || "",
                shortDescription: initialData.description || "", // Mapping description to shortDescription
                categoryId: initialData.categoryId || "",
                level: initialData.level || "Beginner",
                language: initialData.language || "id",
                fullDescription: initialData.description || "", // Basic mapping, adjust if you separate short/full
                whatYouLearn: wyl,
                targetAudience: "", // Not present in DB schema yet? Using defaults
                prerequisites: "", // Not present in DB schema yet?
                price: Number(initialData.price) || 0,
                imageUrl: initialData.imageUrl,
            });

            // Map Modules if they exist
            if (initialData.modules) {
                setModules(initialData.modules.map((m: any) => ({
                    id: m.id,
                    title: m.title,
                    description: "", // Schema doesn't have module description?
                    order: m.order,
                    lessons: m.lessons ? m.lessons.map((l: any) => ({
                        id: l.id,
                        title: l.title,
                        contentType: l.type || "video", // type in DB vs contentType in frontend
                        content: l.contentUrl || "", // contentUrl in DB
                        order: l.order
                    })) : []
                })));
            }

            // Map settings
            setSettings({
                visibility: initialData.published ? "public" : "draft", // Corrected property name from isPublished to published
                enrollmentType: "open",
                completionRule: "manual",
                certificateEnabled: false,
            });
        }
    }, [mode, initialData]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/categories");
                const data = await res.json();
                setCategories(data);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchCategories();
    }, []);

    // Helpers
    const handleTitleChange = (title: string) => {
        setCourseData({
            ...courseData,
            title,
            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        });
    };

    const updateModuleLesson = (moduleIndex: number, lessonIndex: number, field: string, value: any) => {
        const newModules = [...modules];
        newModules[moduleIndex].lessons[lessonIndex] = {
            ...newModules[moduleIndex].lessons[lessonIndex],
            [field]: value
        };
        setModules(newModules);
    }

    const handleNext = () => {
        if (quickPublish && currentStep === 3) {
            setCurrentStep(8);
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (quickPublish && currentStep === 8) {
            setCurrentStep(3);
        } else {
            setCurrentStep(currentStep - 1);
        }
    };

    const handlePublish = async () => {
        setLoading(true);
        try {
            const payload = {
                ...courseData,
                description: courseData.shortDescription, // Mapping back to DB field
                isPublished: settings.visibility === 'public', // Mapping back
                price: courseData.price,
                imageUrl: courseData.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60", // Default
                modules: modules.map((m, idx) => ({
                    ...m,
                    title: m.title, // Explicitly included
                    description: m.description || "", // BUG FIX: Explicitly including description
                    order: idx,
                    lessons: m.lessons.map((l, lIdx) => ({
                        ...l,
                        type: l.contentType, // Mapping back
                        contentUrl: l.content || "", // Mapping back
                        order: lIdx,
                    })),
                })),
                whatYouLearn: courseData.whatYouLearn.filter(Boolean),
            };

            let res;
            if (mode === "create") {
                res = await fetch("/api/courses", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            } else {
                // Edit Mode
                res = await fetch(`/api/courses/${initialData.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }

            if (res.ok) {
                alert(mode === "create" ? "Course created successfully!" : "Course updated successfully!");
                router.push("/admin");
                router.refresh();
            } else {
                const err = await res.text();
                alert(`Failed to save course: ${err}`);
            }
        } catch (error) {
            console.error("Failed to publish course", error);
            alert("Error creating/updating course");
        } finally {
            setLoading(false);
        }
    };

    const visibleSteps = quickPublish
        ? STEPS.filter((s) => s.id <= 3 || s.id === 8)
        : STEPS;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">{mode === 'create' ? 'Create New Course' : 'Edit Course'}</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Step {currentStep} of {visibleSteps.length}
                        </p>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer select-none">
                        <span className="text-sm font-medium text-slate-700">Quick Publish</span>
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={quickPublish}
                                onChange={(e) => setQuickPublish(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </div>
                    </label>
                </div>

                {/* Progress Bar */}
                <div className="max-w-5xl mx-auto mt-6 overflow-x-auto pb-2">
                    <div className="flex items-center justify-between min-w-[600px]">
                        {visibleSteps.map((step, index) => (
                            <div key={step.id} className="flex items-center flex-1 last:flex-none">
                                <div className="flex flex-col items-center relative z-10 cursor-pointer" onClick={() => setCurrentStep(step.id)}>
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs transition ${currentStep > step.id
                                            ? "bg-green-500 text-white"
                                            : currentStep === step.id
                                                ? "bg-blue-600 text-white"
                                                : "bg-slate-200 text-slate-400"
                                            }`}
                                    >
                                        {currentStep > step.id ? <Check size={16} /> : step.id}
                                    </div>
                                    <span className={`text-xs mt-2 font-medium whitespace-nowrap ${currentStep === step.id ? 'text-blue-600' : 'text-slate-500'}`}>{step.name}</span>
                                </div>
                                {index < visibleSteps.length - 1 && (
                                    <div
                                        className={`flex-1 h-0.5 mx-2 -mt-4 transition ${currentStep > step.id ? "bg-green-500" : "bg-slate-200"
                                            }`}
                                    ></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto p-6 pb-24">
                <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
                    {currentStep === 1 && (
                        <Step1BasicInfo
                            data={courseData}
                            onChange={setCourseData}
                            onTitleChange={handleTitleChange}
                            categories={categories}
                        />
                    )}
                    {currentStep === 2 && (
                        <Step2Description data={courseData} onChange={setCourseData} />
                    )}
                    {currentStep === 3 && (
                        <Step3Curriculum modules={modules} setModules={setModules} />
                    )}
                    {currentStep === 4 && (
                        <Step4Content modules={modules} updateModuleLesson={updateModuleLesson} />
                    )}
                    {currentStep === 5 && (
                        <Step5Assessment />
                    )}
                    {currentStep === 6 && (
                        <Step6Settings settings={settings} setSettings={setSettings} quickPublish={quickPublish} />
                    )}
                    {currentStep === 7 && (
                        <Step7Pricing data={courseData} onChange={setCourseData} />
                    )}
                    {currentStep === 8 && (
                        <Step8Review
                            courseData={courseData}
                            modules={modules}
                            settings={settings}
                            quickPublish={quickPublish}
                            price={courseData.price}
                            mode={mode}
                        />
                    )}
                </div>
            </div>

            {/* Footer Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-20">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 1 || loading}
                        className="flex items-center gap-2 px-6 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={20} />
                        Back
                    </button>
                    <div className="flex gap-3">
                        {currentStep < visibleSteps.length ? (
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm hover:shadow"
                            >
                                Next
                                <ChevronRight size={20} />
                            </button>
                        ) : (
                            <button
                                onClick={handlePublish}
                                disabled={loading}
                                className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm hover:shadow disabled:opacity-70 flex items-center gap-2"
                            >
                                {loading ? "Saving..." : (mode === 'create' ? "Publish Course" : "Update Course")}
                                {!loading && <Check size={20} />}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Steps Components ---

function Step1BasicInfo({ data, onChange, onTitleChange, categories }: any) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Basic Course Information</h2>
                <p className="text-sm text-slate-500">Let's start with the essential details about your course</p>
            </div>
            <div className="grid gap-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Course Title <span className="text-red-500">*</span></label>
                    <input type="text" value={data.title} onChange={(e) => onTitleChange(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Master ReactJS: From Zero to Hero" />
                    <p className="text-xs text-slate-500 mt-1">💡 Tip: Use a catchy, benefit-driven title to attract more students.</p>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Slug</label>
                    <div className="flex items-center">
                        <span className="px-4 py-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg text-sm text-slate-600">/courses/</span>
                        <input type="text" value={data.slug} onChange={(e) => onChange({ ...data, slug: e.target.value })} className="flex-1 px-4 py-3 border border-slate-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Short Description <span className="text-red-500">*</span></label>
                    <textarea value={data.shortDescription} onChange={(e) => onChange({ ...data, shortDescription: e.target.value })} maxLength={160} rows={3} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Briefly describe what this course is about..." />
                    <div className="flex justify-between mt-1">
                        <p className="text-xs text-slate-500">Used for SEO and course cards. Keep it under 160 characters.</p>
                        <p className="text-xs text-slate-400">{data.shortDescription.length}/160</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Category <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                            <select value={data.categoryId} onChange={(e) => onChange({ ...data, categoryId: e.target.value })} className="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Select category</option>
                                {categories.map((c: any) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                            </select>
                            <button onClick={() => {
                                const name = prompt("Enter new category name:");
                                if (name) {
                                    fetch("/api/categories", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ name, color: "bg-blue-100 text-blue-800" })
                                    }).then(res => res.json()).then(newCat => {
                                        alert("Category created! Refreshing...");
                                        window.location.reload();
                                    });
                                }
                            }} className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-200 font-bold">+</button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Level <span className="text-red-500">*</span></label>
                        <select value={data.level} onChange={(e) => onChange({ ...data, level: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Language</label>
                    <select value={data.language} onChange={(e) => onChange({ ...data, language: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="id">Indonesian</option>
                        <option value="en">English</option>
                    </select>
                </div>
            </div>
        </div>
    );
}

function Step2Description({ data, onChange }: any) {
    const updateLearningPoint = (idx: number, val: string) => {
        const updated = [...data.whatYouLearn];
        updated[idx] = val;
        onChange({ ...data, whatYouLearn: updated });
    };
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Course Description</h2>
                <p className="text-sm text-slate-500">Provide detailed information about the course curriculum and goals.</p>
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Description <span className="text-red-500">*</span></label>
                <div className="prose-editor">
                    <RichTextEditor
                        value={data.fullDescription}
                        onChange={(val: string) => onChange({ ...data, fullDescription: val })}
                        placeholder="Describe your course in detail..."
                        className="mb-12"
                    />
                </div>
            </div>
            <div className="mt-12">
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">What Students Will Learn (Min 3)</label>
                {data.whatYouLearn.map((pt: string, i: number) => (
                    <div key={i} className="flex gap-2 mb-2">
                        <input type="text" value={pt} onChange={(e) => updateLearningPoint(i, e.target.value)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg" placeholder={`e.g. ${i === 0 ? 'Build real-world applications' : i === 1 ? 'Master core concepts' : 'Deploy to production'}`} />
                        {data.whatYouLearn.length > 3 && <button onClick={() => onChange({ ...data, whatYouLearn: data.whatYouLearn.filter((_: any, idx: number) => idx !== i) })} className="text-red-500 font-bold px-2">✕</button>}
                    </div>
                ))}
                <button onClick={() => onChange({ ...data, whatYouLearn: [...data.whatYouLearn, ""] })} className="text-blue-600 text-sm font-medium">+ Add Point</button>
            </div>
        </div>
    );
}

function Step3Curriculum({ modules, setModules }: any) {
    const addModule = () => setModules([...modules, { id: Date.now().toString(), title: "", description: "", order: modules.length, lessons: [] }]);
    const updateModule = (idx: number, field: string, val: string) => {
        const newMods = [...modules]; newMods[idx] = { ...newMods[idx], [field]: val }; setModules(newMods);
    };
    const addLesson = (modIdx: number) => {
        const newMods = [...modules];
        newMods[modIdx].lessons.push({ id: Date.now().toString(), title: "", contentType: "video", order: newMods[modIdx].lessons.length });
        setModules(newMods);
    };
    const updateLesson = (modIdx: number, lesIdx: number, field: string, val: any) => {
        const newMods = [...modules]; newMods[modIdx].lessons[lesIdx] = { ...newMods[modIdx].lessons[lesIdx], [field]: val }; setModules(newMods);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Curriculum Builder</h2>
                <p className="text-sm text-slate-500">Structure your course. Use the drag handles to reorder (coming soon).</p>
            </div>

            <div className="space-y-4">
                {modules.map((m: any, mIdx: number) => (
                    <div key={m.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        {/* Module Header */}
                        <div className="bg-slate-50 p-4 border-b border-slate-100 flex gap-3 items-start group">
                            <div className="mt-2 text-slate-400 cursor-move hover:text-slate-600">
                                <GripVertical size={20} />
                            </div>
                            <div className="flex-1 space-y-3">
                                <div className="flex gap-3">
                                    <span className="font-bold text-slate-500 py-2">Module {mIdx + 1}</span>
                                    <input
                                        type="text"
                                        value={m.title}
                                        onChange={(e) => updateModule(mIdx, "title", e.target.value)}
                                        placeholder="e.g. Introduction to the Course"
                                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={m.description}
                                    onChange={(e) => updateModule(mIdx, "description", e.target.value)}
                                    placeholder="What will students learn in this module?"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                />
                            </div>
                            <button
                                onClick={() => setModules(modules.filter((_: any, i: number) => i !== mIdx))}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                title="Delete Module"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>

                        {/* Lessons List - Accordion Content */}
                        <div className="p-2 bg-white">
                            {m.lessons.length === 0 ? (
                                <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-lg m-2">
                                    <p className="text-xs text-slate-400 mb-2">No lessons in this module yet</p>
                                    <button onClick={() => addLesson(mIdx)} className="text-xs font-bold text-blue-600 hover:underline">+ Add First Lesson</button>
                                </div>
                            ) : (
                                <div className="space-y-2 p-2">
                                    {m.lessons.map((l: any, lIdx: number) => (
                                        <div key={l.id} className="flex gap-3 items-center bg-slate-50 p-3 rounded-lg border border-slate-100 group hover:border-blue-200 transition-colors">
                                            <div className="text-slate-300 cursor-move hover:text-slate-500">
                                                <GripVertical size={16} />
                                            </div>
                                            <div className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded border min-w-[3rem] text-center">
                                                {mIdx + 1}.{lIdx + 1}
                                            </div>
                                            <input
                                                type="text"
                                                value={l.title}
                                                onChange={(e) => updateLesson(mIdx, lIdx, "title", e.target.value)}
                                                placeholder="Lesson Title"
                                                className="flex-1 px-3 py-1.5 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                            <select
                                                value={l.contentType}
                                                onChange={(e) => updateLesson(mIdx, lIdx, "contentType", e.target.value)}
                                                className="px-3 py-1.5 border border-slate-200 rounded text-sm bg-white text-slate-600 focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="video">Video</option>
                                                <option value="text">Text / Article</option>
                                                <option value="file">File / PDF</option>
                                                <option value="link">Link</option>
                                                <option value="quiz">Quiz</option>
                                            </select>
                                            <button
                                                onClick={() => { const nM = [...modules]; nM[mIdx].lessons = nM[mIdx].lessons.filter((_: any, i: number) => i !== lIdx); setModules(nM); }}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                                                title="Delete Lesson"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {m.lessons.length > 0 && (
                                <div className="px-2 pb-2">
                                    <button
                                        onClick={() => addLesson(mIdx)}
                                        className="w-full py-2 border border-dashed border-blue-200 text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2"
                                    >
                                        <Plus size={16} /> Add Lesson
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {modules.length === 0 && (
                <div className="text-center py-12 bg-white border-2 border-dashed border-slate-300 rounded-xl mb-6">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ChevronRight size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Start Building Your Curriculum</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-6">
                        Break down your course into manageable modules and lessons. Start by adding your first module below.
                    </p>
                </div>
            )}

            <button
                onClick={addModule}
                className="w-full py-4 border-2 border-dashed rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-400 transition font-bold bg-white hover:bg-blue-50 flex flex-col items-center gap-2"
            >
                <span className="flex items-center gap-2 text-lg"><Plus size={24} /> Add New Module</span>
                <span className="text-xs font-normal opacity-70">Create a new section for your course</span>
            </button>
        </div>
    );
}

function Step4Content({ modules, updateModuleLesson }: any) {
    const [activeLesson, setActiveLesson] = useState<{ mIdx: number, lIdx: number } | null>(null);

    // Auto-select first lesson if none selected
    useEffect(() => {
        if (!activeLesson && modules.length > 0 && modules[0].lessons.length > 0) {
            setActiveLesson({ mIdx: 0, lIdx: 0 });
        }
    }, [modules]); // eslint-disable-line

    const currentLesson = activeLesson
        ? modules[activeLesson.mIdx]?.lessons[activeLesson.lIdx]
        : null;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Content Upload</h2>
                <p className="text-sm text-slate-500">Select a lesson from the sidebar to add content.</p>
            </div>

            {modules.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-lg">
                    <p className="text-slate-500">Please add modules and lessons in the Curriculum step first.</p>
                </div>
            ) : (
                <div className="flex flex-col md:flex-row gap-6 h-[600px] border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {/* Sidebar: Lesson Hierarchy */}
                    <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50 overflow-y-auto">
                        <div className="p-4 border-b border-slate-200 font-bold text-slate-700 bg-white sticky top-0">
                            Course Structure
                        </div>
                        <div className="p-2 space-y-4">
                            {modules.map((module: any, mIdx: number) => (
                                <div key={module.id}>
                                    <div className="px-3 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
                                        {module.title || `Module ${mIdx + 1}`}
                                    </div>
                                    <div className="space-y-0.5">
                                        {module.lessons.map((lesson: any, lIdx: number) => {
                                            const isActive = activeLesson?.mIdx === mIdx && activeLesson?.lIdx === lIdx;
                                            return (
                                                <button
                                                    key={lesson.id}
                                                    onClick={() => setActiveLesson({ mIdx, lIdx })}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition ${isActive ? 'bg-blue-100 text-blue-700 font-medium shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                                                >
                                                    {lesson.contentType === 'video' && <Video size={14} />}
                                                    {lesson.contentType === 'text' && <FileText size={14} />}
                                                    {lesson.contentType === 'link' && <LinkIcon size={14} />}
                                                    <span className="truncate">{lesson.title || `Lesson ${lIdx + 1}`}</span>
                                                    {lesson.content && <Check size={12} className="ml-auto text-green-500" />}
                                                </button>
                                            );
                                        })}
                                        {module.lessons.length === 0 && (
                                            <div className="px-3 py-2 text-xs text-slate-400 italic">No lessons</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main Content: Editor */}
                    <div className="flex-1 bg-white overflow-y-auto p-6">
                        {currentLesson ? (
                            <div className="h-full flex flex-col">
                                <div className="border-b border-slate-100 pb-4 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                                        <span className="uppercase">{modules[activeLesson!.mIdx].title}</span>
                                        <ChevronRight size={14} />
                                        <span>Lesson {activeLesson!.lIdx + 1}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800">{currentLesson.title}</h3>
                                    <div className="flex gap-2 mt-2">
                                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-xs font-bold uppercase border border-blue-100">
                                            {currentLesson.contentType}
                                        </span>
                                    </div>
                                </div>

                                {/* Dynamic Editor based on Type */}
                                <div className="flex-1">
                                    {currentLesson.contentType === 'text' ? (
                                        <div className="h-full pb-12">
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Lesson Article Content</label>
                                            <RichTextEditor
                                                value={currentLesson.content || ''}
                                                onChange={(val: string) => updateModuleLesson(activeLesson!.mIdx, activeLesson!.lIdx, 'content', val)}
                                                placeholder="Write your lesson content here..."
                                                className="h-[400px]"
                                            />
                                        </div>
                                    ) : currentLesson.contentType === 'video' || currentLesson.contentType === 'link' ? (
                                        <div className="max-w-xl">
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                {currentLesson.contentType === 'video' ? 'Video URL' : 'Resource URL'}
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={currentLesson.content || ''}
                                                    onChange={(e) => updateModuleLesson(activeLesson!.mIdx, activeLesson!.lIdx, 'content', e.target.value)}
                                                    className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                    placeholder={currentLesson.contentType === 'video' ? "https://youtube.com/watch?v=..." : "https://example.com/resource"}
                                                />
                                            </div>
                                            {currentLesson.content && (
                                                <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                                    <p className="text-xs font-bold text-slate-500 mb-2 uppercase">Preview</p>
                                                    <a href={currentLesson.content} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                                        {currentLesson.content} <LinkIcon size={12} />
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 bg-slate-50 border border-dashed rounded-lg">
                                            <HelpCircle size={48} className="mx-auto text-slate-300 mb-4" />
                                            <h3 className="text-lg font-medium text-slate-600">Configuration Required</h3>
                                            <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
                                                To configure {currentLesson.contentType}, please save the curriculum structure first or use the specialized tool in the dashboard.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                                <FileText size={48} className="mb-4 opacity-20" />
                                <p>Select a lesson to start editing content</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function Step5Assessment() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Assessment</h2>
                <p className="text-sm text-slate-500">Manage quizzes and exams.</p>
            </div>
            <div className="p-10 border-2 border-dashed rounded-xl text-center bg-slate-50">
                <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                    <HelpCircle size={24} />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">Quiz Linking</h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                    You can create quizzes in the Quiz Manager and link them here or directly in the Curriculum Builder.
                    Advanced assessment settings will be available here soon.
                </p>
                <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition text-sm">
                    Go to Quiz Manager
                </button>
            </div>
        </div>
    );
}

function Step6Settings({ settings, setSettings, quickPublish }: any) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Course Settings</h2>
                <p className="text-sm text-slate-500">Access and visibility controls.</p>
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Visibility</label>
                <div className="flex flex-col gap-3">
                    {['draft', 'private', 'public'].map(v => (
                        <label key={v} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${settings.visibility === v ? 'border-blue-500 bg-blue-50' : 'hover:bg-slate-50'}`}>
                            <input type="radio" value={v} checked={settings.visibility === v} onChange={(e) => setSettings({ ...settings, visibility: e.target.value })} disabled={quickPublish && v !== 'private'} />
                            <div>
                                <div className="font-medium capitalize text-slate-800">{v}</div>
                                <div className="text-xs text-slate-500">
                                    {v === 'draft' && "Only you can see"}
                                    {v === 'private' && "Only enrolled students"}
                                    {v === 'public' && "Everyone can see"}
                                </div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Enrollment Type</label>
                <select value={settings.enrollmentType} onChange={(e) => setSettings({ ...settings, enrollmentType: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                    <option value="open">Open (Auto-enroll)</option>
                    <option value="approval">Approval Required</option>
                </select>
            </div>
            <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-slate-50">
                <input type="checkbox" checked={settings.certificateEnabled} onChange={(e) => setSettings({ ...settings, certificateEnabled: e.target.checked })} disabled={quickPublish} />
                <div>
                    <div className="font-semibold text-sm">Enable Certificate</div>
                    <div className="text-xs text-slate-500">Award on completion</div>
                </div>
            </label>
        </div>
    );
}

function Step7Pricing({ data, onChange }: any) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Pricing</h2>
                <p className="text-sm text-slate-500">Set the price for your course.</p>
            </div>

            <div className="bg-white p-6 border rounded-xl">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Price (IDR)</label>
                <div className="relative">
                    <span className="absolute left-4 top-3 text-slate-500 font-medium">Rp</span>
                    <input
                        type="number"
                        min="0"
                        value={data.price}
                        onChange={(e) => onChange({ ...data, price: parseInt(e.target.value) || 0 })}
                        className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-lg"
                        placeholder="0"
                    />
                </div>
                <p className="text-sm text-slate-500 mt-2">Set to 0 for a free course.</p>
            </div>
        </div>
    );
}

function Step8Review({ courseData, modules, settings, quickPublish, price, mode }: any) {
    const validations = {
        title: !!courseData.title,
        desc: !!courseData.shortDescription,
        cat: !!courseData.categoryId,
        mod: modules.length > 0,
        les: modules.some((m: any) => m.lessons.length > 0)
    };
    const isValid = Object.values(validations).every(Boolean);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Review & {mode === 'create' ? 'Publish' : 'Update'}</h2>
                <p className="text-sm text-slate-500">Final check before going live.</p>
            </div>

            <div className={`p-4 rounded-lg border ${isValid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <h3 className={`font-bold mb-3 ${isValid ? 'text-green-800' : 'text-yellow-800'}`}>{isValid ? '✅ Ready to ' + (mode === 'create' ? 'Publish' : 'Update') : '⚠️ Missing Requirements'}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className={validations.title ? 'text-green-600' : 'text-red-500'}>• Title</div>
                    <div className={validations.desc ? 'text-green-600' : 'text-red-500'}>• Description</div>
                    <div className={validations.cat ? 'text-green-600' : 'text-red-500'}>• Category</div>
                    <div className={validations.mod ? 'text-green-600' : 'text-red-500'}>• Modules</div>
                    <div className={validations.les ? 'text-green-600' : 'text-red-500'}>• Lessons</div>
                </div>
            </div>

            <div className="border rounded-lg p-6 space-y-4 text-sm bg-white">
                <h3 className="font-bold text-slate-800 border-b pb-2">Summary</h3>
                <div className="grid grid-cols-2 gap-y-4">
                    <div><div className="text-slate-500">Title</div><div className="font-medium">{courseData.title}</div></div>
                    <div><div className="text-slate-500">Price</div><div className="font-medium">{price > 0 ? `Rp ${price.toLocaleString()}` : 'Free'}</div></div>
                    <div><div className="text-slate-500">Modules/Lessons</div><div className="font-medium">{modules.length} / {modules.reduce((a: number, b: any) => a + b.lessons.length, 0)}</div></div>
                    <div><div className="text-slate-500">Visibility</div><div className="font-medium capitalize">{settings.visibility}</div></div>
                </div>
            </div>
        </div>
    );
}
