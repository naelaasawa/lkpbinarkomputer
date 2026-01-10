"use client";

import { useEffect, useState } from "react";
import { Shield, ShieldAlert, BadgeCheck, Search, Eye, Book, Star } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import Loading from "@/components/ui/Loading";

type TabType = 'ALL' | 'USER' | 'ADMIN';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<TabType>('ALL');

    // Role Management State
    const [roleDialog, setRoleDialog] = useState<{ isOpen: boolean; userId: string | null; role: string | null }>({
        isOpen: false,
        userId: null,
        role: null
    });
    const [updatingRole, setUpdatingRole] = useState(false);

    // User Details State
    const [detailModal, setDetailModal] = useState<{ isOpen: boolean; userId: string | null }>({
        isOpen: false,
        userId: null
    });
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleClick = (userId: string, currentRole: string) => {
        setRoleDialog({ isOpen: true, userId, role: currentRole });
    };

    const confirmRoleChange = async () => {
        if (!roleDialog.userId || !roleDialog.role) return;

        setUpdatingRole(true);
        const newRole = roleDialog.role === "ADMIN" ? "USER" : "ADMIN";

        try {
            const res = await fetch(`/api/admin/users/${roleDialog.userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            });

            if (res.ok) {
                fetchUsers();
                setRoleDialog({ isOpen: false, userId: null, role: null });
            } else {
                alert("Failed to update role");
            }
        } catch (error) {
            console.error(error);
            alert("Error updating role");
        } finally {
            setUpdatingRole(false);
        }
    };

    const handleViewDetails = async (userId: string) => {
        setDetailModal({ isOpen: true, userId });
        setLoadingDetails(true);
        try {
            const res = await fetch(`/api/admin/users/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setSelectedUser(data);
            } else {
                alert("Failed to fetch user details");
                setDetailModal({ isOpen: false, userId: null });
            }
        } catch (error) {
            console.error("Error fetching details:", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase()) ||
            u.id.toLowerCase().includes(search.toLowerCase());

        if (activeTab === 'ALL') return matchesSearch;
        return matchesSearch && u.role === activeTab;
    });

    if (loading) return <Loading />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
                    <p className="text-slate-500 mt-1">Manage user roles and permissions</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                {(['ALL', 'USER', 'ADMIN'] as TabType[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        {tab === 'ALL' ? 'All Users' : tab === 'USER' ? 'Students' : 'Admins'}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-700">User Email</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">Join Date</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">Role</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{user.email}</div>
                                        <div className="text-xs text-slate-400 font-mono mt-0.5">ID: {user.id}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${user.role === 'ADMIN'
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {user.role === 'ADMIN' ? <Shield size={12} /> : <BadgeCheck size={12} />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleViewDetails(user.id)}
                                                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleRoleClick(user.id, user.role)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                                            >
                                                {user.role === 'ADMIN' ? 'Demote' : 'Promote'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                    No users found matching your filter.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Role Change Dialog */}
            <ConfirmDialog
                isOpen={roleDialog.isOpen}
                onClose={() => !updatingRole && setRoleDialog({ ...roleDialog, isOpen: false })}
                onConfirm={confirmRoleChange}
                title={roleDialog.role === 'ADMIN' ? "Demote Admin?" : "Promote to Admin?"}
                message={roleDialog.role === 'ADMIN'
                    ? "This user will lose all admin privileges."
                    : "This user will gain full access to the admin dashboard."}
                confirmText={roleDialog.role === 'ADMIN' ? "Demote" : "Promote"}
                variant={roleDialog.role === 'ADMIN' ? "warning" : "info"}
                loading={updatingRole}
            />

            {/* User Details Modal */}
            <Modal
                isOpen={detailModal.isOpen}
                onClose={() => setDetailModal({ isOpen: false, userId: null })}
                title="User Details"
                size="lg"
            >
                {loadingDetails ? (
                    <div className="p-8 text-center text-slate-500">Loading details...</div>
                ) : selectedUser ? (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                                {selectedUser.email[0].toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{selectedUser.email}</h3>
                                <p className="text-sm text-slate-500">Member since {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                                <div className="flex items-center gap-2 text-slate-500 mb-1">
                                    <Book size={16} />
                                    <span className="text-xs font-semibold uppercase">Enrolled Courses</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-800">{selectedUser.enrollments?.length || 0}</p>
                            </div>
                            <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                                <div className="flex items-center gap-2 text-slate-500 mb-1">
                                    <Star size={16} />
                                    <span className="text-xs font-semibold uppercase">Quiz Assignments</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-800">{selectedUser._count?.quizAssignments || 0}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-slate-800 mb-3 block">Course List</h4>
                            {selectedUser.enrollments && selectedUser.enrollments.length > 0 ? (
                                <div className="border border-slate-100 rounded-lg divide-y divide-slate-100">
                                    {selectedUser.enrollments.map((enrol: any) => (
                                        <div key={enrol.id} className="p-3 text-sm flex justify-between items-center">
                                            <span className="font-medium text-slate-700">{enrol.course?.title}</span>
                                            <span className="text-xs text-slate-400">{new Date(enrol.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 italic">No courses enrolled.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-4 text-center text-red-500">Failed to load user info.</div>
                )}
            </Modal>
        </div>
    );
}
