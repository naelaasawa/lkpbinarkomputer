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
                    // Template Dimensions: 1024px x 682px
                    const widthRatio = width / 1024;
                    const heightRatio = height / 682;
                    const newScale = Math.min(widthRatio, heightRatio) * 0.85; // Adjusted for better fit
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
                        <h1 className="font-bold text-2xl text-slate-900 mb-2">My Certificate</h1>
                        <p className="text-slate-500">Preview your certificate of completion below</p>
                    </div>

                    {/* PREVIEW CONTAINER */}
                    <div
                        ref={containerRef}
                        className="w-full relative flex items-center justify-center"
                        style={{
                            maxWidth: '900px',
                            aspectRatio: '1024/682',
                            overflow: 'visible',
                        }}
                    >
                        <div
                            style={{
                                width: '1024px',
                                height: '682px',
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
                <div ref={exportRef} style={{ width: '1024px', height: '682px', backgroundColor: '#ffffff' }}>
                    <CertificateContent user={user} course={course} />
                </div>
            </div>
        </div>
    );
}

// Certificate Content Component (1024x682 - matching template)
function CertificateContent({ user, course }: { user: any, course: any }) {
    const currentDate = new Date();
    const periodStr = currentDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
    const issueDateStr = currentDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div
            style={{
                width: '1024px',
                height: '682px',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#ffffff'
            }}
        >
            {/* Background Template Image */}
            <Image
                src="/template-sertifikat.png.jpeg"
                alt="Certificate Template"
                fill
                style={{ objectFit: 'cover' }}
                priority
            />

            {/* Text Overlays */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '48px'
                }}
            >
                {/* User Name - Center, ~290px from top */}
                <div
                    style={{
                        position: 'absolute',
                        top: '290px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        textAlign: 'center',
                        width: '80%'
                    }}
                >
                    <p
                        style={{
                            fontSize: '38px',
                            fontWeight: 'bold',
                            color: '#1a1a2e',
                            margin: 0,
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                        }}
                    >
                        {user?.fullName || "Student Name"}
                    </p>
                </div>

                {/* Course Name - Center, ~370px from top */}
                <div
                    style={{
                        position: 'absolute',
                        top: '370px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        textAlign: 'center',
                        width: '80%'
                    }}
                >
                    <p
                        style={{
                            fontSize: '28px',
                            fontWeight: 'bold',
                            color: '#1e40af',
                            margin: 0,
                            textTransform: 'uppercase',
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                        }}
                    >
                        {course.title}
                    </p>
                </div>

                {/* Predicate - Center, ~415px from top */}
                <div
                    style={{
                        position: 'absolute',
                        top: '415px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        textAlign: 'center'
                    }}
                >
                    <p
                        style={{
                            fontSize: '16px',
                            color: '#1e40af',
                            margin: 0
                        }}
                    >
                        {/* Predicate can be added here if available */}
                        {/* Dengan predikat {predicate} */}
                    </p>
                </div>

                {/* Period - Left bottom, ~565px from top */}
                <div
                    style={{
                        position: 'absolute',
                        top: '565px',
                        left: '190px',
                        textAlign: 'center'
                    }}
                >
                    <p
                        style={{
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#1a1a2e',
                            margin: 0
                        }}
                    >
                        {periodStr}
                    </p>
                </div>

                {/* Issue Date - Right bottom, ~565px from top */}
                <div
                    style={{
                        position: 'absolute',
                        top: '565px',
                        right: '190px',
                        textAlign: 'center'
                    }}
                >
                    <p
                        style={{
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#1a1a2e',
                            margin: 0
                        }}
                    >
                        {issueDateStr}
                    </p>
                </div>
            </div>
        </div>
    );
}
