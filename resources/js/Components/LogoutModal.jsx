import React from 'react';
import { LogOut, X } from 'lucide-react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
                            <LogOut className="w-6 h-6" />
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Konfirmasi Logout</h3>
                    <p className="text-slate-500 text-sm">
                        Apakah Anda yakin ingin keluar dari aplikasi? Anda harus login kembali untuk masuk.
                    </p>
                </div>
                <div className="bg-slate-50 p-4 flex gap-3 justify-end border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:ring-4 focus:ring-slate-100 transition-all"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-xl hover:bg-rose-700 shadow-sm shadow-rose-600/20 focus:ring-4 focus:ring-rose-500/30 transition-all"
                    >
                        Ya, Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;
