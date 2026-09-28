import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../lib/api';
import { showSuccess, showError } from '../../lib/swal';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';
    const emailParam = searchParams.get('email') || '';

    const [email, setEmail] = useState(emailParam);
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        document.title = "Reset Password - Fastlog Era Mandiri";
        if (emailParam) setEmail(emailParam);
    }, [emailParam]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        if (password !== passwordConfirmation) {
            setErrors({ password_confirmation: 'Konfirmasi password tidak cocok.' });
            setLoading(false);
            return;
        }

        try {
            const res = await api.post('/api/reset-password', {
                email,
                token,
                password,
                password_confirmation: passwordConfirmation,
            });

            showSuccess(res.data.message || 'Password berhasil diperbarui.');
            navigate('/login');
        } catch (err) {
            if (err.response?.status === 422 && err.response.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                showError(err.response?.data?.message || 'Gagal mereset password. Pastikan tautan masih berlaku.');
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
                    <h2 className="text-2xl font-bold text-[#052B35]">Reset Password</h2>
                    <p className="text-gray-500 text-xs mt-1">Masukkan password baru untuk akun Anda</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
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

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Password Baru</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Minimal 6 karakter"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A3D]/20 focus:border-[#FF7A3D] transition bg-white/90"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium"
                            >
                                {showPassword ? 'Sembunyikan' : 'Lihat'}
                            </button>
                        </div>
                        {errors?.password && <span className="text-xs text-rose-600 mt-1 block">{errors.password}</span>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Konfirmasi Password Baru</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            placeholder="Ulangi password baru"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A3D]/20 focus:border-[#FF7A3D] transition bg-white/90"
                        />
                        {errors?.password_confirmation && (
                            <span className="text-xs text-rose-600 mt-1 block">{errors.password_confirmation}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#052B35] hover:bg-[#083C4A] text-white font-semibold py-3 rounded-xl transition shadow-md shadow-[#052B35]/20 text-sm disabled:opacity-60 cursor-pointer"
                    >
                        {loading ? 'Memproses...' : 'Simpan Password Baru'}
                    </button>

                    <div className="text-center pt-2">
                        <Link to="/login" className="text-xs text-gray-500 hover:text-[#FF7A3D] transition">
                            Kembali ke Halaman Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
