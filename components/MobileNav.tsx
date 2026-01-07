'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, LayoutDashboard } from 'lucide-react';

interface MobileNavProps {
    isLoggedIn: boolean;
    userEmail?: string;
}

export default function MobileNav({ isLoggedIn }: MobileNavProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <>
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
                {isLoggedIn ? (
                    <Link
                        href="/dashboard"
                        className="text-blue-600 font-bold text-sm flex items-center gap-1.5 touch-manipulation"
                    >
                        <LayoutDashboard size={18} />
                        <span className="hidden xs:inline">Dashboard</span>
                    </Link>
                ) : (
                    <Link
                        href="/dashboard"
                        className="text-blue-600 font-semibold text-sm touch-manipulation min-h-[44px] flex items-center"
                    >
                        Masuk
                    </Link>
                )}
                <button
                    onClick={toggleMenu}
                    className="text-slate-700 p-2 touch-manipulation hover:bg-slate-100 rounded-lg transition-colors"
                    aria-label="Toggle menu"
                    aria-expanded={isMenuOpen}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
                    onClick={closeMenu}
                    aria-hidden="true"
                />
            )}

            {/* Mobile Menu Panel */}
            <div
                className={`fixed top-16 right-0 w-64 h-[calc(100vh-4rem)] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <nav className="flex flex-col p-6 space-y-6">
                    <Link
                        href="#program"
                        onClick={closeMenu}
                        className="text-slate-700 hover:text-blue-600 font-medium text-base py-3 border-b border-slate-100 touch-manipulation transition-colors"
                    >
                        Program
                    </Link>
                    <Link
                        href="#about"
                        onClick={closeMenu}
                        className="text-slate-700 hover:text-blue-600 font-medium text-base py-3 border-b border-slate-100 touch-manipulation transition-colors"
                    >
                        Tentang Kami
                    </Link>
                    <Link
                        href="#contact"
                        onClick={closeMenu}
                        className="text-slate-700 hover:text-blue-600 font-medium text-base py-3 border-b border-slate-100 touch-manipulation transition-colors"
                    >
                        Kontak
                    </Link>

                    {!isLoggedIn && (
                        <Link
                            href="/sign-up"
                            onClick={closeMenu}
                            className="mt-4 px-6 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md text-center touch-manipulation min-h-[44px] flex items-center justify-center"
                        >
                            Daftar Sekarang
                        </Link>
                    )}
                </nav>
            </div>
        </>
    );
}
