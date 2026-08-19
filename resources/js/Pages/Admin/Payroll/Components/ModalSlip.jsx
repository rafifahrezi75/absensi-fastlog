import React from 'react';
import { Printer, X } from 'lucide-react';

const ModalSlip = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null;

    const formatIDR = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center print:bg-white print:fixed print:inset-0 print:z-[9999]">
            {/* CSS khusus untuk mengamankan tampilan saat Cetak/Export PDF */}
            <style>
                {`
                    @media print {
                        /* Sembunyikan header/footer bawaan browser (URL, Tanggal, dll) */
                        @page {
                            size: auto;
                            margin: 10mm;
                        }

                        /* Sembunyikan seluruh isi body aplikasi */
                        body * {
                            visibility: hidden !important;
                        }

                        /* Hanya tampilkan area Modal Slip */
                        #printable-slip, #printable-slip * {
                            visibility: visible !important;
                        }

                        /* Atur posisi modal slip agar pas di tengah kertas saat diprint */
                        #printable-slip {
                            position: absolute !important;
                            left: 0 !important;
                            right: 0 !important;
                            top: 20px !important;
                            margin: 0 auto !important;
                            width: 100% !important;
                            max-width: 450px !important;
                            box-shadow: none !important;
                            border: 1px solid #cbd5e1 !important;
                            border-radius: 12px !important;
                            background: #ffffff !important;
                        }

                        /* Sembunyikan tombol aksi & tombol close */
                        .no-print {
                            display: none !important;
                        }
                    }
                `}
            </style>

            <div id="printable-slip" className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full mx-4 overflow-hidden">
                {/* Header Modal - Hilang saat Print */}
                <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between no-print">
                    <h3 className="font-bold text-sm">Preview Slip Gaji</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Slip - Tercetak Rapi */}
                <div className="p-6 space-y-4 text-xs text-slate-800">
                    {/* Header Perusahaan */}
                    <div className="text-center border-b border-slate-200 pb-4">
                        <h4 className="font-bold text-base text-slate-900 tracking-wide">PT. TECH INDONESIA</h4>
                        <p className="text-slate-500 font-medium">Slip Gaji Periode: {data?.periode || 'Agustus 2026'}</p>
                    </div>

                    {/* Informasi Karyawan */}
                    <div className="space-y-2 py-1">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Nama Karyawan:</span>
                            <strong className="text-slate-900 font-semibold">{data?.nama || '-'}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">NIK:</span>
                            <strong className="text-slate-900 font-mono">{data?.nik || '-'}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Jabatan:</span>
                            <strong className="text-slate-900 font-semibold">{data?.jabatan || '-'}</strong>
                        </div>
                    </div>

                    <hr className="border-slate-200" />

                    {/* Rincian Komponen Gaji */}
                    <div className="space-y-2.5">
                        <div className="flex justify-between items-center text-slate-600">
                            <span>Gaji Pokok:</span>
                            <span className="font-mono font-medium text-slate-800">{formatIDR(data?.gapok)}</span>
                        </div>
                        <div className="flex justify-between items-center text-emerald-600">
                            <span>Lembur & Tunjangan:</span>
                            <span className="font-mono font-medium">+ {formatIDR(data?.bonus)}</span>
                        </div>
                        <div className="flex justify-between items-center text-rose-600">
                            <span>Potongan Absensi:</span>
                            <span className="font-mono font-medium">- {formatIDR(data?.potongan)}</span>
                        </div>
                    </div>

                    {/* Total Take Home Pay */}
                    <div className="p-3.5 bg-slate-100/80 rounded-lg flex justify-between items-center font-bold text-slate-900 text-sm border border-slate-200">
                        <span>Total Netto (THP):</span>
                        <span className="font-mono text-indigo-600 text-base">{formatIDR(data?.thp)}</span>
                    </div>

                    {/* Catatan Footer Slip */}
                    <div className="pt-2 text-[10px] text-slate-400 text-center italic leading-relaxed">
                        *Dokumen ini diterbitkan otomatis oleh sistem payroll FastLog dan sah tanpa tanda tangan basah.
                    </div>
                </div>

                {/* Footer Modal Action Buttons - Hilang saat Print */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 no-print">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                        Tutup
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition flex items-center gap-1.5 shadow-sm"
                    >
                        <Printer className="w-3.5 h-3.5" /> Cetak PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalSlip;