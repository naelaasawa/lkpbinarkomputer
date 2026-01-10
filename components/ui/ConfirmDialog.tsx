"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";
import Modal from "./Modal";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
    loading?: boolean;
}

const variants = {
    danger: {
        icon: Trash2,
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        buttonClass: "bg-red-600 hover:bg-red-700 text-white",
    },
    warning: {
        icon: AlertTriangle,
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
        buttonClass: "bg-amber-600 hover:bg-amber-700 text-white",
    },
    info: {
        icon: AlertTriangle,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
    },
};

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger",
    loading = false,
}: ConfirmDialogProps) {
    const config = variants[variant];
    const Icon = config.icon;

    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
            <div className="text-center">
                <div
                    className={`w-16 h-16 mx-auto rounded-full ${config.iconBg} flex items-center justify-center mb-4`}
                >
                    <Icon size={28} className={config.iconColor} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm mb-6">{message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition disabled:opacity-50 ${config.buttonClass}`}
                    >
                        {loading ? "Loading..." : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
