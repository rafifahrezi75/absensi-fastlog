import React from "react";
import { X } from "lucide-react";

const ModalKoreksi = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full mx-4 overflow-hidden">
                <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                    <h3 className="font-bold text-sm">Koreksi Log Absensi</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-4 text-xs">
                    <div>
                        <label className="block font-medium text-slate-700 mb-1">
                            Nama Karyawan
                        </label>
                        <input
                            type="text"
                            className="w-full bg-slate-100 border border-slate-300 rounded px-3 py-2 text-slate-800 font-medium"
                            readOnly
                            value={data?.nama || "Pilih Karyawan..."}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-medium text-slate-700 mb-1">
                                Jam Masuk
                            </label>
                            <input
                                type="time"
                                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                defaultValue={data?.masuk}
                            />
                        </div>
                        <div>
                            <label className="block font-medium text-slate-700 mb-1">
                                Jam Keluar
                            </label>
                            <input
                                type="time"
                                className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                defaultValue={data?.keluar}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-medium text-slate-700 mb-1">
                            Alasan Koreksi Admin
                        </label>
                        <textarea
                            rows="3"
                            className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                            placeholder="Contoh: Lupa scan keluar / Mesin lobi restart"
                        ></textarea>
                    </div>
                </div>
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition"
                    >
                        Simpan Perubahan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalKoreksi;
