"use client";

import React, { useState, useRef } from "react";
import { Download, Upload, Check, AlertTriangle, FileText, Database, X, Info } from "lucide-react";


export default function BackupPage() {
    const [loading, setLoading] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Preview State
    const [previewData, setPreviewData] = useState<any>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedType, setSelectedType] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const downloadBackup = async (type: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/backup?type=${type}`);
            if (!res.ok) throw new Error("Failed to download");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${type}_backup_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error(error);
            alert("Backup failed");
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setSelectedType(type);
        setImportLoading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);
        formData.append("preview", "true");

        try {
            const res = await fetch("/api/backup", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setPreviewData(data);
            } else {
                const err = await res.text();
                alert("Preview failed: " + err);
                resetSelection();
            }
        } catch (error) {
            console.error(error);
            alert("Preview error");
            resetSelection();
        } finally {
            setImportLoading(false);
            // Don't clear value yet so we can re-read if needed, but actually we stored the file object.
            e.target.value = "";
        }
    };

    const confirmImport = async () => {
        if (!selectedFile || !selectedType) return;

        setImportLoading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("type", selectedType);
        // preview is false/undefined by default

        try {
            const res = await fetch("/api/backup", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setMessage(`Import successful: ${data.count} records processed.`);
                setTimeout(() => setMessage(""), 5000);
                resetSelection();
            } else {
                const err = await res.text();
                alert("Import failed: " + err);
            }
        } catch (error) {
            console.error(error);
            alert("Import error");
        } finally {
            setImportLoading(false);
        }
    };

    const resetSelection = () => {
        setSelectedFile(null);
        setSelectedType("");
        setPreviewData(null);
    };

    return (
        <div className="p-6 max-w-5xl mx-auto relative">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Database className="text-blue-600" />
                    Data Backup & Restore
                </h1>
                <p className="text-slate-500 mt-1">Export your data to CSV for safe keeping, or restore from a previous backup.</p>
            </div>

            {message && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg flex items-center gap-2">
                    <Check size={20} />
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Courses Card */}
                <BackupCard
                    title="Courses"
                    icon={FileText}
                    description="Backup all courses (without relational modules/lessons depth in CSV - careful)."
                    onDownload={() => downloadBackup("courses")}
                    onFileSelect={(e: React.ChangeEvent<HTMLInputElement>) => handleFileSelect(e, "courses")}
                    loading={loading || importLoading}
                />

                {/* Quizzes Card */}
                <BackupCard
                    title="Quizzes"
                    icon={FileText}
                    description="Backup all quizzes metadata."
                    onDownload={() => downloadBackup("quizzes")}
                    onFileSelect={(e: React.ChangeEvent<HTMLInputElement>) => handleFileSelect(e, "quizzes")}
                    loading={loading || importLoading}
                />

                {/* Users Card */}
                <BackupCard
                    title="Users"
                    icon={FileText}
                    description="Backup user list (ID, email, name, role)."
                    onDownload={() => downloadBackup("users")}
                    onFileSelect={(e: React.ChangeEvent<HTMLInputElement>) => handleFileSelect(e, "users")}
                    loading={loading || importLoading}
                />
            </div>

            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3 text-sm text-yellow-800">
                <AlertTriangle className="shrink-0" size={20} />
                <div>
                    <span className="font-bold">Warning:</span> CSV Import/Export here is basic.
                    Complex relations (like Lessons inside Modules inside Courses) might not be fully preserved if only exporting the parent table.
                    For full database backups, please use database-level tools (mysqldump).
                    <br /><br />
                    Importing requires the CSV structure (headers) to match exactly what is exported.
                    IDs will be used to update existing records (Upsert).
                </div>
            </div>

            {/* Preview Modal */}
            {previewData && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                        <div className="p-6 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Info className="text-blue-500" />
                                Import Preview: {selectedType}
                            </h3>
                            <button onClick={resetSelection} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="flex gap-4 mb-6">
                                <div className="flex-1 bg-green-50 p-4 rounded-lg border border-green-100 text-center">
                                    <div className="text-2xl font-bold text-green-600">{previewData.new}</div>
                                    <div className="text-sm text-green-800 font-medium">New Records</div>
                                </div>
                                <div className="flex-1 bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-center">
                                    <div className="text-2xl font-bold text-yellow-600">{previewData.updated}</div>
                                    <div className="text-sm text-yellow-800 font-medium">To Update</div>
                                </div>
                                <div className="flex-1 bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                                    <div className="text-2xl font-bold text-gray-500">{previewData.unchanged}</div>
                                    <div className="text-sm text-gray-700 font-medium">Unchanged</div>
                                </div>
                            </div>

                            <h4 className="font-bold mb-2">Change Details</h4>
                            <div className="bg-slate-50 rounded-lg border overflow-hidden text-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-100 text-slate-600 font-medium border-b">
                                        <tr>
                                            <th className="p-3">ID (Snippet)</th>
                                            <th className="p-3">Title / Key</th>
                                            <th className="p-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {previewData.details.map((item: any, i: number) => (
                                            <tr key={i} className={item.status === 'new' ? 'bg-green-50/50' : item.status === 'updated' ? 'bg-yellow-50/50' : ''}>
                                                <td className="p-3 font-mono text-xs text-slate-500">{item.id.substring(0, 8)}...</td>
                                                <td className="p-3 truncate max-w-[200px]">{item.title || item.email || "Unknown"}</td>
                                                <td className="p-3">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                                                        ${item.status === 'new' ? 'bg-green-100 text-green-700' :
                                                            item.status === 'updated' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-slate-100 text-slate-600'}`}>
                                                        {item.status.toUpperCase()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {previewData.details.length === 0 && (
                                    <div className="p-4 text-center text-slate-500">No records found in CSV.</div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t bg-slate-50 rounded-b-xl flex justify-end gap-3">
                            <button
                                onClick={resetSelection}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-white transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmImport}
                                disabled={importLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
                            >
                                {importLoading ? 'Importing...' : 'Confirm Import'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function BackupCard({ title, icon: Icon, description, onDownload, onFileSelect, loading }: any) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <Icon size={24} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
            </div>
            <p className="text-slate-500 text-sm mb-6 min-h-[60px]">{description}</p>

            <div className="flex flex-col gap-3">
                <button
                    onClick={onDownload}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition disabled:opacity-50"
                >
                    <Download size={18} />
                    Export CSV
                </button>

                <label className={`flex items-center justify-center gap-2 w-full py-2 border border-blue-200 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition cursor-pointer ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Upload size={18} />
                    Import CSV
                    <input type="file" accept=".csv" className="hidden" onChange={onFileSelect} disabled={loading} />
                </label>
            </div>
        </div>
    );
}
