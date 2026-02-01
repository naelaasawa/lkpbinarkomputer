import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Award, Calendar, ArrowRight, ExternalLink } from "lucide-react";

export default async function CertificateListPage() {
    const user = await currentUser();

    if (!user) {
        return redirect("/sign-in");
    }

    const certificates = await prisma.certificate.findMany({
        where: {
            user: {
                clerkId: user.id
            }
        },
        include: {
            course: true
        },
        orderBy: {
            issuedAt: 'desc'
        }
    });

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">My Certificates</h1>
                    <p className="text-slate-600 mt-2">View and manage your earned certificates.</p>
                </div>

                {certificates.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <Award size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">No certificates yet</h3>
                        <p className="text-slate-500 mb-6">Complete courses to earn certificates.</p>
                        <Link
                            href="/courses"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
                        >
                            Browse Courses
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {certificates.map((cert) => (
                            <div key={cert.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                                {/* Thumbnail Preview */}
                                <div className="aspect-[16/9] relative border-b border-slate-100 bg-white p-4 flex items-center justify-center overflow-hidden group-hover:bg-slate-50 transition-colors">
                                    <div className="w-full h-full border-[6px] double border-slate-800 bg-white relative flex flex-col items-center justify-center text-center p-2 shadow-sm transform group-hover:scale-[1.02] transition-transform duration-500">
                                        {/* Decorative Corner */}
                                        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-yellow-500"></div>
                                        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-yellow-500"></div>

                                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mb-2">
                                            <Award size={16} />
                                        </div>
                                        <h4 className="text-[10px] uppercase tracking-widest text-blue-600 font-bold mb-1">Certificate</h4>
                                        <div className="text-[14px] font-serif font-bold text-slate-900 line-clamp-1 leading-tight mb-1 px-4">
                                            {cert.course.title}
                                        </div>
                                        <div className="text-[8px] text-slate-500 italic">
                                            Awarded to {user.fullName}
                                        </div>
                                        <div className="text-[8px] text-slate-400 mt-2 font-mono">
                                            {cert.issuedAt.toLocaleDateString()}
                                        </div>
                                    </div>

                                    {/* Overlay Action */}
                                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center">
                                        <span className="bg-white text-slate-900 px-4 py-2 rounded-full text-xs font-bold shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                            View Details
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2" title={cert.course.title}>
                                        {cert.course.title}
                                    </h3>

                                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                                        <Calendar size={14} />
                                        <span>Issued on {cert.issuedAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </div>

                                    <Link
                                        href={`/certificate/${cert.courseId}`}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                                    >
                                        <ExternalLink size={16} />
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
