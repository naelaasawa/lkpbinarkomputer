"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ArrowLeft, Download, Mail, Share2, Trophy, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";

interface CertificatePageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function CertificatePage({ params }: CertificatePageProps) {
    const { user, isLoaded: isAuthLoaded } = useUser();
    const router = useRouter();

    const [courseId, setCourseId] = useState<string>("");
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState("");
    const [sendingEmail, setSendingEmail] = useState(false);

    useEffect(() => {
        params.then((unwrappedParams) => {
            setCourseId(unwrappedParams.id);
        });
    }, [params]);

    useEffect(() => {
        if (!courseId || !isAuthLoaded) return;
        if (!user) {
            router.push("/sign-in");
            return;
        }

        const fetchCourse = async () => {
            try {
                const res = await fetch(`/api/courses/${courseId}`);
                if (!res.ok) throw new Error("Failed to fetch course");
                const data = await res.json();
                setCourse(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching course:", error);
                toast.error("Could not load course details");
                router.push("/dashboard");
            }
        };

        fetchCourse();
    }, [courseId, user, isAuthLoaded, router]);

    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const exportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (width && height) {
                    // 16:9 Landscape Dimensions: 1280px x 720px
                    const widthRatio = width / 1280;
                    const heightRatio = height / 720;
                    const newScale = Math.min(widthRatio, heightRatio) * 0.50; // Reduced to 0.50
                    setScale(newScale);
                }
            }
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const handleDownload = async () => {
        if (!exportRef.current) return;

        const toastId = toast.loading("Generating certificate image...");
        try {
            const canvas = await html2canvas(exportRef.current, {
                scale: 2,
                backgroundColor: "#ffffff",
                useCORS: true,
                logging: false,
            });

            const image = canvas.toDataURL("image/png");
            const cleanName = (name: string) => name.replace(/[\s]/g, "_").replace(/[^a-zA-Z0-9_\-]/g, "");
            const safeUserName = cleanName(user?.fullName || "Student");
            const safeCourseTitle = cleanName(course?.title || "Course");
            const filename = `Certificate_${safeUserName}_${safeCourseTitle}.png`;

            const link = document.createElement("a");
            link.href = image;
            link.download = filename;
            link.click();

            toast.success("Certificate downloaded successfully!", { id: toastId });
        } catch (error) {
            console.error("Download failed:", error);
            const msg = error instanceof Error ? error.message : "Failed to generate certificate";
            toast.error(msg, { id: toastId });
        }
    };

    const handleSendEmail = async () => {
        if (!email || !email.includes("@")) {
            toast.error("Please enter a valid email address");
            return;
        }

        setSendingEmail(true);
        try {
            const res = await fetch(`/api/courses/${courseId}/certificate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            if (!res.ok) throw new Error("Failed to send");
            toast.success(`Certificate sent to ${email}`);
            setEmail("");
        } catch (error) {
            toast.error("Failed to send email");
        } finally {
            setSendingEmail(false);
        }
    };

    const handleShare = async () => {
        try {
            const url = window.location.href;
            await navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard!");
        } catch (err) {
            console.error("Share failed:", err);
            toast.error("Failed to copy link");
        }
    };

    if (loading || !course) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto flex flex-col gap-8">
                <button
                    onClick={() => router.push(`/courses/${courseId}`)}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors w-fit"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Course</span>
                </button>

                {/* MAIN CERTIFICATE DISPLAY */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col items-center p-8 md:p-12 relative w-full">
                    <div className="mb-6 text-center">
                        <h1 className="font-bold text-2xl text-slate-900 mb-2">Course Certificate</h1>
                        <p className="text-slate-500">Preview your certificate of completion below</p>
                    </div>

                    {/* PREVIEW CONTAINER */}
                    <div
                        ref={containerRef}
                        className="w-full relative flex items-center justify-center"
                        style={{
                            maxWidth: '900px',
                            aspectRatio: '16/9',
                            overflow: 'visible',
                        }}
                    >
                        <div
                            style={{
                                width: '1280px',
                                height: '720px',
                                transform: `scale(${scale})`,
                                transformOrigin: 'center center',
                                position: 'absolute',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
                            }}
                        >
                            <CertificateContent user={user} course={course} />
                        </div>
                    </div>
                </div>

                {/* ACTION PANEL */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 w-full">
                    <h2 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
                        <Trophy className="text-yellow-500" size={24} />
                        Certificate Actions
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                                <Share2 size={18} className="text-blue-500" />
                                Share & Download
                            </h3>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleShare}
                                    className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <Share2 size={18} />
                                    Copy Link
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                                >
                                    <Download size={18} />
                                    Download PNG
                                </button>
                            </div>
                            <p className="text-xs text-slate-400">
                                Download high-quality 16:9 PNG (2560 x 1440 px).
                            </p>
                        </div>

                        <div className="space-y-4 pt-6 md:pt-0 md:border-l md:border-slate-100 md:pl-8">
                            <h3 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                                <Mail size={18} className="text-emerald-500" />
                                Send to Email
                            </h3>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter recipient email"
                                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                />
                                <button
                                    onClick={handleSendEmail}
                                    disabled={sendingEmail}
                                    className="px-6 py-3 bg-white border border-slate-200 hover:border-blue-300 text-slate-700 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    {sendingEmail ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-slate-400 text-xs text-center py-4">
                    LKP BINAR KOMPUTER &copy; {new Date().getFullYear()}
                </div>
            </div>

            {/* HIDDEN EXPORT DOM */}
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', visibility: 'hidden', overflow: 'hidden' }}>
                <div ref={exportRef} style={{ width: '1280px', height: '720px', backgroundColor: '#ffffff' }}>
                    <CertificateContent user={user} course={course} />
                </div>
            </div>
        </div>
    );
}

// Certificate Content Component (16:9 - 1280x720)
function CertificateContent({ user, course }: { user: any, course: any }) {
    return (
        <div
            style={{
                width: '1280px',
                height: '720px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: '48px',
                border: '12px double #0f172a',
                backgroundImage: "radial-gradient(circle at center, #ffffff 0%, #f8fafc 100%)",
                boxSizing: 'border-box',
                position: 'relative',
                backgroundColor: '#ffffff'
            }}
        >
            {/* Ornamental Corners */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', width: '70px', height: '70px', borderTop: '4px solid #eab308', borderLeft: '4px solid #eab308' }}></div>
            <div style={{ position: 'absolute', top: '20px', right: '20px', width: '70px', height: '70px', borderTop: '4px solid #eab308', borderRight: '4px solid #eab308' }}></div>
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', width: '70px', height: '70px', borderBottom: '4px solid #eab308', borderLeft: '4px solid #eab308' }}></div>
            <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '70px', height: '70px', borderBottom: '4px solid #eab308', borderRight: '4px solid #eab308' }}></div>

            <div style={{ marginBottom: '32px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: "#2563eb", color: "#ffffff", display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                    <Trophy size={36} />
                </div>
                <h2 style={{ color: '#2563eb', fontWeight: 'bold', letterSpacing: '0.25em', textTransform: 'uppercase', fontSize: '14px', margin: 0 }}>Certificate of Completion</h2>
                <h1 style={{ fontSize: '48px', fontFamily: 'serif', color: '#0f172a', fontWeight: 'bold', margin: '16px 0' }}>LKP BINAR KOMPUTER</h1>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', alignItems: 'center' }}>
                <p style={{ color: '#64748b', fontStyle: 'italic', fontSize: '16px', margin: 0 }}>This is to certify that</p>
                <p style={{ fontSize: '36px', fontFamily: 'serif', fontWeight: 'bold', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginTop: '12px', marginBottom: '12px', minWidth: '400px' }}>
                    {user?.fullName || "Student Name"}
                </p>
                <p style={{ color: '#64748b', fontStyle: 'italic', fontSize: '16px', margin: '12px 0' }}>has successfully completed the course</p>
                <h3 style={{ fontSize: '30px', fontWeight: 'bold', color: '#1d4ed8', textTransform: 'uppercase', margin: 0 }}>
                    {course.title}
                </h3>
            </div>

            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '32px', borderTop: '1px solid #e2e8f0', paddingTop: '20px', paddingLeft: '20px', paddingRight: '20px' }}>
                <div style={{ textAlign: 'left' }}>
                    <div style={{ height: '32px', marginBottom: '8px' }}></div>
                    <p style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '16px', margin: 0 }}>Instructor Name</p>
                    <p style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Instructor</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#0f172a', fontWeight: 'bold', fontSize: '16px', margin: 0 }}>{new Date().toLocaleDateString()}</p>
                    <p style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Date</p>
                </div>
            </div>
        </div>
    );
}
