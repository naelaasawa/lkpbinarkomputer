import Link from 'next/link';
import { ArrowLeft, Star, Monitor, BookOpen, Users, ChevronRight } from 'lucide-react';

export default function ProgramPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            {/* Back Button */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors group min-h-[44px] touch-manipulation"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Kembali
                </Link>
            </div>

            {/* Page Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="text-center mb-12 md:mb-16">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        Program Unggulan
                    </h1>
                    <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
                        Pilih program yang sesuai dengan minat dan tujuan karirmu
                    </p>
                </div>

                {/* Program Cards Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {[
                        {
                            title: 'Administrasi Perkantoran Modern',
                            category: 'Microsoft Office',
                            level: 'Beginner',
                            sessions: 12,
                            students: 150,
                            price: 500000,
                            originalPrice: 750000,
                        },
                        {
                            title: 'Desain Grafis Profesional',
                            category: 'Adobe Creative Suite',
                            level: 'Intermediate',
                            sessions: 16,
                            students: 120,
                            price: 750000,
                            originalPrice: 1000000,
                        },
                        {
                            title: 'Web Development Fundamental',
                            category: 'HTML, CSS, JavaScript',
                            level: 'Beginner',
                            sessions: 20,
                            students: 200,
                            price: 900000,
                            originalPrice: 1200000,
                        },
                    ].map((program, i) => (
                        <div
                            key={i}
                            className="group bg-white rounded-2xl border border-blue-100 shadow-sm hover:shadow-2xl hover:shadow-blue-100 transition-all duration-300 overflow-hidden hover:-translate-y-2"
                        >
                            {/* Card Image/Thumbnail */}
                            <div className="h-40 md:h-48 bg-gradient-to-br from-blue-500 to-blue-700 relative overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500">
                                    <Monitor size={56} className="opacity-90" />
                                </div>
                                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 shadow-sm flex items-center gap-1">
                                    <Star size={14} className="fill-yellow-400 text-yellow-400" /> 4.9
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-5 md:p-6">
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-md">
                                        {program.category}
                                    </span>
                                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">
                                        {program.level}
                                    </span>
                                </div>

                                <h3 className="text-base md:text-lg font-bold text-slate-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                                    {program.title}
                                </h3>

                                <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                                    <span className="flex items-center gap-1.5">
                                        <BookOpen size={16} /> {program.sessions} Sesi
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Users size={16} /> {program.students} Siswa
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div>
                                        <span className="text-xs text-slate-400 line-through block">
                                            Rp {program.originalPrice.toLocaleString('id-ID')}
                                        </span>
                                        <p className="text-lg md:text-xl font-bold text-blue-600">
                                            Rp {program.price.toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                    <button className="p-2.5 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-colors touch-manipulation group/btn">
                                        <ChevronRight size={20} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Additional Info */}
                <div className="mt-12 md:mt-16 text-center">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-100 text-blue-700 rounded-full font-medium">
                        <Star size={18} className="fill-blue-700" />
                        Semua program termasuk sertifikat resmi dari LKP Binar Komputer
                    </div>
                </div>
            </div>
        </div>
    );
}
