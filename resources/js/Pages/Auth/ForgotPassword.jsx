import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { showSuccess, showError } from '../../lib/swal';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        document.title = "Lupa Password - Fastlog Era Mandiri";
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const res = await api.post('/api/forgot-password', { email });
            setSent(true);
            showSuccess(res.data.message || 'Tautan reset password berhasil dikirim ke email Anda.');
        } catch (err) {
            if (err.response?.status === 422 && err.response.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                showError(err.response?.data?.message || 'Gagal mengirim email reset password.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-orange-50 via-white to-slate-50 font-sans antialiased">
            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-[#052B35]/10 border border-white/60 p-8">
                <div className="flex items-center justify-center mb-6">
                    <img src="/images/front-end/logo3.webp" alt="Fastlog" className="h-12 w-auto object-contain" />
                </div>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-[#052B35]">Lupa Password</h2>
                    <p className="text-gray-500 text-xs mt-1">
                        Masukkan email Anda yang terdaftar untuk menerima tautan reset password
                    </p>
                </div>

                {sent ? (
                    <div className="space-y-4">
                        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs leading-relaxed">
                            Tautan reset password telah dikirim ke <span className="font-semibold">{email}</span>. Silakan periksa inbox email atau folder spam Anda.
                        </div>
                        <Link
                            to="/login"
                            className="block text-center w-full bg-[#052B35] hover:bg-[#083C4A] text-white font-semibold py-3 rounded-xl transition text-sm cursor-pointer"
                        >
                            Kembali ke Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Terdaftar</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nama@fastlogem.co.id"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A3D]/20 focus:border-[#FF7A3D] transition bg-white/90"
                            />
                            {errors?.email && <span className="text-xs text-rose-600 mt-1 block">{errors.email}</span>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#052B35] hover:bg-[#083C4A] text-white font-semibold py-3 rounded-xl transition shadow-md shadow-[#052B35]/20 text-sm disabled:opacity-60 cursor-pointer"
                        >
                            {loading ? 'Mengirim...' : 'Kirim Tautan Reset Password'}
                        </button>

                        <div className="text-center pt-2">
                            <Link to="/login" className="text-xs text-gray-500 hover:text-[#FF7A3D] transition">
                                Batal dan Kembali ke Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
