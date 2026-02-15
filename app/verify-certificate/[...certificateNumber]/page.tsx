import { prisma } from "@/lib/prisma";
import { CheckCircle, XCircle, FileText, Calendar, User, BookOpen } from "lucide-react";
import Link from "next/link";

interface VerifyCertificatePageProps {
    params: {
        certificateNumber: string[];
    };
}

export default async function VerifyCertificatePage({
    params,
}: VerifyCertificatePageProps) {
    // Decode certificate number from URL segments
    // e.g., ["001", "BKOMP", "PKO", "II", "2026"] -> "001/BKOMP/PKO/II/2026"
    const certificateNumber = params.certificateNumber.map(decodeURIComponent).join("/");

    console.log("[VERIFY] Checking certificate:", certificateNumber);

    const certificate = await prisma.certificate.findUnique({
        where: {
            certificateNumber: certificateNumber,
        },
        include: {
            course: true,
            user: true,
        },
    });

    if (!certificate) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">
                        Certificate Not Found
                    </h1>
                    <p className="text-slate-500 mb-6">
                        We could not verify the certificate with number:
                        <br />
                        <span className="font-mono bg-slate-100 px-3 py-1 rounded text-slate-700 mt-2 inline-block text-sm border border-slate-200">
                            {certificateNumber}
                        </span>
                    </p>
                    <div className="space-y-3">
                        <Link
                            href="/"
                            className="block w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition"
                        >
                            Go to Homepage
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Format dates
    const issuedDate = new Date(certificate.issuedAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
            <div className="bg-white p-0 rounded-2xl shadow-lg border border-slate-200 max-w-lg w-full overflow-hidden">

                {/* Header */}
                <div className="bg-emerald-500 p-8 text-center text-white">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30">
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold mb-1">
                        Certificate Verified
                    </h1>
                    <p className="opacity-90 text-sm">
                        This certificate is valid and issued by LKP Binar Komputer.
                    </p>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">

                    {/* Certificate Number */}
                    <div className="text-center pb-6 border-b border-slate-100">
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Certificate Number</p>
                        <p className="font-mono text-slate-700 bg-slate-50 px-3 py-1 rounded border border-slate-200 inline-block text-sm">
                            {certificate.certificateNumber}
                        </p>
                    </div>

                    <div className="grid grid-cols-[24px_1fr] gap-4 items-start">
                        <User className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Holder</p>
                            <p className="font-bold text-lg text-slate-900">{certificate.userName}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-[24px_1fr] gap-4 items-start">
                        <BookOpen className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Course</p>
                            <p className="font-bold text-lg text-slate-900">{certificate.courseName}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-[24px_1fr] gap-4 items-start">
                        <FileText className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Predicate</p>
                            <p className="font-bold text-emerald-600">{certificate.predicate}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-[24px_1fr] gap-4 items-start">
                        <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Issued On</p>
                            <p className="text-slate-900">{issuedDate}</p>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="bg-slate-50 p-6 border-t border-slate-100">
                    <Link
                        href="/"
                        className="block w-full bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition text-center shadow-sm"
                    >
                        Visit LKP Binar Komputer
                    </Link>
                    <p className="mt-4 text-center text-slate-400 text-xs text-[10px] uppercase tracking-widest">
                        Verified by LKP Binar Komputer System
                    </p>
                </div>
            </div>
        </div>
    );
}
