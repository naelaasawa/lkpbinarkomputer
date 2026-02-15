import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Award, Search } from "lucide-react";

export default async function CertificatesPage() {
    const { userId } = await auth();

    if (!userId) {
        return redirect("/");
    }

    const certificates = await prisma.certificate.findMany({
        include: {
            user: true,
            course: true,
        },
        orderBy: {
            issuedAt: 'desc'
        }
    });

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Issued Certificates</h1>
                    <p className="text-slate-500 mt-1">Monitor all certificates issued to students</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by student or course..."
                            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                    <div className="text-sm text-slate-500 ml-auto">
                        Total Issues: <span className="font-semibold text-slate-900">{certificates.length}</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Course</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Issued Date</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {certificates.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <Award className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                                        <p>No certificates issued yet.</p>
                                    </td>
                                </tr>
                            ) : (
                                certificates.map((cert) => (
                                    <tr key={cert.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                {cert.certificateNumber}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs mr-3">
                                                    {cert.user.role === 'USER' ? 'S' : 'A'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-slate-900">
                                                        {/* We don't have fullName in prisma user model visible here, usually it's in clerk or metadata. 
                                                            Checking schema: User has details? No, User model has 'role', 'email'. 
                                                            Wait, User model in schema.prisma DOES NOT have displayName/fullName.
                                                            It only has 'email'. 
                                                            Wait, let me check schema again. 
                                                         */}
                                                        {cert.user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-900 max-w-xs truncate" title={cert.course.title}>
                                                {cert.course.title}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-500">
                                                {cert.issuedAt.toLocaleDateString('id-ID', {
                                                    day: 'numeric', month: 'long', year: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {/* Actions */}
                                            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded font-medium">
                                                Active
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
