import React, { useState, useCallback, useEffect } from 'react';
import { Users, Plus, Search, ShieldCheck, Edit3, Trash2, CheckCircle2, XCircle, X, UserX, Loader2 } from 'lucide-react';
import ModalAkun from './Components/ModalAkun';
import api from '../../../lib/api';
import { showSuccess, showError, showConfirm } from '../../../lib/swal';
import { useAuth } from '../../../Contexts/AuthContext';

const MasterAkun = () => {
    const { hasPermission } = useAuth();
    const [modalData, setModalData] = useState({ isOpen: false, editing: null });
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [notif, setNotif] = useState(null);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const [resUsers, resRoles] = await Promise.all([
                api.get('/api/admin/akun'),
                api.get('/api/admin/roles').catch(() => ({ data: { roles: [] } }))
            ]);
            setUsers(resUsers.data.users || []);
            setRoles(resRoles.data.roles || []);
        } catch (err) {
            showNotif(err.response?.data?.message || 'Gagal memuat data akun.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        if (notif) {
            const timer = setTimeout(() => setNotif(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [notif]);

    const showNotif = (message, type = 'success') => {
        if (type === 'success') {
            showSuccess(message);
        } else {
            setNotif({ message, type });
        }
    };

    const openModalTambah = useCallback(() => {
        setModalData({ isOpen: true, editing: null });
    }, []);

    const openModalEdit = useCallback((user) => {
        setModalData({ isOpen: true, editing: user });
    }, []);

    const closeModal = useCallback(() => {
        setModalData({ isOpen: false, editing: null });
    }, []);

    const handleSubmit = async (data, setErrors) => {
        try {
            setProcessing(true);
            if (modalData.editing) {
                await api.put(`/api/admin/akun/${modalData.editing.id}`, data);
                showSuccess('Akun berhasil diperbarui.');
            } else {
                await api.post('/api/admin/akun', data);
                showSuccess('Akun berhasil ditambahkan.');
            }
            closeModal();
            fetchUsers();
        } catch (err) {
            if (err.response?.status === 422 && err.response.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                showNotif(err.response?.data?.message || 'Terjadi kesalahan.', 'error');
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (user) => {
        const confirmed = await showConfirm({
            title: 'Hapus Akun',
            text: `Yakin ingin menghapus akun "${user.name}"?`,
            confirmText: 'Ya, Hapus',
            confirmColor: '#e11d48'
        });
        if (!confirmed) return;

        try {
            const res = await api.delete(`/api/admin/akun/${user.id}`);
            showSuccess(res.data.message || 'Akun berhasil dihapus.');
            fetchUsers();
        } catch (err) {
            showNotif(err.response?.data?.message || 'Gagal menghapus akun.', 'error');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchSearch = (user.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (user.email || '').toLowerCase().includes(search.toLowerCase());
        const matchRole = !roleFilter ||
            user.role === roleFilter ||
            (user.roles && user.roles.some(r => r.name === roleFilter || String(r.id) === String(roleFilter)));
        return matchSearch && matchRole;
    });

    const totalAdmin = users.filter(user => user.role === 'admin' || (user.roles && user.roles.some(r => r.name !== 'karyawan'))).length;
    const totalUser = users.filter(user => user.role === 'user' && (!user.roles || user.roles.every(r => r.name === 'karyawan'))).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Master Akun</h1>
                    <p className="text-sm text-slate-500">Kelola akun login admin dan karyawan dengan penetapan multi-role terintegrasi.</p>
                </div>
                {hasPermission('master_akun.create') && (
                    <div className="flex items-center gap-3">
                        <button onClick={openModalTambah} className="flex items-center gap-2 bg-[#FF7A3D] hover:bg-[#e0662d] text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm">
                            <Plus className="w-4 h-4" /> Tambah Akun
                        </button>
                    </div>
                )}
            </div>

            {notif && notif.type === 'error' && (
                <div className="fixed bottom-6 right-6 z-[60] animate-toast flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border text-sm font-medium bg-white text-rose-700 border-rose-200">
                    <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    <span>{notif.message}</span>
                    <button onClick={() => setNotif(null)} className="ml-2 text-slate-300 hover:text-slate-500 transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Akun</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{users.length}</div>
                    <span className="text-[11px] text-slate-500">Akun Terdaftar</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Akses Manajemen</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{totalAdmin}</div>
                    <span className="text-[11px] text-indigo-600 font-medium">Admin & Peran Khusus</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Karyawan Reguler</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{totalUser}</div>
                    <span className="text-[11px] text-emerald-600 font-medium">Akses Portal Mandiri</span>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari nama atau email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#FF7A3D] focus:ring-1 focus:ring-[#FF7A3D]"
                    />
                </div>
                <select className="border border-slate-300 rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none focus:border-[#FF7A3D] focus:ring-1 focus:ring-[#FF7A3D] text-slate-600" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="">Semua Role</option>
                    <option value="admin">Admin Portal</option>
                    <option value="user">User Portal</option>
                    {roles.map(r => (
                        <option key={r.id} value={r.name}>{r.label}</option>
                    ))}
                </select>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Nama Akun</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Email</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Penugasan Role</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Dibuat</th>
                                {(hasPermission('master_akun.update') || hasPermission('master_akun.delete')) && (
                                    <th scope="col" className="px-6 py-3.5 font-semibold text-center">Tindakan</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={(hasPermission('master_akun.update') || hasPermission('master_akun.delete')) ? 5 : 4} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-[#FF7A3D] animate-spin" />
                                            <p className="text-sm text-slate-400">Memuat data akun...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={(hasPermission('master_akun.update') || hasPermission('master_akun.delete')) ? 5 : 4} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                                                <UserX className="w-7 h-7 text-slate-300" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-500">
                                                    {search || roleFilter ? 'Akun tidak ditemukan' : 'Belum ada akun terdaftar'}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {search || roleFilter
                                                        ? 'Coba ubah filter atau kata kunci pencarian.'
                                                        : 'Klik "Tambah Akun" untuk membuat akun baru.'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-[#052B35]/10 text-[#052B35] font-bold flex items-center justify-center text-xs">
                                                    {user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                                                </div>
                                                <div className="font-semibold text-sm">{user.name || <span className="text-slate-300 italic font-normal">Nama tidak tersedia</span>}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-800 whitespace-nowrap">{user.email || <span className="text-slate-300 italic">-</span>}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1.5 max-w-sm">
                                                {user.roles && user.roles.length > 0 ? (
                                                    user.roles.map(r => (
                                                        <span key={r.id} className="inline-flex items-center gap-1 bg-orange-50 text-[#052B35] border border-orange-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                                                            <ShieldCheck className="w-3 h-3 text-[#FF7A3D]" />
                                                            {r.label}
                                                        </span>
                                                    ))
                                                ) : (
                                                    user.role === 'admin' ? (
                                                        <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                                                            <ShieldCheck className="w-3 h-3" /> Admin
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                                                            <Users className="w-3 h-3" /> Karyawan
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                                            {user.created_at
                                                ? new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                                : <span className="text-slate-300 italic">-</span>}
                                        </td>
                                        {(hasPermission('master_akun.update') || hasPermission('master_akun.delete')) && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-2">
                                                    {hasPermission('master_akun.update') && (
                                                        <button onClick={() => openModalEdit(user)} title="Edit Akun" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {hasPermission('master_akun.delete') && (
                                                        <button onClick={() => handleDelete(user)} title="Hapus Akun" className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ModalAkun
                isOpen={modalData.isOpen}
                onClose={closeModal}
                onSubmit={handleSubmit}
                editing={modalData.editing}
                processing={processing}
            />
        </div>
    );
};

export default MasterAkun;
