'use client';

import Link from 'next/link';
import { ArrowRight, Zap, TrendingUp, Flag } from 'lucide-react';

export default function ProgramUnggulanSection() {
    return (
        <section id="courses" className="py-16 md:py-20 bg-gradient-to-b from-white to-blue-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        Program Kami
                    </h2>
                    <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
                        Rencana pembelajaran terstruktur untuk masa depan yang lebih cerah
                    </p>
                </div>

                {/* Program Categories Grid */}
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mb-12">
                    {/* Jangka Pendek */}
                    <div className="group bg-white rounded-3xl p-6 md:p-8 border border-blue-100 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 opacity-10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:opacity-20 transition-opacity"></div>

                        <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-200">
                                <Zap size={32} className="text-white" />
                            </div>

                            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">
                                Program Jangka Pendek
                            </h3>

                            <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                                Motivasi belajar dan pembelajaran kilat untuk hasil cepat
                            </p>
                        </div>
                    </div>

                    {/* Jangka Menengah */}
                    <div className="group bg-white rounded-3xl p-6 md:p-8 border border-blue-100 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-blue-600 opacity-10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:opacity-20 transition-opacity"></div>

                        <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-purple-200">
                                <TrendingUp size={32} className="text-white" />
                            </div>

                            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">
                                Program Jangka Menengah
                            </h3>

                            <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                                Fokus skill Office, Desain, dan Website untuk karir profesional
                            </p>
                        </div>
                    </div>

                    {/* Jangka Panjang */}
                    <div className="group bg-white rounded-3xl p-6 md:p-8 border border-blue-100 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden sm:col-span-2 md:col-span-1">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400 to-blue-600 opacity-10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:opacity-20 transition-opacity"></div>

                        <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-orange-200">
                                <Flag size={32} className="text-white" />
                            </div>

                            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">
                                Program Jangka Panjang
                            </h3>

                            <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                                Pendampingan pendidikan 1 tahun berbasis Industri 4.0
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA Button */}
                <div className="flex justify-center">
                    <Link
                        href="/program"
                        className="group min-h-[48px] md:min-h-[56px] px-8 md:px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl md:rounded-2xl font-bold text-base md:text-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-300 active:scale-95 transition-all duration-300 flex items-center gap-3 touch-manipulation"
                    >
                        Lihat Detail Program
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
