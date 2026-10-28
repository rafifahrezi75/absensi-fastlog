import React from 'react';
import { Printer, X } from 'lucide-react';

const getLateTiers = (d) => {
    if (d?.late_details?.tiers_breakdown && d.late_details.tiers_breakdown.length > 0) {
        return d.late_details.tiers_breakdown;
    }
    const list = [];
    if (d?.late_details?.tier1_count > 0) {
        const penalized = d.late_details.tier1_penalized || 0;
        list.push({
            tier_order: 1,
            nama_tier: 'Kategori 1 (1 – 30 Menit)',
            ada_toleransi: true,
            total_kejadian: d.late_details.tier1_count,
            toleransi_count: d.late_details.tier1_tolerated || 0,
            penalized_count: penalized,
            nominal_denda: penalized > 0 && d.potongan_terlambat > 0 ? Math.round(d.potongan_terlambat / penalized) : 10000,
            deduction: d.potongan_terlambat || 0,
        });
    }
    if (d?.late_details?.tier2_count > 0) {
        list.push({
            tier_order: 2,
            nama_tier: 'Kategori 2 (31 – 60 Menit)',
            ada_toleransi: false,
            total_kejadian: d.late_details.tier2_count,
            toleransi_count: 0,
            penalized_count: d.late_details.tier2_count,
            nominal_denda: 15000,
            deduction: d.late_details.tier2_count * 15000,
        });
    }
    if (d?.late_details?.tier3_count > 0) {
        list.push({
            tier_order: 3,
            nama_tier: 'Kategori 3 (61 – 90 Menit)',
            ada_toleransi: false,
            total_kejadian: d.late_details.tier3_count,
            toleransi_count: 0,
            penalized_count: d.late_details.tier3_count,
            nominal_denda: 20000,
            deduction: d.late_details.tier3_count * 20000,
        });
    }
    if (d?.late_details?.tier4_count > 0) {
        list.push({
            tier_order: 4,
            nama_tier: 'Kategori 4 (> 90 Menit)',
            ada_toleransi: false,
            total_kejadian: d.late_details.tier4_count,
            toleransi_count: 0,
            penalized_count: d.late_details.tier4_count,
            nominal_denda: 30000,
            deduction: d.late_details.tier4_count * 30000,
        });
    }
    return list;
};

const ModalSlip = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null;

    const formatIDR = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    const handlePrint = () => {
        window.print();
    };

    const lateTiers = getLateTiers(data);

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
                        <div className="flex items-center justify-center mb-1.5">
                            <img src="/images/front-end/logo2.png" alt="FastLog" className="h-10 w-auto object-contain" />
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
                            <span className="text-slate-400 block">ID Karyawan:</span>
                            <strong className="text-slate-900 font-mono">{data?.idFinger || data?.pin || data?.employee_id || data?.id || '-'}</strong>
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
                                <span className="font-mono font-medium">{formatIDR(data?.gapok ?? data?.gaji_pokok)}</span>
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
                        <div className="p-3 space-y-2.5">
                            {data?.is_exempt ? (
                                <>
                                    <div className="flex justify-between items-center text-slate-600 text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <span>Denda Keterlambatan:</span>
                                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">Bebas Sanksi (Khusus)</span>
                                        </div>
                                        <span className="font-mono font-medium text-emerald-600">Rp 0</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-600 text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <span>Potongan Alpa:</span>
                                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">Bebas Potongan (Khusus)</span>
                                        </div>
                                        <span className="font-mono font-medium text-emerald-600">Rp 0</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center text-rose-600 text-xs">
                                            <span>
                                                Denda Keterlambatan{data?.terlambat > 0 ? ` (${data.terlambat} Menit)` : ''}
                                                {data?.late_category ? ` - ${data.late_category}` : ''}:
                                            </span>
                                            <span className="font-mono font-medium">
                                                {data?.potongan_terlambat > 0 ? `- ${formatIDR(data?.potongan_terlambat)}` : <span className="text-emerald-600">Rp 0</span>}
                                            </span>
                                        </div>
                                        {lateTiers.length > 0 && (
                                            <div className="pl-2.5 border-l-2 border-amber-300 space-y-1 my-1 text-[11px]">
                                                {lateTiers.map((tier, idx) => (
                                                    <div key={idx} className="space-y-0.5">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-slate-700 font-medium">
                                                                Kategori {tier.tier_order} ({tier.total_kejadian}x kejadian):
                                                            </span>
                                                            <span className="font-medium font-mono text-rose-600">
                                                                {tier.deduction > 0 ? `- ${formatIDR(tier.deduction)}` : (tier.penalized_count === 0 ? <span className="text-emerald-600 font-sans">Bebas Denda</span> : `- ${formatIDR(tier.nominal_denda * tier.penalized_count)}`)}
                                                            </span>
                                                        </div>
                                                        {tier.ada_toleransi ? (
                                                            <div className="text-[10px] text-slate-500 pl-2 space-y-0.5">
                                                                {tier.toleransi_count > 0 && (
                                                                    <div>Toleransi terpakai: <span className="text-emerald-600 font-medium">{tier.toleransi_count}x (Bebas Denda)</span></div>
                                                                )}
                                                                {tier.penalized_count > 0 ? (
                                                                    <div>Denda kejadian: <span className="text-amber-800 font-medium">{tier.penalized_count}x (@ {formatIDR(tier.nominal_denda)})</span></div>
                                                                ) : (
                                                                    <div className="text-emerald-600">Semua kejadian masih dalam batas toleransi</div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="text-[10px] text-slate-500 pl-2">
                                                                Denda per kejadian: <span className="text-amber-800 font-medium">{tier.penalized_count}x (@ {formatIDR(tier.nominal_denda)})</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center text-rose-600 text-xs">
                                        <span>Potongan Alpa{data?.alpa > 0 ? ` (${data.alpa} Hari)` : ''}:</span>
                                        <span className="font-mono font-medium">
                                            {data?.potongan_alpa > 0 ? `- ${formatIDR(data?.potongan_alpa)}` : <span className="text-emerald-600">Rp 0</span>}
                                        </span>
                                    </div>
                                </>
                            )}
                            {data?.bpjs_details?.length > 0 ? (
                                <div className="space-y-1 pt-1 border-t border-slate-100">
                                    <div className="text-[11px] font-semibold text-slate-500">Potongan BPJS:</div>
                                    {data.bpjs_details.map((bpjs, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-rose-600 text-xs pl-2">
                                            <span>{bpjs.nama}{bpjs.persen ? ` (${bpjs.persen}%)` : ''}:</span>
                                            <span className="font-mono font-medium">- {formatIDR(bpjs.nominal)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : data?.potongan_lainnya > 0 ? (
                                <div className="flex justify-between items-center text-rose-600 text-xs">
                                    <span>Potongan BPJS & Komponen:</span>
                                    <span className="font-mono font-medium">- {formatIDR(data?.potongan_lainnya)}</span>
                                </div>
                            ) : null}
                            <div className="flex justify-between items-center font-semibold text-rose-700 border-t border-slate-200 pt-2 text-xs">
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