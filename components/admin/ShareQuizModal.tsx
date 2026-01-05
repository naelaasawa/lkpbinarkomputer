import { Copy, Mail, X, Check, Globe } from "lucide-react";
import { useState, useEffect } from "react";

interface ShareQuizModalProps {
    quizId: string;
    quizTitle: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ShareQuizModal({ quizId, quizTitle, isOpen, onClose }: ShareQuizModalProps) {
    const [copied, setCopied] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [assigning, setAssigning] = useState(false);
    // showUserList state is not explicitly used in the provided UI, but keeping it as per instruction if future use is intended.
    const [showUserList, setShowUserList] = useState(false);

    // Fetch users when the modal opens
    useEffect(() => {
        if (isOpen) {
            fetch("/api/users")
                .then(res => res.json())
                .then(data => setUsers(data))
                .catch(err => console.error("Failed to fetch users:", err));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Construct public URL
    // Assuming the app is deployed or local, window.location.origin handles the domain.
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const publicUrl = `${origin}/quizzes/${quizId}`;

    const emailSubject = `Quiz Invitation: ${quizTitle}`;
    const emailBody = `Hi,\n\nI invite you to take this quiz: "${quizTitle}".\n\nClick here to start: ${publicUrl}\n\nGood luck!`;

    const handleCopy = async () => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(publicUrl);
                setCopied(true);
            } else {
                // Fallback for browsers that don't support navigator.clipboard or in insecure contexts
                const textArea = document.createElement("textarea");
                textArea.value = publicUrl;
                // Avoid scrolling to bottom
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "-9999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand("copy");
                document.body.removeChild(textArea);
                setCopied(true);
            }
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy", err);
            alert("Failed to copy URL. Please copy it manually from the input box.");
        }
    };

    const toggleUser = (user: any) => {
        if (selectedEmails.includes(user.email)) {
            setSelectedEmails(selectedEmails.filter(e => e !== user.email));
            setSelectedUserIds(selectedUserIds.filter(id => id !== user.id));
        } else {
            setSelectedEmails([...selectedEmails, user.email]);
            setSelectedUserIds([...selectedUserIds, user.id]);
        }
    };

    const filteredUsers = users.filter(u =>
        (u.fullName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    // Construct mailto link with BCC for selected users
    const mailtoLink = `mailto:?bcc=${selectedEmails.join(',')}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Globe size={18} className="text-blue-500" />
                        Share Quiz
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Public Link</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={publicUrl}
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-slate-50 focus:outline-none"
                            />
                            <button
                                onClick={handleCopy}
                                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 min-w-[90px] justify-center"
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? "Copied" : "Copy"}
                            </button>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-slate-700 mb-3">Share via Email</h4>

                        {/* User Selection */}
                        <div className="mb-4">
                            <label className="text-xs text-slate-500 mb-2 block">Select Registered Users:</label>
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-blue-100 outline-none"
                            />
                            <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-lg bg-slate-50 p-2 space-y-1">
                                {filteredUsers.length === 0 ? (
                                    <p className="text-xs text-slate-400 text-center py-2">No users found</p>
                                ) : (
                                    filteredUsers.map(user => (
                                        <label key={user.id} className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer transition">
                                            <input
                                                type="checkbox"
                                                checked={selectedEmails.includes(user.email)}
                                                onChange={() => toggleUser(user)}
                                                className="rounded text-blue-600 focus:ring-blue-500"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-slate-700 truncate">{user.fullName || "Unnamed User"}</div>
                                                <div className="text-xs text-slate-500 truncate">{user.email}</div>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                            <div className="mt-2 text-xs text-slate-500 text-right">
                                {selectedEmails.length} users selected
                            </div>
                        </div>

                        <button
                            onClick={async (e) => {
                                if (selectedEmails.length === 0) {
                                    alert("Please select at least one user to email.");
                                    return;
                                }

                                try {
                                    setAssigning(true);
                                    const res = await fetch("/api/quiz-assignments", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            quizId,
                                            userIds: selectedUserIds
                                        })
                                    });

                                    if (!res.ok) throw new Error("Failed to assign quiz");

                                    // Open mail client
                                    window.location.href = mailtoLink;

                                    alert(`Quiz assigned to ${selectedEmails.length} users!`);
                                    onClose();
                                } catch (error) {
                                    console.error("Assignment error:", error);
                                    alert("Failed to assign quiz to users, but opening email client...");
                                    window.location.href = mailtoLink;
                                } finally {
                                    setAssigning(false);
                                }
                            }}
                            disabled={assigning || selectedEmails.length === 0}
                            className={`flex items-center justify-center gap-2 w-full px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium ${selectedEmails.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Mail size={18} />
                            {assigning ? "Assigning..." : "Send Email & Assign"}
                        </button>
                        <p className="text-xs text-slate-400 text-center mt-2">Assigns the quiz to their dashboard and opens your default email client</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
