import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Download, Printer, ExternalLink, FileText, CheckCircle,
    Clock, Wallet, Calendar, Building2, User, RefreshCw, AlertCircle, Eye
} from 'lucide-react';
import api from '../../../lib/api';

const getLateTiers = (input, fallbackPotongan = 0) => {
    const details = input?.tiers_breakdown || input?.tier1_count !== undefined ? input : (input?.late_details || input?.lateDetails || input);
    const deductionVal = input?.potongan_terlambat !== undefined ? input.potongan_terlambat : fallbackPotongan;
    if (details?.tiers_breakdown && details.tiers_breakdown.length > 0) {
        return details.tiers_breakdown;
    }
    const list = [];
    if (details?.tier1_count > 0) {
        const penalized = details.tier1_penalized || 0;
        list.push({
            tier_order: 1,
            nama_tier: 'Kategori 1 (1 – 30 Menit)',
            ada_toleransi: true,
            total_kejadian: details.tier1_count,
            toleransi_count: details.tier1_tolerated || 0,
            penalized_count: penalized,
            nominal_denda: penalized > 0 && deductionVal > 0 ? Math.round(deductionVal / penalized) : 10000,
            deduction: deductionVal || 0,
        });
    }
    if (details?.tier2_count > 0) {
        list.push({
            tier_order: 2,
            nama_tier: 'Kategori 2 (31 – 60 Menit)',
            ada_toleransi: false,
            total_kejadian: details.tier2_count,
            toleransi_count: 0,
            penalized_count: details.tier2_count,
            nominal_denda: 15000,
            deduction: details.tier2_count * 15000,
        });
    }
    if (details?.tier3_count > 0) {
        list.push({
            tier_order: 3,
            nama_tier: 'Kategori 3 (61 – 90 Menit)',
            ada_toleransi: false,
            total_kejadian: details.tier3_count,
            toleransi_count: 0,
            penalized_count: details.tier3_count,
            nominal_denda: 20000,
            deduction: details.tier3_count * 20000,
        });
    }
    if (details?.tier4_count > 0) {
        list.push({
            tier_order: 4,
            nama_tier: 'Kategori 4 (> 90 Menit)',
            ada_toleransi: false,
            total_kejadian: details.tier4_count,
            toleransi_count: 0,
            penalized_count: details.tier4_count,
            nominal_denda: 30000,
            deduction: details.tier4_count * 30000,
        });
    }
    return list;
};

const PayrollDetail = ({ isAdmin = true }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [detailData, setDetailData] = useState(null);
    const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
    const [activeTab, setActiveTab] = useState('pdf');
    const iframeRef = useRef(null);

    const backUrl = isAdmin ? '/admin/payroll' : '/user/slip-gaji';
    const detailApiUrl = isAdmin ? `/api/admin/payroll/${id}/detail` : `/api/user/payroll/${id}/detail`;
    const pdfStreamUrl = isAdmin ? `/api/admin/payroll/${id}/pdf` : `/api/user/payroll/${id}/pdf`;
    const pdfDownloadUrl = isAdmin ? `/api/admin/payroll/${id}/download` : `/api/user/payroll/${id}/download`;

    const formatIDR = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    const fetchDetail = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(detailApiUrl);
            setDetailData(res.data);
        } catch (err) {
            console.error('Failed to fetch payroll detail', err);
            setError('Gagal memuat rincian slip gaji.');
        } finally {
            setLoading(false);
        }
    }, [detailApiUrl]);

    const fetchPdfBlob = useCallback(async () => {
        try {
            const res = await api.get(pdfStreamUrl, { responseType: 'blob' });
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setPdfBlobUrl(url);
        } catch (err) {
            console.error('Failed to fetch PDF blob', err);
        }
    }, [pdfStreamUrl]);

    useEffect(() => {
        if (id) {
            fetchDetail();
            fetchPdfBlob();
        }
        return () => {
            if (pdfBlobUrl) {
                URL.revokeObjectURL(pdfBlobUrl);
            }
        };
    }, [id, fetchDetail, fetchPdfBlob]);

    const handlePrint = () => {
        if (iframeRef.current) {
            iframeRef.current.contentWindow?.print();
        } else if (pdfBlobUrl) {
            window.open(pdfBlobUrl, '_blank');
        }
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = pdfDownloadUrl;
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleOpenNewTab = () => {
        if (pdfBlobUrl) {
            window.open(pdfBlobUrl, '_blank');
        } else {
            window.open(pdfStreamUrl, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="min-h-[500px] flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-sm font-medium text-slate-600">Menyiapkan pratinjau slip gaji via dompdf...</p>
            </div>
        );
    }

    if (error || !detailData) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                    <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 text-base">{error || 'Data tidak ditemukan'}</h3>
                    <p className="text-xs text-slate-500 mt-1">Slip gaji yang Anda minta mungkin telah dihapus atau tidak tersedia.</p>
                </div>
                <button
                    onClick={() => navigate(backUrl)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition"
                >
                    Kembali ke Daftar
                </button>
            </div>
        );
    }

    const { payroll, employee, periodeLabel, deptLabel, bpjsDetails, tunjanganDetails, lateDetails, lateCategory, isExempt } = detailData;
    const exemptUser = isExempt ?? employee?.is_exempt ?? false;
    const lateTiers = getLateTiers(lateDetails, payroll?.potongan_terlambat || 0);

    return (
        <div className="space-y-6 pb-16 overflow-y-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate(backUrl)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition inline-flex items-center gap-1.5 text-xs font-medium"
                            title="Kembali"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Kembali</span>
                        </button>
                        <span className="text-slate-300">/</span>
                        <span className="text-xs text-slate-500 font-medium">Detail Slip Gaji</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-xs font-bold text-slate-800">{employee?.nama || 'Karyawan'}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                            Slip Gaji Periode: {periodeLabel || payroll.periode}
                        </h1>
                        {payroll.status === 'paid' ? (
                            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Paid / Lunas
                            </span>
                        ) : (
                            <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-200 inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Draft
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                        <span className="inline-flex items-center gap-1"><User className="w-3.5 h-3.5 text-slate-400" /> {employee?.nama} ({employee?.pin ? `ID: ${employee.pin}` : (employee?.id ? `ID: ${employee.id}` : '-')})</span>
                        <span className="inline-flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-slate-400" /> {deptLabel} • {employee?.jabatan || 'Staff'}</span>
                        <span className="inline-flex items-center gap-1"><Wallet className="w-3.5 h-3.5 text-slate-400" /> Golongan: {employee?.salary_grade?.nama || 'Standard'}</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                    <button
                        onClick={handleOpenNewTab}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 border border-slate-300 shadow-sm"
                        title="Buka PDF di Tab Baru"
                    >
                        <ExternalLink className="w-3.5 h-3.5" /> Buka Tab Baru
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 border border-slate-300 shadow-sm"
                        title="Cetak Slip Gaji"
                    >
                        <Printer className="w-3.5 h-3.5" /> Cetak
                    </button>
                    <button
                        onClick={handleDownload}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 shadow-sm"
                        title="Unduh Berkas PDF"
                    >
                        <Download className="w-3.5 h-3.5" /> Unduh PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-[11px] font-medium text-slate-500 block">Gaji Pokok</span>
                    <span className="text-base sm:text-lg font-bold font-mono text-slate-900 mt-1 block">
                        {formatIDR(payroll.gaji_pokok)}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{payroll.hadir_hari || 0} Hari Hadir</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-[11px] font-medium text-slate-500 block">Total Tambahan / Bonus</span>
                    <span className="text-base sm:text-lg font-bold font-mono text-emerald-600 mt-1 block">
                        + {formatIDR(payroll.bonus)}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Tunjangan & Lembur ({payroll.lembur_menit || 0}m)</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-[11px] font-medium text-slate-500 block">Total Potongan</span>
                    <span className="text-base sm:text-lg font-bold font-mono text-rose-600 mt-1 block">
                        - {formatIDR(payroll.total_potongan)}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Alpa ({payroll.alpa_hari || 0}h), Telat ({payroll.terlambat_menit || 0}m)</span>
                </div>

                <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-200 shadow-sm">
                    <span className="text-[11px] font-semibold text-indigo-900 block">Take Home Pay (THP)</span>
                    <span className="text-base sm:text-lg font-bold font-mono text-indigo-700 mt-1 block">
                        {formatIDR(payroll.thp)}
                    </span>
                    <span className="text-[10px] text-indigo-500 font-medium mt-0.5 block">Total Bersih Diterima</span>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveTab('pdf')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 ${
                                activeTab === 'pdf'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            <FileText className="w-3.5 h-3.5" /> Pratinjau Dokumen PDF
                        </button>
                        <button
                            onClick={() => setActiveTab('breakdown')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 ${
                                activeTab === 'breakdown'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            <Eye className="w-3.5 h-3.5" /> Rincian Komponen
                        </button>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                        <span>Dompdf Engine Ready</span>
                    </div>
                </div>

                <div className="p-4 sm:p-6 bg-slate-100/60 overflow-y-auto">
                    {activeTab === 'pdf' ? (
                        <div className="w-full flex justify-center">
                            {pdfBlobUrl ? (
                                <iframe
                                    ref={iframeRef}
                                    src={`${pdfBlobUrl}#view=FitH`}
                                    title="Slip Gaji Dompdf Preview"
                                    className="w-full max-w-4xl h-[850px] md:h-[950px] bg-white rounded-xl border border-slate-300 shadow-md"
                                />
                            ) : (
                                <iframe
                                    ref={iframeRef}
                                    src={`${pdfStreamUrl}#view=FitH`}
                                    title="Slip Gaji Dompdf Preview"
                                    className="w-full max-w-4xl h-[850px] md:h-[950px] bg-white rounded-xl border border-slate-300 shadow-md"
                                />
                            )}
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
                                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
                                        Komponen Penerimaan (Earnings)
                                    </h4>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between items-center text-slate-700">
                                            <span>Gaji Pokok:</span>
                                            <span className="font-mono font-medium">{formatIDR(payroll.gaji_pokok)}</span>
                                        </div>
                                        {tunjanganDetails?.map((t, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-emerald-700">
                                                <span>{t.nama}:</span>
                                                <span className="font-mono font-medium">+ {formatIDR(t.nominal)}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between items-center text-emerald-700">
                                            <span>Upah Lembur ({payroll.lembur_menit || 0} Menit):</span>
                                            <span className="font-mono font-medium">+ {formatIDR(payroll.lembur)}</span>
                                        </div>
                                        {payroll.bonus > ((payroll.tunjangan || 0) + (payroll.lembur || 0)) && (
                                            <div className="flex justify-between items-center text-emerald-700">
                                                <span>Insentif Tambahan:</span>
                                                <span className="font-mono font-medium">+ {formatIDR(payroll.bonus - ((payroll.tunjangan || 0) + (payroll.lembur || 0)))}</span>
                                            </div>
                                        )}
                                        <div className="pt-2 border-t border-slate-100 flex justify-between items-center font-bold text-emerald-800">
                                            <span>Total Penerimaan:</span>
                                            <span className="font-mono">
                                                {formatIDR((payroll.gaji_pokok || 0) + (payroll.bonus || 0))}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
                                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
                                        Komponen Potongan (Deductions)
                                    </h4>
                                    <div className="space-y-2.5 text-xs">
                                        {exemptUser ? (
                                            <>
                                                <div className="flex justify-between items-center text-slate-600">
                                                    <div className="flex items-center gap-1.5">
                                                        <span>Denda Keterlambatan:</span>
                                                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">Bebas Sanksi (Khusus)</span>
                                                    </div>
                                                    <span className="font-mono font-medium text-emerald-600">Rp 0</span>
                                                </div>
                                                <div className="flex justify-between items-center text-slate-600">
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
                                                    <div className="flex justify-between items-center text-rose-600">
                                                        <span>
                                                            Denda Keterlambatan{payroll.terlambat_menit > 0 ? ` (${payroll.terlambat_menit} Menit)` : ''}
                                                            {lateCategory ? ` - ${lateCategory}` : ''}:
                                                        </span>
                                                        <span className="font-mono font-medium">
                                                            {payroll.potongan_terlambat > 0 ? `- ${formatIDR(payroll.potongan_terlambat)}` : <span className="text-emerald-600">Rp 0</span>}
                                                        </span>
                                                    </div>
                                                    {lateTiers.length > 0 && (
                                                        <div className="pl-2.5 border-l-2 border-amber-300 space-y-1.5 my-1 text-[11px]">
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
                                                <div className="flex justify-between items-center text-rose-600">
                                                    <span>Potongan Alpa{payroll.alpa_hari > 0 ? ` (${payroll.alpa_hari} Hari)` : ''}:</span>
                                                    <span className="font-mono font-medium">
                                                        {payroll.potongan_alpa > 0 ? `- ${formatIDR(payroll.potongan_alpa)}` : <span className="text-emerald-600">Rp 0</span>}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                        {bpjsDetails?.length > 0 ? (
                                            <div className="space-y-1 pt-1 border-t border-slate-100">
                                                <div className="text-[11px] font-semibold text-slate-500">Potongan BPJS:</div>
                                                {bpjsDetails.map((b, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-rose-600 pl-2">
                                                        <span>{b.nama}{b.persen ? ` (${b.persen}%)` : ''}:</span>
                                                        <span className="font-mono font-medium">- {formatIDR(b.nominal)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : payroll.potongan_lainnya > 0 ? (
                                            <div className="flex justify-between items-center text-rose-600">
                                                <span>Potongan BPJS & Komponen:</span>
                                                <span className="font-mono font-medium">- {formatIDR(payroll.potongan_lainnya)}</span>
                                            </div>
                                        ) : null}
                                        <div className="pt-2 border-t border-slate-100 flex justify-between items-center font-bold text-rose-800">
                                            <span>Total Potongan:</span>
                                            <span className="font-mono">- {formatIDR(payroll.total_potongan)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PayrollDetail;
