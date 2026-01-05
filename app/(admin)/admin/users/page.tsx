"use client";

import { useEffect, useState } from "react";
import { Shield, ShieldAlert, BadgeCheck, Search, MoreVertical } from "lucide-react";

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

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

    const toggleRole = async (userId: string, currentRole: string) => {
        const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
        if (!confirm(`Are you sure you want to change role to ${newRole}?`)) return;

        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            });

            if (res.ok) {
                fetchUsers();
            } else {
                alert("Failed to update role");
            }
        } catch (error) {
            console.error(error);
            alert("Error updating role");
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.id.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center">Loading users...</div>;

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
                        {filteredUsers.map((user) => (
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
                                    <button
                                        onClick={() => toggleRole(user.id, user.role)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        {user.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
