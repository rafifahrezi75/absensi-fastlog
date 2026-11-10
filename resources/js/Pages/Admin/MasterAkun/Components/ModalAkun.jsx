import React, { useState, useEffect } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import api from '../../../../lib/api';

const ModalAkun = ({ isOpen, onClose, onSubmit, editing, processing }) => {
    const [data, setData] = useState({ name: '', email: '', password: '', role: 'user', role_ids: [] });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [availableRoles, setAvailableRoles] = useState([]);

    useEffect(() => {
        if (isOpen) {
            api.get('/api/admin/roles').then(res => {
                setAvailableRoles(res.data.roles || []);
            }).catch(() => {});
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setErrors({});
            setShowPassword(false);
            if (editing) {
                const initialRoleIds = (editing.roles || []).map(r => r.id);
                setData({
                    name: editing.name || '',
                    email: editing.email || '',
                    password: '',
                    role: editing.role || 'user',
                    role_ids: initialRoleIds
                });
            } else {
                setData({
                    name: '',
                    email: '',
                    password: '',
                    role: 'user',
                    role_ids: []
                });
            }
        }
    }, [isOpen, editing]);

    if (!isOpen) return null;

    const setFormData = (key, value) => {
        setData(prev => ({ ...prev, [key]: value }));
        setErrors(prev => ({ ...prev, [key]: undefined }));
    };

    const toggleRole = (roleId) => {
        setData(prev => {
            const exists = prev.role_ids.includes(roleId);
            const nextRoleIds = exists
                ? prev.role_ids.filter(id => id !== roleId)
                : [...prev.role_ids, roleId];

            const selectedRoles = availableRoles.filter(r => nextRoleIds.includes(r.id));
            const isAdminRole = selectedRoles.some(r => r.name !== 'karyawan');
            const nextRole = isAdminRole ? 'admin' : (nextRoleIds.length === 0 ? prev.role : 'user');

            return {
                ...prev,
                role_ids: nextRoleIds,
                role: nextRole
            };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        onSubmit(data, setErrors);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
                <div className="px-6 py-4 bg-[#052B35] text-white flex items-center justify-between">
                    <h3 className="font-bold text-sm">{editing ? 'Edit Akun' : 'Tambah Akun Baru'}</h3>
                    <button onClick={onClose} className="text-white/60 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block font-medium text-slate-700 mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Budi Santoso"
                                    value={data.name}
                                    onChange={(e) => setFormData('name', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:ring-2 focus:ring-[#FF7A3D] focus:outline-none"
                                />
                                {errors.name && <span className="text-[10px] text-rose-600 mt-1 block">{errors.name[0]}</span>}
                            </div>
                            <div>
                                <label className="block font-medium text-slate-700 mb-1">Akses Utama (Sistem)</label>
                                <select
                                    value={data.role}
                                    onChange={(e) => setFormData('role', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:ring-2 focus:ring-[#FF7A3D] focus:outline-none"
                                >
                                    <option value="user">Karyawan (User Portal)</option>
                                    <option value="admin">Administrator (Admin Portal)</option>
                                </select>
                                {errors.role && <span className="text-[10px] text-rose-600 mt-1 block">{errors.role[0]}</span>}
                            </div>
                        </div>

                        <div>
                            <label className="block font-medium text-slate-700 mb-1">Email Login</label>
                            <input
                                type="email"
                                placeholder="email@fastlogem.co.id"
                                value={data.email}
                                onChange={(e) => setFormData('email', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:ring-2 focus:ring-[#FF7A3D] focus:outline-none"
                            />
                            {errors.email && <span className="text-[10px] text-rose-600 mt-1 block">{errors.email[0]}</span>}
                        </div>

                        <div>
                            <label className="block font-medium text-slate-700 mb-1">
                                Password {editing && <span className="text-slate-400 font-normal">(kosongkan jika tidak diubah)</span>}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder={editing ? 'Biarkan kosong untuk tetap sama' : 'Minimal 8 karakter'}
                                    value={data.password}
                                    onChange={(e) => setFormData('password', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 pr-10 text-slate-800 focus:ring-2 focus:ring-[#FF7A3D] focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {!showPassword ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && <span className="text-[10px] text-rose-600 mt-1 block">{errors.password[0]}</span>}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block font-medium text-slate-700">Penugasan Role (Bisa Lebih Dari 1)</label>
                                <span className="text-[11px] text-slate-400">{data.role_ids.length} dipilih</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                {availableRoles.map(role => {
                                    const isChecked = data.role_ids.includes(role.id);
                                    return (
                                        <label
                                            key={role.id}
                                            className={`flex items-start gap-2.5 p-2 rounded-md border cursor-pointer transition text-xs select-none ${isChecked ? 'bg-orange-50/70 border-[#FF7A3D] text-[#052B35]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/50'}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => toggleRole(role.id)}
                                                className="mt-0.5 rounded border-slate-300 text-[#FF7A3D] focus:ring-[#FF7A3D] w-3.5 h-3.5 cursor-pointer"
                                            />
                                            <div className="truncate">
                                                <div className="font-semibold text-slate-900 truncate">{role.label}</div>
                                                <div className="text-[10px] text-slate-400 font-mono">{role.name}</div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                            {errors.role_ids && <span className="text-[10px] text-rose-600 mt-1 block">{errors.role_ids[0]}</span>}
                        </div>
                    </div>
                    <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-[#FF7A3D] hover:bg-[#e0662d] text-white rounded-lg text-xs font-semibold transition disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Menyimpan...' : (editing ? 'Simpan Perubahan' : 'Simpan Data')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalAkun;
