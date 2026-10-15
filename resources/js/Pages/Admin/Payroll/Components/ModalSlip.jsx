import React from 'react';
import { Printer, X, Fingerprint } from 'lucide-react';

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
            <style>
                {`
                    @media print {
                        @page {
                            size: auto;
                            margin: 10mm;
                        }

                        body * {
                            visibility: hidden !important;
                        }

                        #printable-slip, #printable-slip * {
                            visibility: visible !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }

                        #printable-slip {
                            position: absolute !important;
                            left: 0 !important;
                            right: 0 !important;
                            top: 20px !important;
                            margin: 0 auto !important;
                            width: 100% !important;
                            max-width: 480px !important;
                            box-shadow: none !important;
                            border: 1px solid #cbd5e1 !important;
                            border-radius: 12px !important;
                            background: #ffffff !important;
                        }

                        .no-print {
                            display: none !important;
                        }
                    }
                `}
            </style>

            <div id="printable-slip" className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full mx-4 overflow-hidden">
                <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between no-print">
                    <h3 className="font-bold text-sm">Preview Slip Gaji</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4 text-xs text-slate-800">
                    <div className="text-center border-b border-slate-200 pb-4">
                        <div className="flex items-center justify-center gap-2 mb-1.5">
                            <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-sm flex items-center justify-center">
                                <Fingerprint className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-lg text-indigo-900 tracking-tight">Fast<span className="text-indigo-600">Log</span></span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 tracking-wide uppercase">
                            PT. FASTLOG ERA MANDIRI
                        </h4>
                        <p className="text-slate-500 font-medium text-[11px] mt-0.5">
                            Slip Gaji Periode: {data?.periode || '-'}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 py-1 text-[11px]">
                        <div>
                            <span className="text-slate-400 block">Nama Karyawan:</span>
                            <strong className="text-slate-900 font-semibold">{data?.nama || '-'}</strong>
                        </div>
                        <div>
                            <span className="text-slate-400 block">NIK:</span>
                            <strong className="text-slate-900 font-mono">{data?.nik || '-'}</strong>
                        </div>
                        <div>
                            <span className="text-slate-400 block">Jabatan / Golongan:</span>
                            <strong className="text-slate-900 font-semibold">{data?.jabatan || '-'} ({data?.golongan || 'Staff'})</strong>
                        </div>
                        <div>
                            <span className="text-slate-400 block">Departemen:</span>
                            <strong className="text-slate-900 font-semibold">{data?.deptLabel || data?.dept || '-'}</strong>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 grid grid-cols-3 text-center text-[10px]">
                        <div>
                            <span className="text-slate-400 block">Hadir</span>
                            <span className="font-bold text-slate-800 text-xs">{data?.hadir || 0} Hari</span>
                        </div>
                        <div>
                            <span className="text-slate-400 block">Terlambat</span>
                            <span className="font-bold text-rose-600 text-xs">{data?.terlambat || 0} Menit</span>
                        </div>
                        <div>
                            <span className="text-slate-400 block">Alpa</span>
                            <span className="font-bold text-rose-600 text-xs">{data?.alpa || 0} Hari</span>
                        </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <div className="bg-slate-50 px-3 py-2 font-semibold text-slate-700 text-[11px] border-b border-slate-200 flex justify-between">
                            <span>Komponen Penerimaan</span>
                            <span>Nominal</span>
                        </div>
                        <div className="p-3 space-y-2">
                            <div className="flex justify-between items-center text-slate-700">
                                <span>Gaji Pokok:</span>
                                <span className="font-mono font-medium">{formatIDR(data?.gapok)}</span>
                            </div>
                            {data?.tunjangan_details?.length > 0 ? (
                                data.tunjangan_details.map((t, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-emerald-700">
                                        <span>{t.nama}:</span>
                                        <span className="font-mono font-medium">+ {formatIDR(t.nominal)}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="flex justify-between items-center text-emerald-700">
                                    <span>Tunjangan:</span>
                                    <span className="font-mono font-medium">+ {formatIDR(data?.tunjangan)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-emerald-700">
                                <span>Upah Lembur ({data?.lembur_menit || 0} Menit):</span>
                                <span className="font-mono font-medium">+ {formatIDR(data?.lembur)}</span>
                            </div>
                            {data?.bonus > (data?.tunjangan + data?.lembur) && (
                                <div className="flex justify-between items-center text-emerald-700">
                                    <span>Insentif Tambahan:</span>
                                    <span className="font-mono font-medium">+ {formatIDR(data?.bonus - (data?.tunjangan + data?.lembur))}</span>
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-50 px-3 py-2 font-semibold text-slate-700 text-[11px] border-t border-b border-slate-200 flex justify-between">
                            <span>Komponen Potongan</span>
                            <span>Nominal</span>
                        </div>
                        <div className="p-3 space-y-2">
                            <div className="flex justify-between items-center text-rose-600">
                                <span>Denda Keterlambatan{data?.terlambat > 0 ? ` (${data.terlambat} Menit)` : ''}:</span>
                                <span className="font-mono font-medium">- {formatIDR(data?.potongan_terlambat)}</span>
                            </div>
                            <div className="flex justify-between items-center text-rose-600">
                                <span>Potongan Alpa{data?.alpa > 0 ? ` (${data.alpa} Hari)` : ''}:</span>
                                <span className="font-mono font-medium">- {formatIDR(data?.potongan_alpa)}</span>
                            </div>
                            {data?.bpjs_details?.length > 0 ? (
                                data.bpjs_details.map((bpjs, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-rose-600">
                                        <span>{bpjs.nama}{bpjs.persen ? ` (${bpjs.persen}%)` : ''}:</span>
                                        <span className="font-mono font-medium">- {formatIDR(bpjs.nominal)}</span>
                                    </div>
                                ))
                            ) : data?.potongan_lainnya > 0 ? (
                                <div className="flex justify-between items-center text-rose-600">
                                    <span>Potongan BPJS & Komponen:</span>
                                    <span className="font-mono font-medium">- {formatIDR(data?.potongan_lainnya)}</span>
                                </div>
                            ) : null}
                            <div className="flex justify-between items-center font-semibold text-rose-700 border-t border-slate-100 pt-1.5">
                                <span>Total Potongan:</span>
                                <span className="font-mono">- {formatIDR(data?.potongan)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-3.5 bg-indigo-50/70 rounded-lg flex justify-between items-center font-bold text-slate-900 text-sm border border-indigo-200">
                        <span>Total Bersih Diterima (THP):</span>
                        <span className="font-mono text-indigo-700 text-base">{formatIDR(data?.thp)}</span>
                    </div>

                    <div className="pt-2 text-[10px] text-slate-400 text-center italic leading-relaxed">
                        *Dokumen ini diterbitkan otomatis oleh sistem payroll PT. FastLog Era Mandiri dan sah tanpa tanda tangan basah.
                    </div>
                </div>

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