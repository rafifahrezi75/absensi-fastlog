import React, { useState, useCallback, useEffect } from 'react';
import { Users, Plus, Search, ShieldCheck, Edit3, Trash2, CheckCircle2, XCircle, X } from 'lucide-react';
import ModalAkun from './Components/ModalAkun';
import api from '../../../lib/api';

const MasterAkun = () => {
    const [modalData, setModalData] = useState({ isOpen: false, editing: null });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [notif, setNotif] = useState(null);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/admin/akun');
            setUsers(res.data.users || []);
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

    const showNotif = (message, type) => setNotif({ message, type });

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
                showNotif('Akun berhasil diperbarui.', 'success');
            } else {
                await api.post('/api/admin/akun', data);
                showNotif('Akun berhasil ditambahkan.', 'success');
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
        if (!window.confirm(`Yakin ingin menghapus akun "${user.name}"?`)) return;

        try {
            const res = await api.delete(`/api/admin/akun/${user.id}`);
            showNotif(res.data.message || 'Akun berhasil dihapus.', 'success');
            fetchUsers();
        } catch (err) {
            showNotif(err.response?.data?.message || 'Gagal menghapus akun.', 'error');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = !roleFilter || user.role === roleFilter;
        return matchSearch && matchRole;
    });

    const totalAdmin = users.filter(user => user.role === 'admin').length;
    const totalUser = users.filter(user => user.role === 'user').length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Master Akun</h1>
                    <p className="text-sm text-slate-500">Kelola akun login admin dan karyawan. Registrasi akun hanya dilakukan dari halaman ini.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={openModalTambah} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
                        <Plus className="w-4 h-4" /> Tambah Akun
                    </button>
                </div>
            </div>

            {notif && (
                <div className={`fixed bottom-6 right-6 z-[60] animate-toast flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border text-sm font-medium ${notif.type === 'success' ? 'bg-white text-emerald-700 border-emerald-200' : 'bg-white text-rose-700 border-rose-200'}`}>
                    {notif.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    ) : (
                        <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    )}
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
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Admin</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{totalAdmin}</div>
                    <span className="text-[11px] text-indigo-600 font-medium">Akses Penuh Sistem</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Karyawan (User)</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{totalUser}</div>
                    <span className="text-[11px] text-emerald-600 font-medium">Akses Absensi Mandiri</span>
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
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                </div>
                <select className="border border-slate-300 rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-600" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="">Semua Role</option>
                    <option value="admin">Admin</option>
                    <option value="user">Karyawan (User)</option>
                </select>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Nama Akun</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Email</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Role</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Dibuat</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold text-center">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-sm text-slate-400">Memuat data akun...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-sm text-slate-400">Belum ada akun yang cocok.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                                                    {user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                                                </div>
                                                <div className="font-semibold text-sm">{user.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-800 whitespace-nowrap">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.role === 'admin' ? (
                                                <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full text-[11px] font-semibold">
                                                    <ShieldCheck className="w-3 h-3" /> Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[11px] font-semibold">
                                                    <Users className="w-3 h-3" /> Karyawan
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                                            {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => openModalEdit(user)} title="Edit Akun" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(user)} title="Hapus Akun" className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
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
