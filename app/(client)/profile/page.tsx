import Link from "next/link";
import { User, Mail, Award, Clock, BookOpen, ChevronRight, Settings, LogOut, HelpCircle } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";

import { prisma } from "@/lib/prisma";

export default async function Profile() {
    const user = await currentUser();

    if (!user) {
        return <div className="p-10 text-center">Please sign in to view your profile.</div>;
    }

    // Fetch User Data from DB
    const dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id },
        include: {
            enrollments: {
                include: {
                    course: true // Include course to check certificateEnabled
                }
            }
        }
    });

    const enrollments = dbUser?.enrollments || [];
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.progress === 100).length;
    // Assume 1 course ~ 5 hours on average for estimation, or just show Completed count
    const totalCertificates = enrollments.filter(e => e.progress === 100 && e.course.certificateEnabled).length;

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* Profile Header */}
            <div className="bg-white p-6 pt-10 pb-8 rounded-b-[2rem] shadow-sm flex flex-col items-center md:flex-row md:rounded-2xl md:p-8 md:gap-6 md:shadow-md">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 md:mb-0 border-4 border-white shadow-lg shrink-0 overflow-hidden">
                    <img
                        src={user.imageUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1">
                    <h1 className="text-xl md:text-2xl font-bold text-slate-800">
                        {user.fullName || "Student Binar"}
                    </h1>
                    <div className="flex items-center gap-2 mt-1 text-gray-500 text-sm md:text-base">
                        <Mail size={14} className="md:w-5 md:h-5" />
                        <span>{user.emailAddresses[0]?.emailAddress}</span>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <Link
                            href="/settings"
                            className="px-4 py-2 bg-blue-50 text-blue-600 text-xs md:text-sm font-semibold rounded-full hover:bg-blue-100 transition-colors"
                        >
                            Edit Profile
                        </Link>
                        {dbUser?.role === 'ADMIN' && (
                            <Link
                                href="/admin"
                                className="px-4 py-2 bg-purple-50 text-purple-600 text-xs md:text-sm font-semibold rounded-full hover:bg-purple-100 transition-colors"
                            >
                                Admin Dashboard
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 px-6 -mt-6 md:mt-6 md:gap-6 md:px-0">
                <Link href="/courses" className="bg-white p-3 md:p-6 rounded-xl shadow-sm flex flex-col items-center gap-2 hover:bg-blue-50 transition-colors border border-gray-50 md:border-gray-100">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-500 md:p-4">
                        <BookOpen size={18} className="md:w-8 md:h-8" />
                    </div>
                    <span className="text-lg md:text-3xl font-bold text-slate-800">{totalCourses}</span>
                    <span className="text-[10px] md:text-sm text-gray-400 font-medium uppercase">Courses</span>
                </Link>
                <div className="bg-white p-3 md:p-6 rounded-xl shadow-sm flex flex-col items-center gap-2 border border-gray-50 md:border-gray-100">
                    <div className="p-2 rounded-lg bg-orange-50 text-orange-500 md:p-4">
                        <Clock size={18} className="md:w-8 md:h-8" />
                    </div>
                    <span className="text-lg md:text-3xl font-bold text-slate-800">{completedCourses}</span>
                    <span className="text-[10px] md:text-sm text-gray-400 font-medium uppercase">Completed</span>
                </div>
                <Link href="/certificate" className="bg-white p-3 md:p-6 rounded-xl shadow-sm flex flex-col items-center gap-2 hover:bg-green-50 transition-colors border border-gray-50 md:border-gray-100">
                    <div className="p-2 rounded-lg bg-green-50 text-green-500 md:p-4">
                        <Award size={18} className="md:w-8 md:h-8" />
                    </div>
                    <span className="text-lg md:text-3xl font-bold text-slate-800">{totalCertificates}</span>
                    <span className="text-[10px] md:text-sm text-gray-400 font-medium uppercase">Certs</span>
                </Link>
            </div>

            {/* Menu Options */}
            <div className="flex flex-col gap-3 px-6 mt-6 pb-8 md:px-0">
                <h3 className="text-sm font-bold text-slate-800 ml-1 md:text-lg">Account Settings</h3>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden md:border md:border-slate-100">
                    <Link
                        href="/settings"
                        className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-gray-50 transition-colors border-b border-gray-50 md:border-gray-100"
                    >
                        <div className="flex items-center gap-3 text-gray-700">
                            <User size={18} className="text-gray-400 md:w-6 md:h-6" />
                            <span className="text-sm md:text-base font-medium">Personal Information</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                    </Link>
                    <Link
                        href="/settings"
                        className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-gray-50 transition-colors border-b border-gray-50 md:border-gray-100"
                    >
                        <div className="flex items-center gap-3 text-gray-700">
                            <Settings size={18} className="text-gray-400 md:w-6 md:h-6" />
                            <span className="text-sm md:text-base font-medium">Login & Security</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                    </Link>
                    <Link href="/support" className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3 text-gray-700">
                            <HelpCircle size={18} className="text-gray-400 md:w-6 md:h-6" />
                            <span className="text-sm md:text-base font-medium">Help Center</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                    </Link>
                </div>

                <div className="md:flex md:justify-end">
                    <SignOutButton>
                        <button className="mt-4 flex items-center justify-center gap-2 p-4 bg-red-50 text-red-500 rounded-xl font-medium text-sm md:text-base hover:bg-red-100 transition-colors md:w-auto md:px-8 w-full">
                            <LogOut size={18} className="md:w-5 md:h-5" />
                            Log Out
                        </button>
                    </SignOutButton>
                </div>
            </div>
        </div>
    );
}
