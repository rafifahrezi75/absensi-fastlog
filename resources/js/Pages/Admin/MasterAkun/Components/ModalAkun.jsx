import React, { useState } from 'react';
import { X } from 'lucide-react';

const ModalAkun = ({ isOpen, onClose, onSubmit, editing, processing }) => {
    const [data, setData] = useState({ name: '', email: '', password: '', role: 'user' });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    // Isi form saat mode edit / reset saat mode tambah
    React.useEffect(() => {
        if (isOpen) {
            setErrors({});
            setShowPassword(false);
            if (editing) {
                setData({ name: editing.name, email: editing.email, password: '', role: editing.role });
            } else {
                setData({ name: '', email: '', password: '', role: 'user' });
            }
        }
    }, [isOpen, editing]);

    if (!isOpen) return null;

    const setFormData = (key, value) => {
        setData(prev => ({ ...prev, [key]: value }));
        setErrors(prev => ({ ...prev, [key]: undefined }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        onSubmit(data, setErrors);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full mx-4 overflow-hidden">
                <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                    <h3 className="font-bold text-sm">{editing ? 'Edit Akun' : 'Tambah Akun Baru'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block font-medium text-slate-700 mb-1">Nama Lengkap</label>
                                <input type="text" placeholder="Contoh: Budi Santoso" value={data.name} onChange={(e) => setFormData('name', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                                {errors.name && <span className="text-[10px] text-rose-600 mt-1 block">{errors.name[0]}</span>}
                            </div>
                            <div>
                                <label className="block font-medium text-slate-700 mb-1">Role</label>
                                <select value={data.role} onChange={(e) => setFormData('role', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                                    <option value="user">Karyawan (User)</option>
                                    <option value="admin">Admin</option>
                                </select>
                                {errors.role && <span className="text-[10px] text-rose-600 mt-1 block">{errors.role[0]}</span>}
                            </div>
                        </div>

                        <div>
                            <label className="block font-medium text-slate-700 mb-1">Email</label>
                            <input type="email" placeholder="email@fastlogem.co.id" value={data.email} onChange={(e) => setFormData('email', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                            {errors.email && <span className="text-[10px] text-rose-600 mt-1 block">{errors.email[0]}</span>}
                        </div>

                        <div>
                            <label className="block font-medium text-slate-700 mb-1">
                                Password {editing && <span className="text-slate-400 font-normal">(kosongkan jika tidak diubah)</span>}
                            </label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} placeholder={editing ? 'Biarkan kosong untuk tetap sama' : 'Minimal 8 karakter'} value={data.password} onChange={(e) => setFormData('password', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 pr-10 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
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
                    </div>
                    <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition">Batal</button>
                        <button type="submit" disabled={processing} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition disabled:opacity-70 disabled:cursor-not-allowed">{editing ? 'Simpan Perubahan' : 'Simpan Data'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalAkun;
