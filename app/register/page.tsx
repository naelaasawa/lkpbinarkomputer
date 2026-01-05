"use client";

import { MessageCircle, User, Phone, Mail, BookOpen, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Register() {
    const router = useRouter();

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 relative">
            <div className="bg-blue-600 p-6 pt-10 pb-16 rounded-b-[2rem] shadow-lg text-white relative z-0">
                <button onClick={() => router.back()} className="absolute top-10 left-6 text-white/80 hover:text-white">
                    <ChevronLeft size={28} />
                </button>
                <div className="mt-4 text-center">
                    <h1 className="text-2xl font-bold">Private Registration</h1>
                    <p className="text-blue-100 text-sm mt-2">Join our exclusive private mentor program</p>
                </div>
            </div>

            <div className="-mt-10 mx-6 bg-white p-6 rounded-2xl shadow-lg relative z-10 flex flex-col gap-5">

                {/* Form Fields */}
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 ml-1">Full Name</label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                            <User size={18} className="text-gray-400" />
                            <input type="text" placeholder="John Doe" className="bg-transparent text-sm w-full outline-none text-slate-800" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 ml-1">Phone Number (WhatsApp)</label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                            <Phone size={18} className="text-gray-400" />
                            <input type="tel" placeholder="+62 812 3456 7890" className="bg-transparent text-sm w-full outline-none text-slate-800" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 ml-1">Email Address</label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                            <Mail size={18} className="text-gray-400" />
                            <input type="email" placeholder="john@example.com" className="bg-transparent text-sm w-full outline-none text-slate-800" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 ml-1">Interested Course</label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 focus-within:ring-2 focus-within:ring-blue-100 transition-all relative">
                            <BookOpen size={18} className="text-gray-400" />
                            <select className="bg-transparent text-sm w-full outline-none text-slate-800 appearance-none bg-none">
                                <option>Web Development</option>
                                <option>UI/UX Design</option>
                                <option>Digital Marketing</option>
                                <option>Microsoft Office Mastery</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="h-[1px] bg-gray-100 my-2"></div>

                <button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                    <MessageCircle size={20} />
                    Register via WhatsApp
                </button>

                <p className="text-[10px] text-center text-gray-400">
                    By registering, you agree to our Terms & Conditions and Privacy Policy.
                </p>
            </div>
        </div>
    );
}
