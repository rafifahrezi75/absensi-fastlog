import React from 'react';
import { Printer, X } from 'lucide-react';

const ModalSlip = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full mx-4 overflow-hidden">
                <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                    <h3 className="font-bold text-sm">Preview Slip Gaji</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-4 text-xs">
                    <div className="text-center border-b pb-4">
                        <h4 className="font-bold text-sm text-slate-900">PT. TECH INDONESIA</h4>
                        <p className="text-slate-500">Slip Gaji Periode: Agustus 2026</p>
                    </div>

                    <div className="space-y-1.5 text-slate-700">
                        <div className="flex justify-between"><span>Nama:</span> <strong>{data?.nama}</strong></div>
                        <div className="flex justify-between"><span>NIK:</span> <strong>{data?.nik}</strong></div>
                        <div className="flex justify-between"><span>Jabatan:</span> <strong>{data?.jabatan}</strong></div>
                    </div>

                    <hr />

                    <div className="space-y-2">
                        <div className="flex justify-between text-slate-600"><span>Gaji Pokok:</span> <span className="font-mono">{data?.gapok}</span></div>
                        <div className="flex justify-between text-emerald-600"><span>Lembur & Tunjangan:</span> <span className="font-mono">{data?.bonus}</span></div>
                        <div className="flex justify-between text-rose-600"><span>Potongan Absensi:</span> <span className="font-mono">{data?.potongan}</span></div>
                    </div>

                    <div className="p-3 bg-slate-100 rounded-lg flex justify-between font-bold text-slate-900 text-sm">
                        <span>Total Netto (THP):</span>
                        <span className="font-mono text-indigo-600">{data?.thp}</span>
                    </div>
                </div>
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition">Tutup</button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition flex items-center gap-1.5">
                        <Printer className="w-3.5 h-3.5" /> Cetak PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalSlip;
