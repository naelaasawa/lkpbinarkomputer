"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Download, ArrowLeft, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CertificatePage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = use(params);
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [claimed, setClaimed] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Initial check and preview load
    useEffect(() => {
        // We can load the preview URL immediately since it's just a GET request
        setPreviewUrl(`/api/courses/${courseId}/certificate/preview`);
    }, [courseId]);

    const handleClaim = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/courses/${courseId}/certificate`, {
                method: "POST"
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text);
            }

            const data = await res.json();
            setClaimed(true);
            setUserEmail(data.email);
            toast.success("Certificate sent to your email!");

        } catch (error) {
            console.error(error);
            // @ts-ignore
            toast.error(error.message || "Failed to claim certificate");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Link href={`/courses/${courseId}/learn`} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition">
                        <ArrowLeft size={18} />
                        <span className="font-medium">Back to Course</span>
                    </Link>
                    <div className="font-bold text-slate-900">Certificate Review</div>
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-12">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">

                    {/* Left: Preview */}
                    <div className="flex-1 bg-slate-100 p-8 flex items-center justify-center border-r border-slate-200 min-h-[400px]">
                        {previewUrl ? (
                            <iframe
                                src={previewUrl}
                                className="w-full h-full min-h-[500px] shadow-lg rounded-lg border border-slate-200"
                                title="Certificate Preview"
                            />
                        ) : (
                            <div className="flex items-center gap-2 text-slate-400">
                                <Loader2 className="animate-spin" /> Loading preview...
                            </div>
                        )}
                    </div>

                    {/* Right: Actions */}
                    <div className="w-full md:w-96 p-8 flex flex-col items-center text-center justify-center">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle size={32} />
                        </div>

                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Congratulations!</h1>
                        <p className="text-slate-500 mb-8">
                            You have successfully completed the course. Your certificate is ready to be claimed.
                        </p>

                        {!claimed ? (
                            <button
                                onClick={handleClaim}
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Mail size={20} />
                                        Claim & Send to Email
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="w-full bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-emerald-800">
                                <h3 className="font-bold flex items-center justify-center gap-2 mb-1">
                                    <CheckCircle size={16} /> Successfully Sent!
                                </h3>
                                <p className="text-sm opacity-80">
                                    Check your inbox <strong>{userEmail}</strong>
                                </p>
                            </div>
                        )}

                        <p className="mt-6 text-xs text-slate-400 max-w-xs">
                            Please verify your name on the certificate preview. It matches your account profile name.
                        </p>
                    </div>

                </div>
            </main>
        </div>
    );
}
