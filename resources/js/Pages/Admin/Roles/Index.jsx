import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Plus, Edit3, Trash2, KeyRound, Users, CheckCircle2, XCircle, X, Loader2, ShieldCheck, ShieldAlert, EyeOff } from 'lucide-react';
import api from '../../../lib/api';
import { showSuccess, showError, showConfirm } from '../../../lib/swal';
import { useAuth } from '../../../Contexts/AuthContext';

const RolesIndex = () => {
    const navigate = useNavigate();
    const { hasPermission } = useAuth();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [modalData, setModalData] = useState({ isOpen: false, editing: null });
    const [formData, setFormData] = useState({ name: '', label: '', description: '', is_active: true, show_in_matrix: true });
    const [errors, setErrors] = useState({});

    const fetchRoles = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/admin/roles');
            setRoles(res.data.roles || []);
        } catch (err) {
            showError(err.response?.data?.message || 'Gagal memuat data role.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const openModalTambah = () => {
        setFormData({ name: '', label: '', description: '', is_active: true, show_in_matrix: true });
        setErrors({});
        setModalData({ isOpen: true, editing: null });
    };

    const openModalEdit = (role) => {
        setFormData({
            name: role.name,
            label: role.label,
            description: role.description || '',
            is_active: Boolean(role.is_active),
            show_in_matrix: role.show_in_matrix !== false
        });
        setErrors({});
        setModalData({ isOpen: true, editing: role });
    };

    const closeModal = () => {
        setModalData({ isOpen: false, editing: null });
        setFormData({ name: '', label: '', description: '', is_active: true, show_in_matrix: true });
        setErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        try {
            setProcessing(true);
            if (modalData.editing) {
                await api.put(`/api/admin/roles/${modalData.editing.id}`, formData);
                showSuccess('Data role berhasil diperbarui.');
            } else {
                await api.post('/api/admin/roles', formData);
                showSuccess('Role baru berhasil ditambahkan.');
            }
            closeModal();
            fetchRoles();
        } catch (err) {
            if (err.response?.status === 422 && err.response.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                showError(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data role.');
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (role) => {
        if (role.is_system) {
            showError('Role bawaan sistem tidak dapat dihapus.');
            return;
        }

        if (role.users_count > 0) {
            showError(`Role tidak dapat dihapus karena masih digunakan oleh ${role.users_count} pengguna.`);
            return;
        }

        const confirmed = await showConfirm({
            title: 'Hapus Role',
            text: `Yakin ingin menghapus role "${role.label}"? Hak akses terkait role ini akan dihapus.`,
            confirmText: 'Ya, Hapus',
            confirmColor: '#e11d48'
        });

        if (!confirmed) return;

        try {
            const res = await api.delete(`/api/admin/roles/${role.id}`);
            showSuccess(res.data.message || 'Role berhasil dihapus.');
            fetchRoles();
        } catch (err) {
            showError(err.response?.data?.message || 'Gagal menghapus role.');
        }
    };

    const totalSystem = roles.filter(r => r.is_system).length;
    const totalCustom = roles.filter(r => !r.is_system).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Master Role</h1>
                    <p className="text-sm text-slate-500">Kelola daftar peran pengguna dan grup hak akses dalam sistem.</p>
                </div>
                {hasPermission('master_role.create') && (
                    <button
                        onClick={openModalTambah}
                        className="flex items-center gap-2 bg-[#FF7A3D] hover:bg-[#e0662d] text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Tambah Role
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Role</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{roles.length}</div>
                    <span className="text-[11px] text-slate-500">Role Terdaftar</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Role Sistem</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{totalSystem}</div>
                    <span className="text-[11px] text-indigo-600 font-medium">Bawaan Inti Aplikasi</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Role Kustom</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{totalCustom}</div>
                    <span className="text-[11px] text-emerald-600 font-medium">Dibuat Manual</span>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Nama Role & Kode</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Deskripsi</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold text-center">Tipe</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold text-center">Jumlah Pengguna</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold text-center">Matriks Hak Akses</th>
                                {(hasPermission('hak_akses.view') || hasPermission('master_role.update') || hasPermission('master_role.delete')) && (
                                    <th scope="col" className="px-6 py-3.5 font-semibold text-center">Tindakan</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={(hasPermission('hak_akses.view') || hasPermission('master_role.update') || hasPermission('master_role.delete')) ? 6 : 5} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-[#FF7A3D] animate-spin" />
                                            <p className="text-sm text-slate-400">Memuat data role...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : roles.length === 0 ? (
                                <tr>
                                    <td colSpan={(hasPermission('hak_akses.view') || hasPermission('master_role.update') || hasPermission('master_role.delete')) ? 6 : 5} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Shield className="w-10 h-10 text-slate-300" />
                                            <p className="text-sm font-semibold text-slate-500">Belum ada role yang tersedia.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                roles.map((role) => (
                                    <tr key={role.id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-[#052B35]/10 text-[#052B35] font-bold flex items-center justify-center text-sm">
                                                    <ShieldCheck className="w-5 h-5 text-[#052B35]" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900 text-sm">{role.label}</div>
                                                    <div className="text-xs font-mono text-slate-400">{role.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                                            {role.description || <span className="text-slate-300 italic">Tidak ada keterangan</span>}
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            {role.is_system ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                    Sistem
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    Kustom
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                                                <Users className="w-3.5 h-3.5 text-slate-500" />
                                                {role.users_count || 0} Akun
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            {role.show_in_matrix !== false ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-50 text-[#FF7A3D] border border-orange-200">
                                                    <KeyRound className="w-3.5 h-3.5" />
                                                    {role.permissions_count || 0} Izin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                                                    <EyeOff className="w-3.5 h-3.5 text-slate-400" /> Disembunyikan
                                                </span>
                                            )}
                                        </td>
                                        {(hasPermission('hak_akses.view') || hasPermission('master_role.update') || hasPermission('master_role.delete')) && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-2">
                                                    {hasPermission('hak_akses.view') && role.show_in_matrix !== false && (
                                                        <button
                                                            onClick={() => navigate(`/admin/hak-akses?role_id=${role.id}`)}
                                                            title="Atur Matriks Hak Akses"
                                                            className="p-2 text-slate-400 hover:text-[#FF7A3D] hover:bg-orange-50 rounded-lg transition"
                                                        >
                                                            <KeyRound className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {hasPermission('master_role.update') && (
                                                        <button
                                                            onClick={() => openModalEdit(role)}
                                                            title="Edit Role"
                                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {hasPermission('master_role.delete') && !role.is_system && (
                                                        <button
                                                            onClick={() => handleDelete(role)}
                                                            title="Hapus Role"
                                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                                        >
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

            {modalData.isOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
                        <div className="px-6 py-4 bg-[#052B35] text-white flex items-center justify-between">
                            <h3 className="font-bold text-sm">{modalData.editing ? 'Edit Role' : 'Tambah Role Baru'}</h3>
                            <button onClick={closeModal} className="text-white/60 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-4 text-xs">
                                <div>
                                    <label className="block font-medium text-slate-700 mb-1">Kode Role (Identifier Unik)</label>
                                    <input
                                        type="text"
                                        placeholder="contoh: supervisor_ops"
                                        value={formData.name}
                                        disabled={Boolean(modalData.editing?.is_system)}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-[#FF7A3D] focus:outline-none disabled:bg-slate-200 disabled:text-slate-500"
                                    />
                                    {modalData.editing?.is_system && (
                                        <span className="text-[10px] text-slate-400 mt-1 block">Kode role sistem tidak dapat diubah.</span>
                                    )}
                                    {errors.name && <span className="text-[10px] text-rose-600 mt-1 block">{errors.name[0]}</span>}
                                </div>

                                <div>
                                    <label className="block font-medium text-slate-700 mb-1">Label Role (Nama Tampilan)</label>
                                    <input
                                        type="text"
                                        placeholder="contoh: Supervisor Operasional"
                                        value={formData.label}
                                        onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                                        className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:ring-2 focus:ring-[#FF7A3D] focus:outline-none"
                                    />
                                    {errors.label && <span className="text-[10px] text-rose-600 mt-1 block">{errors.label[0]}</span>}
                                </div>

                                <div>
                                    <label className="block font-medium text-slate-700 mb-1">Deskripsi & Catatan</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Keterangan cakupan tanggung jawab atau kewenangan role ini..."
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:ring-2 focus:ring-[#FF7A3D] focus:outline-none resize-none"
                                    />
                                    {errors.description && <span className="text-[10px] text-rose-600 mt-1 block">{errors.description[0]}</span>}
                                </div>

                                <div className="pt-1">
                                    <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition select-none">
                                        <input
                                            type="checkbox"
                                            checked={formData.show_in_matrix}
                                            onChange={(e) => setFormData(prev => ({ ...prev, show_in_matrix: e.target.checked }))}
                                            className="mt-0.5 rounded border-slate-300 text-[#FF7A3D] focus:ring-[#FF7A3D] w-4 h-4 cursor-pointer"
                                        />
                                        <div>
                                            <div className="font-semibold text-slate-900 text-xs">Tampilkan di Matriks Hak Akses</div>
                                            <div className="text-[11px] text-slate-500 mt-0.5">
                                                Hilangkan centang jika role ini adalah role khusus portal karyawan mandiri dan ingin disembunyikan dari daftar Matriks Hak Akses admin.
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-[#FF7A3D] hover:bg-[#e0662d] text-white rounded-lg text-xs font-semibold transition disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Menyimpan...' : (modalData.editing ? 'Simpan Perubahan' : 'Simpan Role')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RolesIndex;
