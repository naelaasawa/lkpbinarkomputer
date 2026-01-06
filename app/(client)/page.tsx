import Link from "next/link";
import { ArrowRight, BookOpen, Users, Award, ChevronRight, Star, Monitor, Code, CheckCircle, Menu, FileText, Smile, Briefcase, GraduationCap, Printer, Wifi, Home, Banknote, Heart, Handshake, MapPin, Phone, Mail, HelpCircle, ChevronDown, Target, LayoutDashboard } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";

export default async function LandingPage() {
  const user = await currentUser();

  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-blue-600">LKP BINAR</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#program" className="text-slate-600 hover:text-blue-600 text-sm font-medium">Program</Link>
              <Link href="#about" className="text-slate-600 hover:text-blue-600 text-sm font-medium">Tentang Kami</Link>
              <Link href="#contact" className="text-slate-600 hover:text-blue-600 text-sm font-medium">Kontak</Link>

              {user ? (
                <Link href="/dashboard" className="px-5 py-2.5 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/dashboard" className="text-blue-600 font-semibold text-sm hover:underline">Masuk</Link>
                  <Link href="/sign-up" className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
                    Daftar Sekarang
                  </Link>
                </>
              )}
            </div>
            <div className="md:hidden flex items-center gap-4">
              {user ? (
                <Link href="/dashboard" className="text-blue-600 font-bold text-sm">Dashboard</Link>
              ) : (
                <Link href="/dashboard" className="text-blue-600 font-semibold text-sm">Masuk</Link>
              )}
              <button className="text-slate-700">
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#2563EB_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-6 border border-blue-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Pendaftaran Batch Baru Dibuka
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
                Binar Komputer <br className="hidden lg:block" />
                <span className="text-blue-600">Tegal</span>
              </h1>
              <h2 className="text-xl md:text-2xl text-slate-600 font-medium mb-4">
                Rumah belajar komputer berbasis privat
              </h2>
              <p className="text-base md:text-lg text-slate-500 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Mengembangkan keterampilan digital, kesiapan kerja, dan kemandirian peserta didik.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="#courses" className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                  Lihat Program <ArrowRight size={18} />
                </Link>
                <Link href="https://wa.me/6281234567890" className="px-8 py-3.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center">
                  Daftar Konsultasi
                </Link>
              </div>
            </div>
            <div className="flex-1 w-full max-w-lg lg:max-w-none">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full blur-3xl opacity-70"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
                  {/* Abstract Educational Illustration (Composition of icons/elements) */}
                  <div className="aspect-[4/3] bg-slate-50 rounded-2xl relative overflow-hidden flex items-center justify-center">
                    <div className="absolute top-10 left-10 p-3 bg-white rounded-xl shadow-lg animate-bounce duration-[3000ms]">
                      <Code size={32} className="text-blue-500" />
                    </div>
                    <div className="absolute bottom-10 right-10 p-3 bg-white rounded-xl shadow-lg animate-bounce duration-[3000ms] delay-700">
                      <Monitor size={32} className="text-purple-500" />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                      <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center shadow-inner">
                        <BookOpen size={40} className="text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tentang Kami Section */}
      <section className="py-16 bg-white border-b border-slate-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-4 tracking-wide uppercase">
            Tentang Kami
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            LKP Binar Komputer
          </h2>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto mb-10">
            "LKP Binar Komputer Tegal berdiri sejak 2016 sebagai rumah belajar komputer berbasis privat dengan pendekatan kekeluargaan dan pembelajaran personal."
          </p>
          <Link href="/profile" className="inline-flex items-center gap-2 font-bold text-blue-600 hover:text-blue-700 transition-colors group">
            Profil Lengkap <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Profil Lembaga Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Profil Lembaga</h2>
            <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-building-2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Sejarah Kami</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Binar Komputer Tegal berdiri sejak Februari 2016 sebagai bentuk kepedulian terhadap kebutuhan keterampilan komputer di dunia pendidikan dan kerja.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Sistem Privat</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Dengan sistem belajar privat (1 guru 1 siswa atau maksimal 4 siswa), proses pembelajaran dibuat lebih fokus, efektif, dan personal.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6 text-orange-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart-handshake"><path d="M19 14c1.49-1.28 3.6-1.28 5.14 0 1.55 1.28 1.55 3.36 0 4.64-1.54 1.28-3.6 1.28-5.14 0l-1.29-1.07a6.6 6.6 0 0 1-5.18-8.62L13.84 8" /><path d="M6 14.64a5 5 0 0 1-7.06-7.06A6 6 0 0 1 6 5a6 6 0 0 0 6 6l-1 1" /><path d="M12 12 10 10" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Komitmen Kami</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Berawal dari inisiatif lima pemuda, Binar Komputer Tegal berkembang sebagai lembaga non-profit yang berkomitmen mencerdaskan masyarakat melalui pendidikan komputer yang aplikatif.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visi & Misi Section */}
      <section className="py-20 bg-blue-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5">
          <svg width="300" height="300" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" /></svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Visi */}
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-blue-100 border border-white/50 backdrop-blur-sm relative">
              <div className="absolute top-8 left-8 text-6xl text-blue-100 font-serif opacity-50">"</div>
              <h3 className="text-sm font-bold tracking-widest text-blue-600 uppercase mb-6 flex items-center gap-2">
                <div className="w-8 h-1 bg-blue-600 rounded-full"></div> Visi Kami
              </h3>
              <p className="text-2xl font-serif text-slate-800 leading-relaxed italic relative z-10">
                Menjadi partner pendidikan berkualitas berbasis kekeluargaan dalam dunia pendidikan komputer dan industri penunjangnya.
              </p>
            </div>

            {/* Misi */}
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
                  <Target size={20} />
                </span>
                Misi Utama
              </h3>
              <ul className="space-y-6 mb-8">
                <li className="flex gap-4">
                  <div className="mt-1 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                    <Handshake size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Kolaborasi Industri</h4>
                    <p className="text-slate-600 text-sm">Kerja sama dengan praktisi pendidikan dan industri</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                    <Users size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Peningkatan Keterampilan</h4>
                    <p className="text-slate-600 text-sm">Peningkatan keterampilan komputer masyarakat, khususnya pelajar</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                    <Smile size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Pembentukan Karakter</h4>
                    <p className="text-slate-600 text-sm">Pembentukan mental, kreativitas, dan kemandirian</p>
                  </div>
                </li>
              </ul>
              <button className="px-6 py-3 bg-white text-blue-600 border border-blue-200 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-sm flex items-center gap-2">
                <FileText size={18} />
                Detail Visi & Misi
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Prestasi & Dampak Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5">
          <Award size={120} className="text-blue-600" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Prestasi & Dampak</h2>
            <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
            <p className="mt-4 text-slate-600">Bukti nyata komitmen kami dalam mencerdaskan kehidupan bangsa.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Highlight 1: 70+ Peserta */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                <Users size={32} />
              </div>
              <span className="block text-5xl font-extrabold text-blue-600 mb-2">70+</span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Peserta Didik</h3>
              <p className="text-slate-600 text-sm">
                Dari berbagai usia telah bergabung dan belajar bersama kami.
              </p>
            </div>

            {/* Highlight 2: Outcomes */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center group">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-green-600 group-hover:scale-110 transition-transform">
                <Briefcase size={32} />
              </div>
              <span className="block text-5xl font-extrabold text-green-500 mb-2">2-3</span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Bulan Siap Kerja</h3>
              <p className="text-slate-600 text-sm">
                Lulusan terserap bekerja, lanjut kuliah, atau berwirausaha.
              </p>
            </div>

            {/* Highlight 3: Scholarship */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-16 -mt-16"></div>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white group-hover:scale-110 transition-transform backdrop-blur-sm">
                <Heart size={32} />
              </div>
              <span className="block text-5xl font-extrabold text-yellow-300 mb-2 drop-shadow-sm">30%</span>
              <h3 className="text-lg font-bold text-white mb-2">Beasiswa Pendidikan</h3>
              <p className="text-blue-100 text-sm">
                Bantuan biaya bagi peserta didik yang kurang mampu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pengajar Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 order-2 md:order-1">
              <div className="relative">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-blue-100 rounded-full opacity-50 blur-xl"></div>
                <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-24 h-24 bg-purple-100 rounded-full opacity-50 blur-xl"></div>
                <div className="relative bg-slate-50 rounded-2xl p-2 grid grid-cols-2 gap-2 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="h-32 bg-slate-200 rounded-xl overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-100 text-blue-500">
                      <Users size={32} />
                    </div>
                  </div>
                  <div className="h-32 bg-slate-200 rounded-xl overflow-hidden relative mt-4">
                    <div className="absolute inset-0 flex items-center justify-center bg-purple-100 text-purple-500">
                      <Award size={32} />
                    </div>
                  </div>
                  <div className="h-32 bg-slate-200 rounded-xl overflow-hidden relative -mt-4">
                    <div className="absolute inset-0 flex items-center justify-center bg-orange-100 text-orange-500">
                      <BookOpen size={32} />
                    </div>
                  </div>
                  <div className="h-32 bg-slate-200 rounded-xl overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center bg-green-100 text-green-500">
                      <Monitor size={32} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 order-1 md:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-6">
                <Star size={12} className="fill-blue-600" />
                Tim Profesional
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Pengajar & Pembimbing</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                Didukung oleh tim pengajar dan pembimbing berpengalaman dengan struktur organisasi yang jelas, sehingga proses belajar berjalan terarah dan optimal.
              </p>
              <div className="flex gap-8 border-t border-slate-100 pt-8">
                <div>
                  <h4 className="font-bold text-slate-900 text-lg mb-1">Berpengalaman</h4>
                  <p className="text-sm text-slate-500">Praktisi Industri</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg mb-1">Terstruktur</h4>
                  <p className="text-sm text-slate-500">Kurikulum Jelas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Section */}
      <section id="program" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Program Kami</h2>
            <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
            <p className="mt-4 text-slate-600">Rencana pembelajaran terstruktur untuk masa depan yang lebih cerah.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1: Jangka Pendek */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden group flex flex-col">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Program Jangka Pendek</h3>
              <p className="text-slate-600 leading-relaxed mb-6 flex-grow">
                Motivasi belajar dan pembelajaran kilat
              </p>
            </div>

            {/* Card 2: Jangka Menengah */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden group flex flex-col">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-6 text-purple-600 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Program Jangka Menengah</h3>
              <p className="text-slate-600 leading-relaxed mb-6 flex-grow">
                Fokus skill Office, Desain, dan Website
              </p>
            </div>

            {/* Card 3: Jangka Panjang */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden group flex flex-col">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>
              </div>
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-6 text-orange-600 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Program Jangka Panjang</h3>
              <p className="text-slate-600 leading-relaxed mb-6 flex-grow">
                Pendampingan pendidikan dan kursus 1 tahun berbasis Industri 4.0
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href="/courses" className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
              Lihat Detail Program <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Kegiatan Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Kegiatan Kami</h2>
            <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { title: "Pelatihan Komputer", icon: Monitor, color: "bg-blue-100 text-blue-600" },
              { title: "Motivasi Belajar", icon: Star, color: "bg-yellow-100 text-yellow-600" },
              { title: "Psikotest", icon: FileText, color: "bg-purple-100 text-purple-600" },
              { title: "Beauty Class", icon: Smile, color: "bg-pink-100 text-pink-600" },
              { title: "Pendampingan Kerja", icon: Briefcase, color: "bg-green-100 text-green-600" }
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center gap-4 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.color}`}>
                  <item.icon size={20} />
                </div>
                <span className="font-bold text-slate-700 text-sm">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Fasilitas & Pendanaan Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Fasilitas & Pendanaan</h2>
            <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Fasilitas */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Monitor size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Fasilitas Belajar</h3>
                  <p className="text-sm text-slate-500">Sarana penunjang pembelajaran</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Monitor, label: "Laptop", color: "text-blue-500" },
                  { icon: Printer, label: "Printer", color: "text-orange-500" },
                  { icon: BookOpen, label: "Perpustakaan", color: "text-purple-500" },
                  { icon: Wifi, label: "Internet", color: "text-green-500" },
                  { icon: Home, label: "Ruang Belajar", color: "text-red-500" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <item.icon size={18} className={item.color} />
                    <span className="font-medium text-slate-700">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pendanaan */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <Banknote size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Sumber Pendanaan</h3>
                  <p className="text-sm text-slate-500">Transparansi pengelolaan dana</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { icon: Banknote, label: "Iuran Peserta Didik", desc: "Kontribusi biaya pendidikan yang terjangkau." },
                  { icon: Heart, label: "Kontribusi Pengurus", desc: "Dukungan sukarela dari pengurus yayasan." },
                  { icon: Handshake, label: "Kerja Sama & Proyek", desc: "Kolaborasi proyek pendukung operasional." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 items-start">
                    <div className="mt-1">
                      <item.icon size={20} className="text-slate-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.label}</h4>
                      <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Mengapa Belajar di Binar?</h2>
            <p className="text-slate-600">Kami menggabungkan kurikulum industri dengan pendekatan personal untuk hasil belajar maksimal.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Pendekatan Privat",
                desc: "Satu mentor untuk sedikit siswa, memastikan materi tersampaikan dengan efektif dan personal.",
                icon: Users,
                color: "bg-blue-100 text-blue-600"
              },
              {
                title: "Keterampilan Digital",
                desc: "Materi yang relevan dengan kebutuhan industri saat ini, dari dasar hingga mahir.",
                icon: Monitor,
                color: "bg-purple-100 text-purple-600"
              },
              {
                title: "Suasana Kekeluargaan",
                desc: "Belajar nyaman tanpa tekanan, seperti belajar di rumah sendiri dengan mentor yang ramah.",
                icon: Award,
                color: "bg-orange-100 text-orange-600"
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses Preview */}
      <section id="courses" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Program Unggulan</h2>
              <p className="text-slate-600">Pilih program yang sesuai dengan minat dan tujuan karirmu.</p>
            </div>
            <Link href="/courses" className="hidden md:flex items-center gap-2 text-blue-600 font-bold hover:underline">
              Lihat Semua Program <ChevronRight size={20} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1">
                <div className="h-48 bg-slate-200 relative overflow-hidden">
                  <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-300 group-hover:scale-105 transition-transform duration-500">
                    <Monitor size={48} />
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-slate-700 shadow-sm flex items-center gap-1">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" /> 4.9
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-md">Microsoft Office</span>
                    <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-md">Beginner</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">Administrasi Perkantoran Modern</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                    <span className="flex items-center gap-1"><BookOpen size={14} /> 12 Sesi</span>
                    <span className="flex items-center gap-1"><Users size={14} /> 150 Siswa</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <span className="text-xs text-slate-400 line-through">Rp 750.000</span>
                      <p className="text-lg font-bold text-blue-600">Rp 500.000</p>
                    </div>
                    <button className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-colors">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link href="/courses" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline">
              Lihat Semua Program <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Pertanyaan Umum</h2>
            <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="space-y-4">
            {[
              { q: "Bagaimana cara mendaftar?", a: "Anda dapat mendaftar langsung ke kantor kami atau mengisi formulir pendaftaran online melalui website ini pada menu 'Daftar'." },
              { q: "Apakah ada kelas malam?", a: "Ya, kami menyediakan opsi jadwal fleksibel termasuk kelas sore dan malam bagi peserta yang bekerja atau sekolah." },
              { q: "Berapa lama durasi kursus?", a: "Durasi bervariasi tergantung program, mulai dari paket kilat 2 minggu hingga program intensif 3 bulan." },
              { q: "Apakah mendapat sertifikat?", a: "Tentu, semua peserta yang lulus ujian akhir akan mendapatkan sertifikat resmi dari LKP Binar Komputer." }
            ].map((item, i) => (
              <details key={i} className="group bg-slate-50 p-6 rounded-2xl border border-slate-100 open:bg-white open:shadow-md transition-all duration-300">
                <summary className="flex justify-between items-center font-bold text-slate-900 list-none cursor-pointer">
                  <span>{item.q}</span>
                  <ChevronDown className="transform group-open:rotate-180 transition-transform duration-300 text-slate-400" />
                </summary>
                <p className="mt-4 text-slate-600 text-sm leading-relaxed mb-2">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Location/Contact Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Kunjungi Kami</h2>
              <p className="text-slate-600 mb-8 max-w-md">
                Kami selalu senang menyambut Anda. Datang dan konsultasikan kebutuhan belajar Anda secara langsung.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Alamat</h4>
                    <p className="text-slate-600">Jl. Sipelem No. 22, Tegal Barat, Kota Tegal, Jawa Tengah</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Telepon / WhatsApp</h4>
                    <p className="text-slate-600">+62 812-3456-7890</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Email</h4>
                    <p className="text-slate-600">info@binarkomputer.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative h-80 bg-slate-200 rounded-3xl overflow-hidden shadow-lg border-4 border-white">
              {/* Maps Placeholder - In production use Google Maps Embed */}
              <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={48} className="text-slate-400 mx-auto mb-2" />
                  <span className="text-slate-500 font-medium">Google Maps Area</span>
                </div>
              </div>
              {/* Decorative element */}
              <div className="absolute bottom-4 right-4 bg-white p-3 rounded-xl shadow-md">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  4.9 (150 Reviews)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-600 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-200">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#ffffff_2px,transparent_2px)] [background-size:24px_24px]"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Mulai belajar dan berkembang bersama Binar Komputer Tegal.</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link href="/courses" className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-105 transition-all">
                  Lihat Kursus
                </Link>
                <Link href="https://wa.me/6281234567890" className="px-8 py-4 bg-blue-700 text-white border border-blue-500 rounded-xl font-bold text-lg hover:bg-blue-800 hover:shadow-lg hover:scale-105 transition-all">
                  Chat Admin
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <span className="text-2xl font-bold text-white mb-4 block">LKP BINAR</span>
              <p className="max-w-sm text-slate-400 mb-6">
                Lembaga Kursus dan Pelatihan Komputer yang berfokus pada kualitas dan pendekatan kekeluargaan untuk mencetak generasi digital yang kompeten.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Program</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="hover:text-blue-400 transition-colors">Microsoft Office</Link></li>
                <li><Link href="#" className="hover:text-blue-400 transition-colors">Desain Grafis</Link></li>
                <li><Link href="#" className="hover:text-blue-400 transition-colors">Web Development</Link></li>
                <li><Link href="#" className="hover:text-blue-400 transition-colors">Digital Marketing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Kontak</h4>
              <ul className="space-y-3 text-sm">
                <li>Jl. Sipelem No. 22, Tegal</li>
                <li>+62 812-3456-7890</li>
                <li>info@binarkomputer.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
            <p>&copy; 2026 LKP Binar Komputer. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div >
  );
}
