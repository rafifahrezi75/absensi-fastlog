import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const currentYear = new Date().getFullYear();

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Implement login logic here
        console.log('Login submitted');
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row font-sans antialiased bg-gray-50">
            {/* Panel Kiri: Branding */}
            <div className="relative lg:w-1/2 min-h-[380px] lg:min-h-screen flex flex-col justify-between p-8 md:p-12 overflow-hidden">
                <div className="absolute inset-0">
                    <img 
                        src="/images/front-end/fastlog2.jpg" 
                        alt="Fastlog Era Mandiri" 
                        className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#052B35]/80 via-[#052B35]/85 to-[#052B35]/95"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#052B35]/40 to-transparent"></div>
                </div>

                {/* Dekorasi blur */}
                <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#FF7A3D]/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FF7A3D]/10 rounded-full blur-3xl"></div>

                {/* Logo */}
                <div className="relative flex items-center gap-3">
                    <img 
                        src="/images/front-end/logo2.png" 
                        alt="Fastlog Era Mandiri" 
                        className="h-11 w-auto object-contain" 
                    />
                </div>

                {/* Middle Content */}
                <div className="relative">
                    <span className="inline-block text-[#FF7A3D] text-xs font-semibold tracking-widest bg-[#FF7A3D]/10 border border-[#FF7A3D]/20 px-3 py-1.5 rounded-full mb-5">
                        FASTLOG ERA MANDIRI
                    </span>
                    <h1 className="text-white text-3xl md:text-[2.5rem] font-bold leading-[1.15] mb-4">
                        Sistem Absensi<br />Digital Karyawan
                    </h1>
                    <p className="text-white/60 text-sm md:text-base mb-8 max-w-md leading-relaxed">
                        Kelola kehadiran karyawan dengan mudah, akurat, dan real-time.
                    </p>

                    <div className="grid grid-cols-3 gap-3 max-w-md">
                        <div className="bg-white/[0.07] backdrop-blur-sm border border-white/10 rounded-xl px-3 py-4 text-center">
                            <p className="text-[#FF7A3D] text-lg md:text-xl font-bold whitespace-nowrap">50+</p>
                            <p className="text-white/50 text-[11px] mt-1">Karyawan</p>
                        </div>
                        <div className="bg-white/[0.07] backdrop-blur-sm border border-white/10 rounded-xl px-3 py-4 text-center">
                            <p className="text-[#FF7A3D] text-lg md:text-xl font-bold whitespace-nowrap">100%</p>
                            <p className="text-white/50 text-[11px] mt-1">Digital</p>
                        </div>
                        <div className="bg-white/[0.07] backdrop-blur-sm border border-white/10 rounded-xl px-3 py-4 text-center">
                            <p className="text-[#FF7A3D] text-lg md:text-xl font-bold whitespace-nowrap">Real-time</p>
                            <p className="text-white/50 text-[11px] mt-1">Monitoring</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="relative text-white/30 text-xs">
                    © {currentYear} PT Fastlog Era Mandiri — Fast & Trusted Logistic Partner
                </p>
            </div>

            {/* Panel Kanan: Form Login */}
            <div className="relative lg:w-1/2 flex items-center justify-center p-6 md:p-12 overflow-hidden bg-gradient-to-br from-orange-50 via-white to-slate-50">

                {/* soft */}
                <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] bg-[#FF7A3D]/25 rounded-full blur-[100px]"></div>
                <div className="absolute -bottom-40 -left-32 w-[28rem] h-[28rem] bg-[#052B35]/15 rounded-full blur-[100px]"></div>
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#FF7A3D]/10 rounded-full blur-[80px]"></div>

                <div className="relative w-full max-w-md">
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl shadow-[#052B35]/10 border border-white/50 p-8 md:p-10">
                        <div className="w-12 h-12 rounded-xl bg-[#052B35] flex items-center justify-center mb-6 shadow-lg shadow-[#052B35]/20">
                            <svg className="w-6 h-6 text-[#FF7A3D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                        </div>

                        <h2 className="text-2xl font-bold text-[#052B35] mb-1.5">Selamat Datang</h2>
                        <p className="text-gray-400 text-sm mb-8">Masuk ke akun Anda untuk mulai absensi</p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                <div className="relative">
                                    <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                    </svg>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        placeholder="email@fastlogem.co.id" 
                                        required
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A3D]/20 focus:border-[#FF7A3D] transition bg-white/80"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                    <input 
                                        type={showPassword ? 'text' : 'password'} 
                                        name="password" 
                                        placeholder="••••••••" 
                                        required
                                        className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A3D]/20 focus:border-[#FF7A3D] transition bg-white/80"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)} 
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {!showPassword ? (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                                    <input type="checkbox" className="rounded border-gray-300 text-[#FF7A3D] focus:ring-[#FF7A3D]/20" />
                                    Ingat saya
                                </label>
                                <a href="#" className="text-sm text-[#FF7A3D] font-medium hover:underline">Lupa password?</a>
                            </div>

                            <button type="submit" className="w-full bg-[#052B35] hover:bg-[#083C4A] text-white font-semibold py-3.5 rounded-xl transition shadow-lg shadow-[#052B35]/20 text-sm">
                                Masuk
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-xs text-gray-400 mt-6">
                        © {currentYear} PT Fastlog Era Mandiri · Sistem Absensi Karyawan
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
