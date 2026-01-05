"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Check, Upload, FileText, Video, Link as LinkIcon, HelpCircle } from "lucide-react";

// --- Types ---

interface CourseData {
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

interface SettingsData {
    // Step 6: Settings
    visibility: string;
    enrollmentType: string;
    completionRule: string;
    certificateEnabled: boolean;
}

interface Lesson {
    id: string;
    title: string;
    contentType: "video" | "text" | "file" | "link" | "quiz";
    content?: string; // URL or text content
    duration?: number;
    order: number;
}

interface Module {
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

export default function CreateCoursePage() {
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
                ...settings,
                modules: modules.map((m, idx) => ({
                    ...m,
                    order: idx,
                    lessons: m.lessons.map((l, lIdx) => ({
                        ...l,
                        order: lIdx,
                    })),
                })),
                whatYouLearn: courseData.whatYouLearn.filter(Boolean), // Filter empty strings if any
            };

            const res = await fetch("/api/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                alert("Course created successfully!");
                router.push("/admin");
            } else {
                const err = await res.text();
                alert(`Failed to create course: ${err}`);
            }
        } catch (error) {
            console.error("Failed to publish course", error);
            alert("Error creating course");
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
                        <h1 className="text-xl font-bold text-slate-800">Create New Course</h1>
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
                        <button
                            onClick={() => alert("Save Draft feature coming soon")}
                            disabled={loading}
                            className="px-6 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition hidden sm:block"
                        >
                            Save Draft
                        </button>
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
                                {loading ? "Publishing..." : "Publish Course"}
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
                    <input type="text" value={data.title} onChange={(e) => onTitleChange(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Complete Web Development Bootcamp" />
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
                    <textarea value={data.shortDescription} onChange={(e) => onChange({ ...data, shortDescription: e.target.value })} maxLength={160} rows={3} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Max 160 characters" />
                    <p className="text-xs text-slate-400 mt-1 text-right">{data.shortDescription.length}/160</p>
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
                                        // Refresh logic or simple reload for now. A cleaner way would be to pass setCategories to Step1.
                                        // For now, let's just alert. Ideally pass setCategories here.
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
                <textarea value={data.fullDescription} onChange={(e) => onChange({ ...data, fullDescription: e.target.value })} rows={6} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Markdown supported..." />
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">What Students Will Learn (Min 3)</label>
                {data.whatYouLearn.map((pt: string, i: number) => (
                    <div key={i} className="flex gap-2 mb-2">
                        <input type="text" value={pt} onChange={(e) => updateLearningPoint(i, e.target.value)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg" placeholder={`Point ${i + 1}`} />
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
            <div><h2 className="text-2xl font-bold text-slate-800 mb-2">Curriculum Builder</h2><p className="text-sm text-slate-500">Structure your course.</p></div>
            {modules.map((m: any, mIdx: number) => (
                <div key={m.id} className="border border-slate-200 rounded-lg overflow-hidden mb-4">
                    <div className="bg-slate-50 p-4 flex gap-4 items-start">
                        <span className="font-bold text-slate-400 mt-2">#{mIdx + 1}</span>
                        <div className="flex-1 space-y-2">
                            <input type="text" value={m.title} onChange={(e) => updateModule(mIdx, "title", e.target.value)} placeholder="Module Title" className="w-full px-3 py-2 border rounded font-medium" />
                            <input type="text" value={m.description} onChange={(e) => updateModule(mIdx, "description", e.target.value)} placeholder="Description (Optional)" className="w-full px-3 py-2 border rounded text-sm" />
                        </div>
                        <button onClick={() => setModules(modules.filter((_: any, i: number) => i !== mIdx))} className="text-red-500 p-2">✕</button>
                    </div>
                    <div className="p-4 bg-white">
                        {m.lessons.map((l: any, lIdx: number) => (
                            <div key={l.id} className="flex gap-3 items-center mb-3 ml-4">
                                <span className="text-xs text-slate-400">{mIdx + 1}.{lIdx + 1}</span>
                                <input type="text" value={l.title} onChange={(e) => updateLesson(mIdx, lIdx, "title", e.target.value)} placeholder="Lesson Title" className="flex-1 px-3 py-2 border rounded text-sm" />
                                <select value={l.contentType} onChange={(e) => updateLesson(mIdx, lIdx, "contentType", e.target.value)} className="px-3 py-2 border rounded text-sm">
                                    <option value="video">Video</option>
                                    <option value="text">Text</option>
                                    <option value="file">File</option>
                                    <option value="link">Link</option>
                                    <option value="quiz">Quiz</option>
                                </select>
                                <button onClick={() => { const nM = [...modules]; nM[mIdx].lessons = nM[mIdx].lessons.filter((_: any, i: number) => i !== lIdx); setModules(nM); }} className="text-red-400 text-sm">✕</button>
                            </div>
                        ))}
                        <button onClick={() => addLesson(mIdx)} className="text-sm text-blue-600 ml-4 font-medium">+ Add Lesson</button>
                    </div>
                </div>
            ))}
            <button onClick={addModule} className="w-full py-4 border-2 border-dashed rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-400 transition font-medium">Add Module</button>
        </div>
    );
}

function Step4Content({ modules, updateModuleLesson }: any) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Content Upload</h2>
                <p className="text-sm text-slate-500">Add the actual content for your lessons.</p>
            </div>

            {modules.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-lg">
                    <p className="text-slate-500">Please add modules and lessons in the Curriculum step first.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {modules.map((module: any, mIdx: number) => (
                        <div key={module.id} className="space-y-4">
                            <h3 className="font-bold text-lg text-slate-700 border-b pb-2">{module.title || `Module ${mIdx + 1}`}</h3>
                            {module.lessons.length === 0 ? <p className="text-sm text-slate-400 italic">No lessons in this module.</p> : (
                                <div className="space-y-4">
                                    {module.lessons.map((lesson: any, lIdx: number) => (
                                        <div key={lesson.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                            <div className="flex items-center gap-2 mb-3">
                                                {lesson.contentType === 'video' && <Video size={16} className="text-blue-500" />}
                                                {lesson.contentType === 'text' && <FileText size={16} className="text-green-500" />}
                                                {lesson.contentType === 'link' && <LinkIcon size={16} className="text-orange-500" />}
                                                {lesson.contentType === 'file' && <Upload size={16} className="text-purple-500" />}
                                                {lesson.contentType === 'quiz' && <HelpCircle size={16} className="text-red-500" />}
                                                <span className="font-medium text-slate-700">{lesson.title || `Lesson ${lIdx + 1}`}</span>
                                                <span className="text-xs text-slate-400 uppercase bg-white px-2 py-0.5 rounded border">
                                                    {lesson.contentType}
                                                </span>
                                            </div>

                                            {/* Input based on type */}
                                            {lesson.contentType === 'text' ? (
                                                <textarea
                                                    value={lesson.content || ''}
                                                    onChange={(e) => updateModuleLesson(mIdx, lIdx, 'content', e.target.value)}
                                                    className="w-full p-3 border rounded-lg text-sm"
                                                    rows={4}
                                                    placeholder="Enter lesson text content here..."
                                                />
                                            ) : lesson.contentType === 'video' || lesson.contentType === 'link' ? (
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                                                        {lesson.contentType === 'video' ? 'Video URL (YouTube/Vimeo)' : 'Resource URL'}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={lesson.content || ''}
                                                        onChange={(e) => updateModuleLesson(mIdx, lIdx, 'content', e.target.value)}
                                                        className="w-full p-2 border rounded-lg text-sm"
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 bg-white border border-dashed rounded text-xs text-slate-500">
                                                    {lesson.contentType === 'quiz' ? 'Quiz selection will be available in the Assessment step or future update.' : 'File upload coming soon. Please use external link for now.'}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
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

function Step8Review({ courseData, modules, settings, quickPublish, price }: any) {
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
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Review & Publish</h2>
                <p className="text-sm text-slate-500">Final check before going live.</p>
            </div>

            <div className={`p-4 rounded-lg border ${isValid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <h3 className={`font-bold mb-3 ${isValid ? 'text-green-800' : 'text-yellow-800'}`}>{isValid ? '✅ Ready to Publish' : '⚠️ Missing Requirements'}</h3>
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
