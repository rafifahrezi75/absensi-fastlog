import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Shield, Users, Save, RotateCcw, Check, CheckSquare, Square, Search, Lock, ShieldCheck, KeyRound, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../../lib/api';
import { showSuccess, showError, showConfirm } from '../../../lib/swal';
import { useAuth } from '../../../Contexts/AuthContext';

const HakAksesIndex = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { hasPermission } = useAuth();
    const canUpdate = hasPermission('hak_akses.update');

    const [mode, setMode] = useState(searchParams.get('mode') === 'user' ? 'user' : 'role');
    const [roles, setRoles] = useState([]);
    const [users, setUsers] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [selectedRoleId, setSelectedRoleId] = useState(searchParams.get('role_id') || '');
    const [selectedUserId, setSelectedUserId] = useState(searchParams.get('user_id') || '');
    const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
    const [initialPermissionIds, setInitialPermissionIds] = useState([]);
    const [userSearch, setUserSearch] = useState('');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/admin/hak-akses');
            const dataRoles = (res.data.roles || []).filter(r => r.show_in_matrix !== false);
            const dataUsers = res.data.users || [];
            const dataPerms = res.data.permissions || [];

            setRoles(dataRoles);
            setUsers(dataUsers);
            setPermissions(dataPerms);

            const paramRoleId = searchParams.get('role_id');
            const paramUserId = searchParams.get('user_id');

            if (mode === 'role') {
                const targetRole = dataRoles.find(r => String(r.id) === String(paramRoleId)) || dataRoles[0];
                if (targetRole) {
                    const ids = targetRole.permissions?.map(p => p.id) || [];
                    setSelectedRoleId(String(targetRole.id));
                    setSelectedPermissionIds(ids);
                    setInitialPermissionIds(ids);
                }
            } else {
                const targetUser = dataUsers.find(u => String(u.id) === String(paramUserId)) || dataUsers[0];
                if (targetUser) {
                    setSelectedUserId(String(targetUser.id));
                    loadUserPermissions(targetUser);
                }
            }
        } catch (err) {
            showError(err.response?.data?.message || 'Gagal memuat data hak akses.');
        } finally {
            setLoading(false);
        }
    }, [mode, searchParams]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const loadUserPermissions = (user) => {
        if (!user) return;
        const direct = user.direct_permissions || [];
        let ids = [];
        if (direct.length > 0) {
            ids = direct.map(p => p.id);
        } else {
            const rolePerms = (user.roles || []).flatMap(r => r.permissions || []).map(p => p.id);
            ids = Array.from(new Set(rolePerms));
        }
        setSelectedPermissionIds(ids);
        setInitialPermissionIds(ids);
    };

    const handleSelectRole = (role) => {
        const ids = role.permissions?.map(p => p.id) || [];
        setSelectedRoleId(String(role.id));
        setSelectedPermissionIds(ids);
        setInitialPermissionIds(ids);
        setSearchParams({ mode: 'role', role_id: String(role.id) });
    };

    const handleSelectUser = (user) => {
        setSelectedUserId(String(user.id));
        loadUserPermissions(user);
        setSearchParams({ mode: 'user', user_id: String(user.id) });
    };

    const handleModeChange = (newMode) => {
        setMode(newMode);
        if (newMode === 'role') {
            const currentRole = roles.find(r => String(r.id) === String(selectedRoleId)) || roles[0];
            if (currentRole) {
                handleSelectRole(currentRole);
            }
        } else {
            const currentUser = users.find(u => String(u.id) === String(selectedUserId)) || users[0];
            if (currentUser) {
                handleSelectUser(currentUser);
            }
        }
    };

    const groupedPermissions = useMemo(() => {
        const groups = {};
        permissions.forEach(p => {
            const g = p.group_name || 'Lainnya';
            if (!groups[g]) groups[g] = [];
            groups[g].push(p);
        });
        return groups;
    }, [permissions]);

    const togglePermission = (id) => {
        if (!canUpdate) return;
        setSelectedPermissionIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleGroup = (groupPerms) => {
        if (!canUpdate) return;
        const groupIds = groupPerms.map(p => p.id);
        const allSelected = groupIds.every(id => selectedPermissionIds.includes(id));

        if (allSelected) {
            setSelectedPermissionIds(prev => prev.filter(id => !groupIds.includes(id)));
        } else {
            setSelectedPermissionIds(prev => Array.from(new Set([...prev, ...groupIds])));
        }
    };

    const selectAll = () => {
        if (!canUpdate) return;
        setSelectedPermissionIds(permissions.map(p => p.id));
    };

    const unselectAll = () => {
        if (!canUpdate) return;
        const currentRole = roles.find(r => String(r.id) === String(selectedRoleId));
        if (mode === 'role' && currentRole?.name === 'super_admin') {
            const protectedIds = permissions.filter(p => p.name === 'hak_akses.view' || p.name === 'hak_akses.update').map(p => p.id);
            setSelectedPermissionIds(protectedIds);
        } else {
            setSelectedPermissionIds([]);
        }
    };

    const resetToInitial = () => {
        if (!canUpdate) return;
        setSelectedPermissionIds([...initialPermissionIds]);
    };

    const handleSave = async () => {
        if (!canUpdate) return;
        setSaving(true);
        try {
            if (mode === 'role') {
                const res = await api.put(`/api/admin/hak-akses/role/${selectedRoleId}`, {
                    permission_ids: selectedPermissionIds
                });
                showSuccess(res.data.message || 'Hak akses role berhasil disimpan.');
                const savedIds = res.data.role?.permissions?.map(p => p.id) || selectedPermissionIds;
                setInitialPermissionIds(savedIds);
                setRoles(prev => prev.map(r => String(r.id) === String(selectedRoleId) ? { ...r, permissions: res.data.role.permissions } : r));
            } else {
                const res = await api.put(`/api/admin/hak-akses/user/${selectedUserId}`, {
                    permission_ids: selectedPermissionIds
                });
                showSuccess(res.data.message || 'Hak akses khusus pengguna berhasil disimpan.');
                const updatedUser = res.data.user;
                setUsers(prev => prev.map(u => String(u.id) === String(selectedUserId) ? updatedUser : u));
                loadUserPermissions(updatedUser);
            }
        } catch (err) {
            showError(err.response?.data?.message || 'Gagal menyimpan hak akses.');
        } finally {
            setSaving(false);
        }
    };

    const handleResetUser = async () => {
        if (!canUpdate) return;
        const targetUser = users.find(u => String(u.id) === String(selectedUserId));
        if (!targetUser) return;

        const confirmed = await showConfirm({
            title: 'Reset Hak Akses Pengguna',
            text: `Apakah Anda yakin ingin menghapus hak akses khusus untuk "${targetUser.name}" dan mengembalikannya ke aturan default Role?`,
            confirmText: 'Ya, Reset',
            confirmColor: '#4f46e5'
        });

        if (!confirmed) return;

        setSaving(true);
        try {
            const res = await api.put(`/api/admin/hak-akses/user/${selectedUserId}`, { reset: true });
            showSuccess(res.data.message || 'Hak akses pengguna telah direset ke default role.');
            const updatedUser = res.data.user;
            setUsers(prev => prev.map(u => String(u.id) === String(selectedUserId) ? updatedUser : u));
            loadUserPermissions(updatedUser);
        } catch (err) {
            showError(err.response?.data?.message || 'Gagal mereset hak akses.');
        } finally {
            setSaving(false);
        }
    };

    const currentRole = roles.find(r => String(r.id) === String(selectedRoleId));
    const currentUser = users.find(u => String(u.id) === String(selectedUserId));
    const userHasCustomOverride = currentUser && (currentUser.direct_permissions?.length > 0);

    const filteredUsers = useMemo(() => {
        if (!userSearch) return users;
        const q = userSearch.toLowerCase();
        return users.filter(u => (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q));
    }, [users, userSearch]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Matriks Hak Akses</h1>
                    <p className="text-sm text-slate-500">Konfigurasi hak akses presisi berdasarkan Role atau penyesuaian khusus per Pengguna.</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                        onClick={() => handleModeChange('role')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${mode === 'role' ? 'bg-[#052B35] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <Shield className="w-4 h-4" /> Per Role
                    </button>
                    <button
                        onClick={() => handleModeChange('user')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${mode === 'user' ? 'bg-[#052B35] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <Users className="w-4 h-4" /> Per Pengguna (Override)
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    {mode === 'role' ? (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Pilih Role</span>
                                <span className="text-[11px] font-semibold text-slate-400">{roles.length} Role</span>
                            </div>
                            <div className="space-y-1.5">
                                {roles.map(role => {
                                    const isSelected = String(role.id) === String(selectedRoleId);
                                    return (
                                        <button
                                            key={role.id}
                                            onClick={() => handleSelectRole(role)}
                                            className={`w-full text-left p-3 rounded-lg border text-xs font-medium transition flex items-center justify-between ${isSelected ? 'bg-orange-50/80 border-[#FF7A3D] text-[#052B35] shadow-xs' : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100/70'}`}
                                        >
                                            <div className="truncate">
                                                <div className="font-bold text-slate-900">{role.label}</div>
                                                <div className="text-[10px] text-slate-400 font-mono">{role.name}</div>
                                            </div>
                                            {role.is_system && (
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                                                    Sistem
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Pilih Pengguna</span>
                                <span className="text-[11px] font-semibold text-slate-400">{users.length} Akun</span>
                            </div>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari pengguna..."
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF7A3D]"
                                />
                            </div>
                            <div className="space-y-1.5 max-h-[460px] overflow-y-auto">
                                {filteredUsers.map(u => {
                                    const isSelected = String(u.id) === String(selectedUserId);
                                    const hasOverride = u.direct_permissions?.length > 0;
                                    return (
                                        <button
                                            key={u.id}
                                            onClick={() => handleSelectUser(u)}
                                            className={`w-full text-left p-2.5 rounded-lg border text-xs font-medium transition flex items-center justify-between ${isSelected ? 'bg-orange-50/80 border-[#FF7A3D] text-[#052B35] shadow-xs' : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100/70'}`}
                                        >
                                            <div className="truncate">
                                                <div className="font-semibold text-slate-900 truncate">{u.name}</div>
                                                <div className="text-[11px] text-slate-400 truncate">{u.email}</div>
                                            </div>
                                            {hasOverride && (
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 shrink-0">
                                                    Override
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#052B35]/10 text-[#052B35] flex items-center justify-center font-bold">
                                {mode === 'role' ? <ShieldCheck className="w-5 h-5 text-[#052B35]" /> : <Users className="w-5 h-5 text-[#052B35]" />}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <span>{mode === 'role' ? currentRole?.label || 'Pilih Role' : currentUser?.name || 'Pilih Pengguna'}</span>
                                    {mode === 'role' && currentRole?.is_system && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                            Role Sistem
                                        </span>
                                    )}
                                    {mode === 'user' && userHasCustomOverride && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                                            Hak Akses Override Khusus
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-slate-500">
                                    {selectedPermissionIds.length} dari {permissions.length} hak akses diaktifkan
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            {canUpdate && (
                                <>
                                    <button
                                        onClick={resetToInitial}
                                        type="button"
                                        title="Kembalikan centang ke kondisi awal"
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Reset</span>
                                    </button>
                                    <button
                                        onClick={selectAll}
                                        type="button"
                                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                                    >
                                        Pilih Semua
                                    </button>
                                    <button
                                        onClick={unselectAll}
                                        type="button"
                                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                                    >
                                        Batal Semua
                                    </button>
                                </>
                            )}
                            {mode === 'user' && userHasCustomOverride && canUpdate && (
                                <button
                                    onClick={handleResetUser}
                                    disabled={saving}
                                    type="button"
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Reset ke Default Role</span>
                                </button>
                            )}
                            {canUpdate && (
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    type="button"
                                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#FF7A3D] hover:bg-[#e0662d] text-white shadow-sm transition disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                    <span>{saving ? 'Menyimpan...' : 'Simpan Hak Akses'}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="py-20 text-center flex flex-col items-center gap-3">
                                <Loader2 className="w-8 h-8 text-[#FF7A3D] animate-spin" />
                                <p className="text-sm text-slate-400">Memuat matriks hak akses...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                                            <th className="px-5 py-3.5 w-64">Nama Modul</th>
                                            <th className="px-3 py-3.5 text-center w-20">Lihat</th>
                                            <th className="px-3 py-3.5 text-center w-20">Buat</th>
                                            <th className="px-3 py-3.5 text-center w-20">Ubah</th>
                                            <th className="px-3 py-3.5 text-center w-20">Hapus</th>
                                            <th className="px-4 py-3.5">Aksi / Izin Khusus</th>
                                            <th className="px-4 py-3.5 text-right w-32">Status Modul</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {Object.entries(groupedPermissions).map(([groupName, groupPerms]) => {
                                            const activeCount = groupPerms.filter(p => selectedPermissionIds.includes(p.id)).length;
                                            const isAllSelected = groupPerms.length > 0 && activeCount === groupPerms.length;

                                            const viewPerm = groupPerms.find(p => p.name.endsWith('.view'));
                                            const createPerm = groupPerms.find(p => p.name.endsWith('.create'));
                                            const updatePerm = groupPerms.find(p => p.name.endsWith('.update'));
                                            const deletePerm = groupPerms.find(p => p.name.endsWith('.delete'));

                                            const specialPerms = groupPerms.filter(p =>
                                                !p.name.endsWith('.view') &&
                                                !p.name.endsWith('.create') &&
                                                !p.name.endsWith('.update') &&
                                                !p.name.endsWith('.delete')
                                            );

                                            return (
                                                <tr key={groupName} className="hover:bg-slate-50/70 transition">
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-2.5">
                                                            <input
                                                                type="checkbox"
                                                                checked={isAllSelected}
                                                                disabled={!canUpdate}
                                                                onChange={() => toggleGroup(groupPerms)}
                                                                className="rounded border-slate-300 text-[#FF7A3D] focus:ring-[#FF7A3D] w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                                                            />
                                                            <span className="font-semibold text-slate-900 text-xs">{groupName}</span>
                                                        </div>
                                                    </td>

                                                    <td className="px-3 py-3.5 text-center">
                                                        {viewPerm ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedPermissionIds.includes(viewPerm.id)}
                                                                disabled={!canUpdate}
                                                                onChange={() => togglePermission(viewPerm.id)}
                                                                className="rounded border-slate-300 text-[#FF7A3D] focus:ring-[#FF7A3D] w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                                                            />
                                                        ) : (
                                                            <span className="text-slate-300 font-mono">-</span>
                                                        )}
                                                    </td>

                                                    <td className="px-3 py-3.5 text-center">
                                                        {createPerm ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedPermissionIds.includes(createPerm.id)}
                                                                disabled={!canUpdate}
                                                                onChange={() => togglePermission(createPerm.id)}
                                                                className="rounded border-slate-300 text-[#FF7A3D] focus:ring-[#FF7A3D] w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                                                            />
                                                        ) : (
                                                            <span className="text-slate-300 font-mono">-</span>
                                                        )}
                                                    </td>

                                                    <td className="px-3 py-3.5 text-center">
                                                        {updatePerm ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedPermissionIds.includes(updatePerm.id)}
                                                                disabled={!canUpdate}
                                                                onChange={() => togglePermission(updatePerm.id)}
                                                                className="rounded border-slate-300 text-[#FF7A3D] focus:ring-[#FF7A3D] w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                                                            />
                                                        ) : (
                                                            <span className="text-slate-300 font-mono">-</span>
                                                        )}
                                                    </td>

                                                    <td className="px-3 py-3.5 text-center">
                                                        {deletePerm ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedPermissionIds.includes(deletePerm.id)}
                                                                disabled={!canUpdate}
                                                                onChange={() => togglePermission(deletePerm.id)}
                                                                className="rounded border-slate-300 text-[#FF7A3D] focus:ring-[#FF7A3D] w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                                                            />
                                                        ) : (
                                                            <span className="text-slate-300 font-mono">-</span>
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-3.5">
                                                        {specialPerms.length > 0 ? (
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                {specialPerms.map(sp => {
                                                                    const isChecked = selectedPermissionIds.includes(sp.id);
                                                                    const actionPart = sp.name.split('.')[1] || sp.name;
                                                                    return (
                                                                        <label
                                                                            key={sp.id}
                                                                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium border cursor-pointer transition select-none ${isChecked ? 'bg-orange-50 border-orange-200 text-[#FF7A3D]' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                                                                        >
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={isChecked}
                                                                                disabled={!canUpdate}
                                                                                onChange={() => togglePermission(sp.id)}
                                                                                className="rounded border-slate-300 text-[#FF7A3D] focus:ring-[#FF7A3D] w-3 h-3 cursor-pointer disabled:cursor-not-allowed"
                                                                            />
                                                                            <span className="capitalize">{sp.label.replace(groupName, '').trim() || actionPart}</span>
                                                                        </label>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-300 text-[11px] italic">Standar CRUD</span>
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${activeCount === groupPerms.length ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : (activeCount > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-500 border border-slate-200')}`}>
                                                            {activeCount}/{groupPerms.length} Aktif
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HakAksesIndex;

