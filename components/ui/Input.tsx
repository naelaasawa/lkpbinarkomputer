"use client";

import { InputHTMLAttributes, useState } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    hint?: string;
}

export default function Input({
    label,
    error,
    hint,
    className = "",
    ...props
}: InputProps) {
    const [focused, setFocused] = useState(false);
    const hasValue = Boolean(props.value);

    return (
        <div className="relative">
            <label className="block text-xs font-semibold text-slate-600 mb-2">
                {label}
            </label>
            <input
                {...props}
                onFocus={(e) => {
                    setFocused(true);
                    props.onFocus?.(e);
                }}
                onBlur={(e) => {
                    setFocused(false);
                    props.onBlur?.(e);
                }}
                className={`
                    w-full px-4 py-3.5
                    bg-slate-50 border-2 rounded-xl
                    text-slate-800 font-medium
                    transition-all duration-200
                    focus:outline-none focus:bg-white
                    placeholder:text-slate-400
                    ${error
                        ? "border-red-300 focus:border-red-500"
                        : "border-slate-200 focus:border-blue-500"
                    }
                    ${className}
                `}
            />
            {error && (
                <p className="mt-2 text-xs text-red-500 font-medium">{error}</p>
            )}
            {hint && !error && (
                <p className="mt-2 text-xs text-slate-400">{hint}</p>
            )}
        </div>
    );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
    hint?: string;
}

export function Textarea({
    label,
    error,
    hint,
    className = "",
    ...props
}: TextareaProps) {
    const [focused, setFocused] = useState(false);

    return (
        <div className="relative">
            <label className="block text-xs font-semibold text-slate-600 mb-2">
                {label}
            </label>
            <textarea
                {...props}
                onFocus={(e) => {
                    setFocused(true);
                    props.onFocus?.(e);
                }}
                onBlur={(e) => {
                    setFocused(false);
                    props.onBlur?.(e);
                }}
                className={`
                    w-full px-4 py-3.5
                    bg-slate-50 border-2 rounded-xl
                    text-slate-800 font-medium
                    transition-all duration-200
                    focus:outline-none focus:bg-white resize-none
                    placeholder:text-slate-400
                    ${error
                        ? "border-red-300 focus:border-red-500"
                        : "border-slate-200 focus:border-blue-500"
                    }
                    ${className}
                `}
            />
            {error && (
                <p className="mt-2 text-xs text-red-500 font-medium">{error}</p>
            )}
            {hint && !error && (
                <p className="mt-2 text-xs text-slate-400">{hint}</p>
            )}
        </div>
    );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: { value: string; label: string }[];
    error?: string;
}

export function Select({
    label,
    options,
    error,
    className = "",
    ...props
}: SelectProps) {
    return (
        <div className="relative">
            <label className="block text-xs font-semibold text-slate-600 mb-2">
                {label}
            </label>
            <select
                {...props}
                className={`
                    w-full px-4 py-3.5
                    bg-slate-50 border-2 rounded-xl
                    text-slate-800 font-medium
                    transition-all duration-200
                    focus:outline-none focus:bg-white focus:border-blue-500
                    ${error ? "border-red-300" : "border-slate-200"}
                    ${className}
                `}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-2 text-xs text-red-500 font-medium">{error}</p>
            )}
        </div>
    );
}
