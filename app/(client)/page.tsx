
import Link from "next/link";
import { ArrowRight, BookOpen, Users, Award, ChevronRight, Star, Monitor, Code, CheckCircle, FileText, Smile, Briefcase, GraduationCap, Printer, Wifi, Home, Heart, Handshake, MapPin, Phone, Mail, HelpCircle, ChevronDown, Target, LayoutDashboard, Building2, HeartHandshake } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import MobileNav from "@/components/MobileNav";
import { prisma } from "@/lib/prisma";
import { DEFAULT_LANDING_PAGE_DATA } from "@/lib/constants";

// Icon mapping for dynamic rendering
const IconMap: any = {
  Building2,
  Users,
  HeartHandshake,
  Handshake,
  Smile,
  Briefcase,
  Heart,
  Monitor,
  Printer,
  BookOpen,
  Wifi,
  Home,
  Award,
  MapPin,
  Phone,
  Mail,
  Code,
  Target
};

export default async function LandingPage() {
  const user = await currentUser();

  // Fetch Settings
  let settings = DEFAULT_LANDING_PAGE_DATA;
  try {
    if (prisma.siteSettings) {
      const dbSettings = await prisma.siteSettings.findUnique({
        where: { key: "landing_page" },
      });
      if (dbSettings?.value) {
        settings = { ...DEFAULT_LANDING_PAGE_DATA, ...(dbSettings.value as any) };
      }
    }
  } catch (error) {
    console.error("Failed to fetch landing page settings:", error);
  }

  // Helper to render icon safely
  const renderIcon = (iconName: string, className?: string, size = 24) => {
    const IconComponent = IconMap[iconName] || HelpCircle;
    return <IconComponent size={size} className={className} />;
  };

  return (
    <div className="flex flex-col min-h-screen font-sans scroll-smooth">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-18">
            <div className="flex items-center">
              <Link href="/" className="text-xl md:text-2xl font-bold text-blue-600 touch-manipulation">
                {settings.navbar?.logoText || "LKP BINAR"}
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#program" className="text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors">Program</Link>
              <Link href="#about" className="text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors">Tentang Kami</Link>
              <Link href="#contact" className="text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors">Kontak</Link>

              {user ? (
                <Link href="/dashboard" className="px-5 py-2.5 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/dashboard" className="text-blue-600 font-semibold text-sm hover:underline transition-colors">{settings.navbar?.authButtonText || "Masuk"}</Link>
                  <Link href="/sign-up" className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
                    {settings.navbar?.signupButtonText || "Daftar Sekarang"}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Navigation */}
            <MobileNav isLoggedIn={!!user} />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#2563EB_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-4 md:mb-6 border border-blue-100 touch-manipulation">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                {settings.hero.badge}
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-4 md:mb-6">
                {settings.hero.title}
              </h1>
              <h2 className="text-lg sm:text-xl md:text-2xl text-slate-600 font-medium mb-3 md:mb-4">
                {settings.hero.subtitle}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-slate-500 mb-6 md:mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {settings.hero.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
                <Link href={settings.hero.ctaPrimary.link} className="min-h-[48px] px-6 md:px-8 py-3 md:py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 active:bg-blue-800 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 touch-manipulation">
                  {settings.hero.ctaPrimary.text} <ArrowRight size={18} />
                </Link>
                <Link href={settings.hero.ctaSecondary.link} className="min-h-[48px] px-6 md:px-8 py-3 md:py-3.5 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-bold hover:bg-slate-50 active:bg-slate-100 transition-all flex items-center justify-center touch-manipulation">
                  {settings.hero.ctaSecondary.text}
                </Link>
              </div>
            </div>
            <div className="flex-1 w-full max-w-sm sm:max-w-md lg:max-w-none">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full blur-3xl opacity-70"></div>
                {settings.hero?.imageUrl ? (
                  <img
                    src={settings.hero.imageUrl}
                    alt={settings.hero.title}
                    className="rounded-3xl shadow-2xl border border-slate-100 relative z-10 w-full object-cover"
                  />
                ) : (
                  <div className="relative bg-white rounded-3xl shadow-2xl p-4 md:p-6 border border-slate-100">
                    {/* Abstract Educational Illustration */}
                    <div className="aspect-[4/3] bg-slate-50 rounded-2xl relative overflow-hidden flex items-center justify-center">
                      <div className="absolute top-6 left-6 md:top-10 md:left-10 p-2 md:p-3 bg-white rounded-xl shadow-lg animate-bounce duration-[3000ms]">
                        <Code size={24} className="text-blue-500 md:w-8 md:h-8" />
                      </div>
                      <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 p-2 md:p-3 bg-white rounded-xl shadow-lg animate-bounce duration-[3000ms] delay-700">
                        <Monitor size={24} className="text-purple-500 md:w-8 md:h-8" />
                      </div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 md:w-32 md:h-32 bg-blue-100 rounded-full flex items-center justify-center">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-blue-600 rounded-full flex items-center justify-center shadow-inner">
                          <BookOpen size={32} className="text-white md:w-10 md:h-10" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tentang Kami Section */}
      <section className="py-10 md:py-16 bg-white border-b border-slate-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-3 md:mb-4 tracking-wide uppercase">
            {settings.about.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4 md:mb-6">
            {settings.about.title}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
            {settings.about.description}
          </p>
        </div>
      </section>

      {/* Profil Lembaga Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{settings.profile.title}</h2>
            <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {settings.profile.items.map((item: any, idx: number) => {
              let colorClass = "text-blue-600 bg-blue-100";
              if (item.color === 'purple') colorClass = "text-purple-600 bg-purple-100";
              if (item.color === 'orange') colorClass = "text-orange-600 bg-orange-100";

              return (
                <div key={idx} className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-all duration-300">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${colorClass}`}>
                    {renderIcon(item.icon, "", 24)}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Visi & Misi Section */}
      <section className="py-20 bg-blue-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5">
          <Target size={300} className="text-blue-600" />
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
                {settings.visionMission.vision}
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
                {settings.visionMission.missions.map((mission: any, idx: number) => {
                  let colorClass = "text-green-600 bg-green-100";
                  if (mission.color === 'purple') colorClass = "text-purple-600 bg-purple-100";
                  if (mission.color === 'orange') colorClass = "text-orange-600 bg-orange-100";

                  return (
                    <li key={idx} className="flex gap-4">
                      <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                        {renderIcon(mission.icon, "", 16)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{mission.title}</h4>
                        <p className="text-slate-600 text-sm">{mission.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
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
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{settings.stats.title}</h2>
            <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
            <p className="mt-4 text-slate-600">{settings.stats.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {settings.stats.items.map((stat: any, idx: number) => {
              // Custom styling for the array elements to match original design
              if (idx === 2) { // The highlighted card
                return (
                  <div key={idx} className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white group-hover:scale-110 transition-transform backdrop-blur-sm">
                      {renderIcon(stat.icon, "", 32)}
                    </div>
                    <span className="block text-5xl font-extrabold text-yellow-300 mb-2 drop-shadow-sm">{stat.value}</span>
                    <h3 className="text-lg font-bold text-white mb-2">{stat.label}</h3>
                    <p className="text-blue-100 text-sm">{stat.description}</p>
                  </div>
                );
              }

              // Standard cards
              let colorClass = "text-blue-600 bg-blue-100 text-blue-600";
              let valueColor = "text-blue-600";
              if (stat.color === 'green') {
                colorClass = "bg-green-100 text-green-600";
                valueColor = "text-green-500";
              }

              return (
                <div key={idx} className="bg-slate-50 rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center group">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform ${colorClass}`}>
                    {renderIcon(stat.icon, "", 32)}
                  </div>
                  <span className={`block text-5xl font-extrabold mb-2 ${valueColor}`}>{stat.value}</span>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{stat.label}</h3>
                  <p className="text-slate-600 text-sm">
                    {stat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pengajar Section - Keep largely static but use text from settings */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 order-2 md:order-1">
              {/* Illustration Placeholder - Kept static as it's complex CSS */}
              {/* Illustration Placeholder - Kept static as it's complex CSS */}
              <div className="relative">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-blue-100 rounded-full opacity-50 blur-xl"></div>
                <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-24 h-24 bg-purple-100 rounded-full opacity-50 blur-xl"></div>

                {settings.team?.imageUrl ? (
                  <img
                    src={settings.team.imageUrl}
                    alt={settings.team.title}
                    className="relative rounded-2xl shadow-lg w-full object-cover transform rotate-2 hover:rotate-0 transition-transform duration-500"
                  />
                ) : (
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
                )}
              </div>
            </div>
            <div className="flex-1 order-1 md:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-6">
                <Star size={12} className="fill-blue-600" />
                Tim Profesional
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">{settings.team.title}</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                {settings.team.description}
              </p>
              <div className="grid grid-cols-2 gap-4 md:gap-8 border-t border-slate-100 pt-8">
                {settings.team.features.map((feature: any, idx: number) => (
                  <div key={idx}>
                    <h4 className="font-bold text-slate-900 text-base md:text-lg mb-1">{feature.title}</h4>
                    <p className="text-xs md:text-sm text-slate-500">{feature.subtitle}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Section */}
      <section id="program" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{settings.programs.title}</h2>
            <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
            <p className="mt-4 text-slate-600">{settings.programs.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {settings.programs.items.map((program: any, idx: number) => {
              let color = "text-blue-600";
              let bg = "bg-blue-100";
              if (program.color === 'purple') { color = "text-purple-600"; bg = "bg-purple-100"; }
              if (program.color === 'orange') { color = "text-orange-600"; bg = "bg-orange-100"; }

              return (
                <div key={idx} className="bg-slate-50 rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden group flex flex-col">
                  <div className={`w-14 h-14 ${bg} rounded-full flex items-center justify-center mb-6 ${color} group-hover:scale-110 transition-transform`}>
                    <FileText size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{program.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-6 flex-grow">
                    {program.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link href="/program" className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
              Lihat Detail Program <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Fasilitas Belajar Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{settings.facilities.title}</h2>
            <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Monitor size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{settings.facilities.subtitle}</h3>
                  <p className="text-sm text-slate-500">Fasilitas lengkap untuk pengalaman belajar optimal</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {settings.facilities.items.map((item: any, i: number) => {
                  let color = "text-blue-500";
                  if (item.color === 'orange') color = "text-orange-500";
                  if (item.color === 'purple') color = "text-purple-500";
                  if (item.color === 'green') color = "text-green-500";
                  if (item.color === 'red') color = "text-red-500";

                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      {renderIcon(item.icon, color, 18)}
                      <span className="font-medium text-slate-700">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section (Why Us) */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{settings.whyUs.title}</h2>
            <p className="text-slate-600">{settings.whyUs.description}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {settings.whyUs.items.map((feature: any, idx: number) => {
              let color = "bg-blue-100 text-blue-600";
              if (feature.color === 'purple') color = "bg-purple-100 text-purple-600";
              if (feature.color === 'orange') color = "bg-orange-100 text-orange-600";

              return (
                <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${color}`}>
                    {renderIcon(feature.icon, "", 28)}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Location/Contact Section */}
      <section id="contact" className="py-20 bg-slate-50">
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
                    <p className="text-slate-600">{settings.contact.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Telepon / WhatsApp</h4>
                    <p className="text-slate-600">{settings.contact.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Email</h4>
                    <p className="text-slate-600">{settings.contact.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative h-80 bg-slate-200 rounded-3xl overflow-hidden shadow-lg border-4 border-white">
              {settings.contact.googleMapsUrl ? (
                <iframe
                  src={settings.contact.googleMapsUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              ) : (
                <>
                  <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin size={48} className="text-slate-400 mx-auto mb-2" />
                      <span className="text-slate-500 font-medium">Google Maps Area</span>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white p-3 rounded-xl shadow-md">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                      4.9 (150 Reviews)
                    </span>
                  </div>
                </>
              )}
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
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{settings.cta.title}</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link href={settings.cta.primaryButton.link} className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-105 transition-all">
                  {settings.cta.primaryButton.text}
                </Link>
                <Link href={settings.cta.secondaryButton.link} className="px-8 py-4 bg-blue-700 text-white border border-blue-500 rounded-xl font-bold text-lg hover:bg-blue-800 hover:shadow-lg hover:scale-105 transition-all">
                  {settings.cta.secondaryButton.text}
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
              <span className="text-2xl font-bold text-white mb-4 block">{settings.navbar?.logoText || "LKP BINAR"}</span>
              <p className="max-w-sm text-slate-400 mb-6">
                {settings.footer.description}
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
                <li>{settings.contact.address}</li>
                <li>{settings.contact.phone}</li>
                <li>{settings.contact.email}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} {settings.footer?.copyright || "LKP Binar Komputer. All rights reserved."}</p>
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
