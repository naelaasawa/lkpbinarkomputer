import Link from "next/link";
import { User, Mail, Award, Clock, BookOpen, ChevronRight, Settings, LogOut, Edit, HelpCircle } from "lucide-react";

export default function Profile() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* Profile Header */}
            <div className="bg-white p-6 pt-10 pb-8 rounded-b-[2rem] shadow-sm flex flex-col items-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 border-4 border-white shadow-lg">
                    <User size={40} />
                </div>
                <h1 className="text-xl font-bold text-slate-800">Student Binar</h1>
                <div className="flex items-center gap-2 mt-1 text-gray-500 text-sm">
                    <Mail size={14} />
                    <span>student@binar.com</span>
                </div>

                <button className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full hover:bg-blue-100 transition-colors">
                    Edit Profile
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 px-6 -mt-6">
                <Link href="/courses" className="bg-white p-3 rounded-xl shadow-sm flex flex-col items-center gap-2 hover:bg-blue-50 transition-colors">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-500">
                        <BookOpen size={18} />
                    </div>
                    <span className="text-lg font-bold text-slate-800">4</span>
                    <span className="text-[10px] text-gray-400 font-medium uppercase">Courses</span>
                </Link>
                <div className="bg-white p-3 rounded-xl shadow-sm flex flex-col items-center gap-2">
                    <div className="p-2 rounded-lg bg-orange-50 text-orange-500">
                        <Clock size={18} />
                    </div>
                    <span className="text-lg font-bold text-slate-800">32</span>
                    <span className="text-[10px] text-gray-400 font-medium uppercase">Hours</span>
                </div>
                <Link href="/certificate" className="bg-white p-3 rounded-xl shadow-sm flex flex-col items-center gap-2 hover:bg-green-50 transition-colors">
                    <div className="p-2 rounded-lg bg-green-50 text-green-500">
                        <Award size={18} />
                    </div>
                    <span className="text-lg font-bold text-slate-800">2</span>
                    <span className="text-[10px] text-gray-400 font-medium uppercase">Certs</span>
                </Link>
            </div>

            {/* Menu Options */}
            <div className="flex flex-col gap-3 px-6 mt-6 pb-8">
                <h3 className="text-sm font-bold text-slate-800 ml-1">Account Settings</h3>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50">
                        <div className="flex items-center gap-3 text-gray-700">
                            <User size={18} className="text-gray-400" />
                            <span className="text-sm font-medium">Personal Information</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50">
                        <div className="flex items-center gap-3 text-gray-700">
                            <Settings size={18} className="text-gray-400" />
                            <span className="text-sm font-medium">Login & Security</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                    </button>
                    <Link href="/support" className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3 text-gray-700">
                            <HelpCircle size={18} className="text-gray-400" />
                            <span className="text-sm font-medium">Help Center</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                    </Link>
                </div>

                <button className="mt-4 flex items-center justify-center gap-2 p-4 bg-red-50 text-red-500 rounded-xl font-medium text-sm hover:bg-red-100 transition-colors">
                    <LogOut size={18} />
                    Log Out
                </button>
            </div>
        </div>
    );
}
