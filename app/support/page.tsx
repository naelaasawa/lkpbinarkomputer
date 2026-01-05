"use client";

import { MessageCircle, Mail, Search, ChevronDown, ChevronUp, Bot, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function Support() {
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const faqs = [
        {
            id: 0,
            question: "How do I download my certificate?",
            answer: "Once you complete all lessons and the final quiz in a course, a 'Download Certificate' button will appear in the course page and your 'Certificate' menu."
        },
        {
            id: 1,
            question: "Can I access courses offline?",
            answer: "Currently, you need an active internet connection to stream video lessons. We are working on an offline mode for future updates."
        },
        {
            id: 2,
            question: "How do I reset my password?",
            answer: "Go to the login page and click 'Forgot Password'. Follow the instructions sent to your registered email address."
        }
    ];

    const toggleFaq = (id: number) => {
        setOpenFaq(openFaq === id ? null : id);
    };

    return (
        <div className="flex flex-col gap-6 px-6 pt-8 min-h-screen bg-slate-50">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Help Center</h1>
                <p className="text-sm text-gray-500">We are here to assist you.</p>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search for help..."
                    className="w-full pl-10 pr-4 py-3 bg-white rounded-xl shadow-sm border-none focus:ring-2 focus:ring-blue-100 outline-none text-sm text-gray-600"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
                <button className="bg-white p-4 rounded-xl shadow-sm border border-gray-50 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <MessageCircle size={24} />
                    </div>
                    <span className="text-sm font-bold text-slate-800">WhatsApp</span>
                    <span className="text-[10px] text-gray-400">Chat with us</span>
                </button>
                <button className="bg-white p-4 rounded-xl shadow-sm border border-gray-50 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <Mail size={24} />
                    </div>
                    <span className="text-sm font-bold text-slate-800">Email</span>
                    <span className="text-[10px] text-gray-400">Send an inquiry</span>
                </button>
            </div>

            {/* AI Assistant Banner */}
            <div className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200 relative overflow-hidden">
                <div className="relative z-10 flex gap-4 items-center">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <Bot size={28} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Ask Binar AI</h3>
                        <p className="text-xs opacity-80 mt-1 max-w-[200px]">Get instant answers 24/7. Our AI is trained to help you.</p>
                    </div>
                </div>
                <button className="relative z-10 mt-4 bg-white text-indigo-600 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm active:scale-95 transition-transform">
                    Start Chat <ArrowRight size={14} />
                </button>

                {/* Decorative elements */}
                <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute left-[-20px] bottom-[-20px] w-24 h-24 bg-purple-400/20 rounded-full blur-xl"></div>
            </div>

            {/* FAQ */}
            <div>
                <h3 className="font-bold text-slate-800 mb-3">Frequently Asked Questions</h3>
                <div className="flex flex-col gap-3">
                    {faqs.map((faq) => (
                        <div key={faq.id} className="bg-white rounded-xl shadow-sm border border-gray-50 overflow-hidden">
                            <button
                                onClick={() => toggleFaq(faq.id)}
                                className="w-full flex justify-between items-center p-4 text-left"
                            >
                                <span className="text-sm font-semibold text-slate-700">{faq.question}</span>
                                {openFaq === faq.id ? (
                                    <ChevronUp size={18} className="text-gray-400" />
                                ) : (
                                    <ChevronDown size={18} className="text-gray-400" />
                                )}
                            </button>
                            {openFaq === faq.id && (
                                <div className="px-4 pb-4 text-xs text-gray-500 leading-relaxed border-t border-gray-50 pt-3">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
