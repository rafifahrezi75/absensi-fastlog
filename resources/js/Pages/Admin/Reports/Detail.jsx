import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    ArrowLeft, Calendar, Clock, Download, Printer, FileSpreadsheet,
    User, Building2, CheckCircle2, AlertTriangle, Flame, ShieldCheck,
    FileText, RefreshCw, Filter, ExternalLink, Eye, ChevronDown, Check,
    DollarSign, Award, Layers
} from 'lucide-react';
import api from '../../../lib/api';

const EmployeeReportDetail = () => {
    const { employeeId } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const iframeRef = useRef(null);

    const initialStart = searchParams.get('start_date') || (() => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}-01`;
    })();

    const initialEnd = searchParams.get('end_date') || (() => {
        const d = new Date();
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const lastDay = new Date(y, m, 0).getDate();
        return `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    })();

    const [startDate, setStartDate] = useState(initialStart);
    const [endDate, setEndDate] = useState(initialEnd);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [activeTab, setActiveTab] = useState('breakdown');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reportData, setReportData] = useState(null);

    const formatIDR = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    const loadData = useCallback(async () => {
        if (!employeeId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/api/admin/reports/employee/${employeeId}`, {
                params: {
                    start_date: startDate,
                    end_date: endDate,
                }
            });
            setReportData(res.data);
            setSearchParams({ start_date: startDate, end_date: endDate });
        } catch (err) {
            console.error('Failed to load employee report detail', err);
            setError('Gagal memuat rincian laporan presensi karyawan.');
        } finally {
            setLoading(false);
        }
    }, [employeeId, startDate, endDate, setSearchParams]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSetPeriodThisMonth = () => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const lastDay = new Date(y, d.getMonth() + 1, 0).getDate();
        setStartDate(`${y}-${m}-01`);
        setEndDate(`${y}-${m}-${String(lastDay).padStart(2, '0')}`);
    };

    const handleSetPeriodLastMonth = () => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const lastDay = new Date(y, d.getMonth() + 1, 0).getDate();
        setStartDate(`${y}-${m}-01`);
        setEndDate(`${y}-${m}-${String(lastDay).padStart(2, '0')}`);
    };

    const handleExportExcel = () => {
        if (!reportData) return;
        const emp = reportData.employee || {};
        const sum = reportData.summary || {};
        const late = reportData.late_breakdown || {};
        const ot = reportData.overtime_breakdown || {};
        const recs = reportData.records || [];

        const metaRows = [
            ['LAPORAN DETAIL PRESENSI, KETERLAMBATAN & LEMBUR KARYAWAN'],
            ['PT. FASTLOG INTERNASIONAL'],
            [''],
            ['Nama Karyawan', `"${emp.nama || '-'}"`],
            ['ID / PIN', `"${emp.pin || '-'}"`],
            ['NIK', `"${emp.nik || '-'}"`],
            ['Departemen', `"${emp.dept || 'Umum'}"`],
            ['Jabatan', `"${emp.jabatan || 'Staff'}"`],
            ['Status Aturan', emp.is_exempt ? '"Bebas Denda & Lembur (Khusus)"' : '"Standar Aturan"'],
            ['Periode', `"${startDate} s.d ${endDate}"`],
            [''],
            ['RINGKASAN STATISTIK KEHADIRAN'],
            ['Hadir Tepat Waktu (Hari)', sum.total_tepat_waktu || 0],
            ['Terlambat (Kali)', sum.total_telat_kali || 0],
            ['Total Menit Terlambat', sum.total_telat_menit || 0],
            ['Total Denda Keterlambatan (Rp)', late.total_deduction || 0],
            ['Lembur (Kali / Hari)', sum.total_lembur_kali || 0],
            ['Total Menit Lembur', sum.total_lembur_menit || 0],
            ['Total Estimasi Upah Lembur (Rp)', ot.total_pay || 0],
            ['Izin (Hari)', sum.total_izin || 0],
            ['Sakit (Hari)', sum.total_sakit || 0],
            ['Alpha (Hari)', sum.total_alpha || 0],
            ['Libur (Hari)', sum.total_libur || 0],
            ['Total Hari Kerja Efektif', sum.total_hari_kerja || 0],
            [''],
            ['RINCIAN PRESENSI HARIAN'],
            ['No', 'Tanggal', 'Hari', 'Status', 'Keterangan Status', 'Jam Masuk', 'Jam Pulang', 'Terlambat (Menit)', 'Lembur (Menit)', 'Catatan / Alasan']
        ];

        const dataRows = recs.map((r, idx) => [
            idx + 1,
            `"${r.date}"`,
            `"${r.day_name}"`,
            `"${r.status}"`,
            `"${r.status_label}"`,
            `"${r.first_scan || '-'}"`,
            `"${r.last_scan || '-'}"`,
            r.late_minutes || 0,
            r.overtime_minutes || 0,
            `"${(r.note || '-').replace(/"/g, '""')}"`
        ]);

        const allRows = [...metaRows, ...dataRows];
        const csvContent = 'sep=,\n' + allRows.map((e) => e.join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const cleanName = (emp.nama || 'Karyawan').replace(/[^a-zA-Z0-9_-]/g, '_');
        link.setAttribute('download', `Laporan_Presensi_${cleanName}_${startDate}_sd_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const pdfUrl = `/api/admin/reports/employee/${employeeId}/pdf?start_date=${startDate}&end_date=${endDate}`;
    const pdfDownloadUrl = `/api/admin/reports/employee/${employeeId}/pdf?start_date=${startDate}&end_date=${endDate}&download=1`;

    const handlePrintIframe = () => {
        if (iframeRef.current) {
            iframeRef.current.contentWindow?.print();
        } else {
            window.open(pdfUrl, '_blank');
        }
    };

    const handleOpenNewTab = () => {
        window.open(pdfUrl, '_blank');
    };

    const handleDownloadPDF = () => {
        window.location.href = pdfDownloadUrl;
    };

    const filteredRecords = useMemo(() => {
        if (!reportData?.records) return [];
        if (statusFilter === 'ALL') return reportData.records;
        if (statusFilter === 'H') return reportData.records.filter((r) => r.status === 'H');
        if (statusFilter === 'T') return reportData.records.filter((r) => r.status === 'T');
        if (statusFilter === 'OT') return reportData.records.filter((r) => r.status === 'OT' || r.overtime_minutes > 0);
        if (statusFilter === 'IS') return reportData.records.filter((r) => r.status === 'I' || r.status === 'S');
        if (statusFilter === 'A') return reportData.records.filter((r) => r.status === 'A');
        if (statusFilter === 'L') return reportData.records.filter((r) => r.status === 'L' || r.status === 'LN');
        return reportData.records;
    }, [reportData, statusFilter]);

    const renderBadge = (status) => {
        switch (status) {
            case 'H':
                return <span className="inline-flex items-center justify-center w-6 h-6 rounded-md font-bold bg-slate-100 text-slate-800 border border-slate-300 text-xs shadow-xs">H</span>;
            case 'T':
                return <span className="inline-flex items-center justify-center w-6 h-6 rounded-md font-bold bg-amber-100 text-amber-800 border border-amber-300 text-xs shadow-xs">T</span>;
            case 'OT':
                return <span className="inline-flex items-center justify-center px-1.5 h-6 rounded-md font-bold bg-rose-100 text-rose-700 border border-rose-300 text-[10px] shadow-xs">OT</span>;
            case 'I':
                return <span className="inline-flex items-center justify-center w-6 h-6 rounded-md font-bold bg-blue-100 text-blue-700 border border-blue-200 text-xs shadow-xs">I</span>;
            case 'S':
                return <span className="inline-flex items-center justify-center w-6 h-6 rounded-md font-bold bg-purple-100 text-purple-700 border border-purple-200 text-xs shadow-xs">S</span>;
            case 'A':
                return <span className="inline-flex items-center justify-center w-6 h-6 rounded-md font-bold bg-red-100 text-red-700 border border-red-300 text-xs shadow-xs">A</span>;
            case 'L':
                return <span className="inline-flex items-center justify-center w-6 h-6 rounded-md font-bold bg-slate-200 text-slate-500 border border-slate-300 text-xs shadow-xs">L</span>;
            case 'LN':
                return <span className="inline-flex items-center justify-center px-1.5 h-6 rounded-md font-bold bg-rose-100 text-rose-700 border border-rose-300 text-[10px] shadow-xs">LN</span>;
            default:
                return <span className="inline-flex items-center justify-center w-6 h-6 rounded-md text-slate-400 border border-slate-200 text-xs">-</span>;
        }
    };

    if (loading && !reportData) {
        return (
            <div className="min-h-[450px] flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-sm font-medium text-slate-600">Memuat rincian laporan presensi karyawan...</p>
            </div>
        );
    }

    if (error && !reportData) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 text-center p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-base font-bold text-slate-900">Gagal Memuat Data</h3>
                    <p className="text-sm text-slate-500 max-w-md mt-1">{error}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/admin/reports')}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                        Kembali ke Laporan
                    </button>
                    <button
                        onClick={loadData}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    const { employee, summary, late_breakdown: lateBreakdown, overtime_breakdown: otBreakdown } = reportData || {};

    return (
        <div className="space-y-6 pb-16 overflow-y-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/admin/reports')}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition inline-flex items-center gap-1.5 text-xs font-medium"
                            title="Kembali"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Kembali ke Laporan</span>
                        </button>
                        <span className="text-slate-300">/</span>
                        <span className="text-xs text-slate-500 font-medium">Detail Rekap Presensi</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-xs font-bold text-slate-800">{employee?.nama || 'Karyawan'}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                            Detail Presensi: {employee?.nama}
                        </h1>
                        {employee?.is_exempt ? (
                            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" /> Karyawan Khusus (Bebas Aturan)
                            </span>
                        ) : (
                            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-200 inline-flex items-center gap-1">
                                Standar Aturan
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                        <span className="inline-flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            PIN: {employee?.pin || '-'} {employee?.nik ? `• NIK: ${employee.nik}` : ''}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {employee?.dept || 'Umum'} • {employee?.jabatan || 'Staff'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Kategori Telat: {lateBreakdown?.category_name || 'Umum'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-slate-400" />
                            Kategori Lembur: {otBreakdown?.category_name || 'Umum'}
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition shadow-sm"
                        title="Unduh Rekap Presensi Karyawan ke File Excel"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Export Excel</span>
                    </button>
                    <button
                        onClick={handleOpenNewTab}
                        className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3.5 py-2 rounded-lg text-xs font-semibold transition shadow-sm"
                        title="Buka PDF di Tab Baru"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka Tab Baru</span>
                    </button>
                    <button
                        onClick={handlePrintIframe}
                        className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3.5 py-2 rounded-lg text-xs font-semibold transition shadow-sm"
                        title="Cetak Laporan Presensi"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak</span>
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition shadow-sm"
                        title="Unduh Berkas PDF Laporan"
                    >
                        <Download className="w-4 h-4" />
                        <span>Unduh PDF</span>
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span className="text-xs font-bold text-slate-700">Filter Periode:</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                            <span className="text-xs text-slate-400">s.d</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleSetPeriodThisMonth}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium transition"
                        >
                            Bulan Ini
                        </button>
                        <button
                            type="button"
                            onClick={handleSetPeriodLastMonth}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium transition"
                        >
                            Bulan Lalu
                        </button>
                        <button
                            type="button"
                            onClick={loadData}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 shadow-sm"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                            <span>Terapkan</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveTab('breakdown')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 ${
                                activeTab === 'breakdown'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            <Eye className="w-3.5 h-3.5" /> Rincian Presensi & Analisis
                        </button>
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
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                        <span>Dompdf Engine Ready</span>
                    </div>
                </div>

                {activeTab === 'pdf' ? (
                    <div className="p-4 sm:p-6 bg-slate-100/60 overflow-y-auto">
                        <div className="w-full flex justify-center">
                            <iframe
                                ref={iframeRef}
                                src={`${pdfUrl}#view=FitH`}
                                title="Pratinjau Dokumen Laporan Presensi"
                                className="w-full max-w-4xl h-[850px] md:h-[950px] bg-white rounded-xl border border-slate-300 shadow-md"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="p-4 sm:p-6 space-y-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-500">Hadir Tepat</span>
                                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <div className="text-2xl font-bold text-emerald-600 font-mono">
                                        {summary?.total_tepat_waktu ?? 0}
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Hari Tepat Waktu</p>
                                </div>
                            </div>

                            <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200 shadow-xs flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-500">Terlambat</span>
                                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <div className="text-2xl font-bold text-amber-700 font-mono">
                                        {summary?.total_telat_kali ?? 0}
                                        <span className="text-xs font-normal text-slate-500 ml-1">kali</span>
                                    </div>
                                    <p className="text-[11px] text-amber-800 font-medium mt-0.5">
                                        Total {summary?.total_telat_menit ?? 0} Menit
                                    </p>
                                </div>
                            </div>

                            <div className="bg-rose-50/40 p-4 rounded-xl border border-rose-200 shadow-xs flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-500">Lembur (OT)</span>
                                    <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                                        <Flame className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <div className="text-2xl font-bold text-rose-700 font-mono">
                                        {summary?.total_lembur_kali ?? 0}
                                        <span className="text-xs font-normal text-slate-500 ml-1">kali</span>
                                    </div>
                                    <p className="text-[11px] text-rose-800 font-medium mt-0.5">
                                        {summary?.total_lembur_menit ?? 0} Mnt ({Math.round(((summary?.total_lembur_menit ?? 0) / 60) * 10) / 10} Jam)
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-500">Izin & Sakit</span>
                                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <div className="text-2xl font-bold text-blue-600 font-mono">
                                        {(summary?.total_izin ?? 0) + (summary?.total_sakit ?? 0)}
                                        <span className="text-xs font-normal text-slate-500 ml-1">hari</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        Izin: {summary?.total_izin ?? 0} | Sakit: {summary?.total_sakit ?? 0}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-500">Alpha</span>
                                    <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                                        <AlertTriangle className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <div className="text-2xl font-bold text-red-600 font-mono">
                                        {summary?.total_alpha ?? 0}
                                        <span className="text-xs font-normal text-slate-500 ml-1">hari</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Tanpa Keterangan</p>
                                </div>
                            </div>

                            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-500">Hari Kerja</span>
                                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <div className="text-2xl font-bold text-slate-800 font-mono">
                                        {summary?.total_hari_kerja ?? 0}
                                        <span className="text-xs font-normal text-slate-500 ml-1">hari</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        Total Hadir: {summary?.total_hadir ?? 0} hari
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-4 space-y-3.5">
                                <div className="flex items-center justify-between border-b border-amber-100 pb-2.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                                                Rincian Keterlambatan
                                            </h3>
                                            <p className="text-[11px] text-slate-500">
                                                Aturan: <span className="font-semibold text-slate-700">{lateBreakdown?.category_name || 'Umum'}</span>
                                            </p>
                                        </div>
                                    </div>
                                    {lateBreakdown?.is_exempt ? (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                            Bebas Sanksi
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                            Toleransi: {lateBreakdown?.toleransi_bulanan ?? 3}x / Bulan
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-center py-1 bg-amber-50/50 rounded-lg border border-amber-100">
                                    <div>
                                        <span className="text-[10px] text-slate-500 block">Total Kejadian</span>
                                        <span className="text-sm font-bold font-mono text-slate-800">
                                            {lateBreakdown?.total_late_events ?? summary?.total_telat_kali ?? 0}x
                                        </span>
                                    </div>
                                    <div className="border-x border-amber-200/60">
                                        <span className="text-[10px] text-slate-500 block">Total Menit</span>
                                        <span className="text-sm font-bold font-mono text-amber-700">
                                            {lateBreakdown?.total_late_minutes ?? summary?.total_telat_menit ?? 0} Mnt
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-500 block">Potongan Denda</span>
                                        <span className="text-sm font-bold font-mono text-rose-600">
                                            {lateBreakdown?.is_exempt ? 'Rp 0' : formatIDR(lateBreakdown?.total_deduction || 0)}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                                        Rincian Tier / Kategori Keterlambatan:
                                    </span>
                                    {lateBreakdown?.is_exempt ? (
                                        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <div>
                                                <div className="font-semibold">Karyawan Khusus (Bebas Sanksi Keterlambatan)</div>
                                                <div className="text-[11px] text-emerald-700 mt-0.5">
                                                    Karyawan ini tidak dikenakan sanksi nominal pemotongan denda keterlambatan pada periode ini.
                                                </div>
                                            </div>
                                        </div>
                                    ) : lateBreakdown?.tiers_breakdown && lateBreakdown.tiers_breakdown.length > 0 ? (
                                        <div className="space-y-2 text-xs">
                                            {lateBreakdown.tiers_breakdown.map((t, idx) => (
                                                <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold text-slate-800">
                                                            Kategori {t.tier_order} ({t.nama_tier || `Tier ${t.tier_order}`}):
                                                        </span>
                                                        <span className="font-mono font-bold text-rose-600">
                                                            {t.deduction > 0 ? `- ${formatIDR(t.deduction)}` : (t.penalized_count === 0 ? <span className="text-emerald-600 font-sans font-medium">Bebas Denda</span> : `- ${formatIDR(t.nominal_denda * t.penalized_count)}`)}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-0.5">
                                                        <span>Total Kejadian: <strong className="text-slate-700">{t.total_kejadian}x</strong></span>
                                                        {t.ada_toleransi ? (
                                                            <div className="space-x-2">
                                                                {t.toleransi_count > 0 && (
                                                                    <span>Toleransi: <strong className="text-emerald-700">{t.toleransi_count}x (Bebas)</strong></span>
                                                                )}
                                                                {t.penalized_count > 0 ? (
                                                                    <span>Kena Denda: <strong className="text-amber-800">{t.penalized_count}x (@ {formatIDR(t.nominal_denda)})</strong></span>
                                                                ) : (
                                                                    <span className="text-emerald-700 font-medium">Masih dalam batas toleransi</span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span>Denda per kejadian: <strong className="text-amber-800">{t.penalized_count}x (@ {formatIDR(t.nominal_denda)})</strong></span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span>Tidak ada catatan keterlambatan pada periode ini. Presensi tercatat tepat waktu.</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-rose-200 shadow-sm p-4 space-y-3.5">
                                <div className="flex items-center justify-between border-b border-rose-100 pb-2.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center">
                                            <Flame className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                                                Rincian Lembur (Overtime)
                                            </h3>
                                            <p className="text-[11px] text-slate-500">
                                                Kategori: <span className="font-semibold text-slate-700">{otBreakdown?.category_name || 'Umum'}</span>
                                            </p>
                                        </div>
                                    </div>
                                    {otBreakdown?.is_exempt ? (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                            Bebas Lembur
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                                            {otBreakdown?.total_days || summary?.total_lembur_kali || 0} Hari Lembur
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-center py-1 bg-rose-50/50 rounded-lg border border-rose-100">
                                    <div>
                                        <span className="text-[10px] text-slate-500 block">Total Hari OT</span>
                                        <span className="text-sm font-bold font-mono text-slate-800">
                                            {otBreakdown?.total_days ?? summary?.total_lembur_kali ?? 0} Hari
                                        </span>
                                    </div>
                                    <div className="border-x border-rose-200/60">
                                        <span className="text-[10px] text-slate-500 block">Total Durasi</span>
                                        <span className="text-sm font-bold font-mono text-rose-700">
                                            {otBreakdown?.total_minutes ?? summary?.total_lembur_menit ?? 0} Mnt
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-500 block">Estimasi Upah OT</span>
                                        <span className="text-sm font-bold font-mono text-emerald-600">
                                            {otBreakdown?.is_exempt ? 'Rp 0' : formatIDR(otBreakdown?.total_pay || 0)}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                                        Rincian Tipe & Tarif Lembur:
                                    </span>
                                    {otBreakdown?.is_exempt ? (
                                        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <div>
                                                <div className="font-semibold">Karyawan Khusus (Bebas Aturan Lembur)</div>
                                                <div className="text-[11px] text-emerald-700 mt-0.5">
                                                    Karyawan ini tidak diperhitungkan dalam skema kompensasi lembur reguler.
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 text-xs">
                                            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-slate-800">
                                                        Lembur Hari Kerja (Daily):
                                                    </span>
                                                    <span className="font-mono font-bold text-emerald-600">
                                                        + {formatIDR((otBreakdown?.daily_days || 0) * (otBreakdown?.daily_rate || 50000))}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-[11px] text-slate-500">
                                                    <span>Kejadian Disetujui: <strong className="text-slate-700">{otBreakdown?.daily_days || 0} Hari</strong></span>
                                                    <span>Tarif: <strong className="text-slate-700">@ {formatIDR(otBreakdown?.daily_rate || 50000)} / hari</strong></span>
                                                </div>
                                            </div>

                                            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-slate-800">
                                                        Lembur Akhir Pekan (Weekend):
                                                    </span>
                                                    <span className="font-mono font-bold text-emerald-600">
                                                        + {formatIDR((otBreakdown?.weekend_days || 0) * (otBreakdown?.weekend_rate || 75000))}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-[11px] text-slate-500">
                                                    <span>Kejadian Disetujui: <strong className="text-slate-700">{otBreakdown?.weekend_days || 0} Hari</strong></span>
                                                    <span>Tarif: <strong className="text-slate-700">@ {formatIDR(otBreakdown?.weekend_rate || 75000)} / hari</strong></span>
                                                </div>
                                            </div>

                                            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-slate-800">
                                                        Lembur Hari Libur Nasional (Hari Besar):
                                                    </span>
                                                    <span className="font-mono font-bold text-emerald-600">
                                                        + {formatIDR((otBreakdown?.holiday_days || 0) * (otBreakdown?.holiday_rate || 300000))}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-[11px] text-slate-500">
                                                    <span>Kejadian Disetujui: <strong className="text-slate-700">{otBreakdown?.holiday_days || 0} Hari</strong></span>
                                                    <span>Tarif: <strong className="text-slate-700">@ {formatIDR(otBreakdown?.holiday_rate || 300000)} / hari</strong></span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-slate-500" />
                                    <span className="text-xs font-bold text-slate-800">Filter Baris Presensi:</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                    <button
                                        onClick={() => setStatusFilter('ALL')}
                                        className={`px-3 py-1.5 rounded-lg font-medium transition ${statusFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                                    >
                                        Semua ({reportData?.records?.length || 0})
                                    </button>
                                    <button
                                        onClick={() => setStatusFilter('H')}
                                        className={`px-3 py-1.5 rounded-lg font-medium transition ${statusFilter === 'H' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                                    >
                                        Tepat Waktu ({reportData?.records?.filter((r) => r.status === 'H').length || 0})
                                    </button>
                                    <button
                                        onClick={() => setStatusFilter('T')}
                                        className={`px-3 py-1.5 rounded-lg font-medium transition ${statusFilter === 'T' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'}`}
                                    >
                                        Terlambat ({reportData?.records?.filter((r) => r.status === 'T').length || 0})
                                    </button>
                                    <button
                                        onClick={() => setStatusFilter('OT')}
                                        className={`px-3 py-1.5 rounded-lg font-medium transition ${statusFilter === 'OT' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'}`}
                                    >
                                        Lembur ({reportData?.records?.filter((r) => r.status === 'OT' || r.overtime_minutes > 0).length || 0})
                                    </button>
                                    <button
                                        onClick={() => setStatusFilter('IS')}
                                        className={`px-3 py-1.5 rounded-lg font-medium transition ${statusFilter === 'IS' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                                    >
                                        Izin / Sakit ({reportData?.records?.filter((r) => r.status === 'I' || r.status === 'S').length || 0})
                                    </button>
                                    <button
                                        onClick={() => setStatusFilter('A')}
                                        className={`px-3 py-1.5 rounded-lg font-medium transition ${statusFilter === 'A' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
                                    >
                                        Alpha ({reportData?.records?.filter((r) => r.status === 'A').length || 0})
                                    </button>
                                    <button
                                        onClick={() => setStatusFilter('L')}
                                        className={`px-3 py-1.5 rounded-lg font-medium transition ${statusFilter === 'L' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                    >
                                        Libur ({reportData?.records?.filter((r) => r.status === 'L' || r.status === 'LN').length || 0})
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-900 text-white font-semibold">
                                            <th className="px-3.5 py-3 w-12 text-center rounded-tl-lg">No</th>
                                            <th className="px-3.5 py-3 w-36">Tanggal & Hari</th>
                                            <th className="px-3.5 py-3 w-20 text-center">Status</th>
                                            <th className="px-3.5 py-3 w-28 text-center">Scan Masuk</th>
                                            <th className="px-3.5 py-3 w-28 text-center">Scan Pulang</th>
                                            <th className="px-3.5 py-3 w-32 text-center">Keterlambatan</th>
                                            <th className="px-3.5 py-3 w-36 text-center">Lembur (OT)</th>
                                            <th className="px-3.5 py-3 rounded-tr-lg">Keterangan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {filteredRecords.length > 0 ? (
                                            filteredRecords.map((r, idx) => (
                                                <tr key={r.date} className="hover:bg-slate-50 transition">
                                                    <td className="px-3.5 py-3 text-center text-slate-400 font-mono">
                                                        {idx + 1}
                                                    </td>
                                                    <td className="px-3.5 py-3">
                                                        <div className="font-bold text-slate-900">
                                                            {new Date(r.date + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 font-medium">{r.day_name}</div>
                                                    </td>
                                                    <td className="px-3.5 py-3 text-center">
                                                        <div className="flex flex-col items-center gap-1">
                                                            {renderBadge(r.status)}
                                                            <span className="text-[10px] text-slate-500">{r.status_label}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3.5 py-3 text-center font-mono font-medium text-slate-700">
                                                        {r.first_scan ? (
                                                            <span className="bg-slate-100 px-2 py-1 rounded text-slate-800 border border-slate-200">
                                                                {r.first_scan}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3.5 py-3 text-center font-mono font-medium text-slate-700">
                                                        {r.last_scan ? (
                                                            <span className="bg-slate-100 px-2 py-1 rounded text-slate-800 border border-slate-200">
                                                                {r.last_scan}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3.5 py-3 text-center font-mono">
                                                        {r.late_minutes > 0 ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-semibold text-amber-800 bg-amber-50 border border-amber-200 text-xs">
                                                                +{r.late_minutes} Mnt
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3.5 py-3 text-center font-mono">
                                                        {r.overtime_minutes > 0 ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-semibold text-rose-800 bg-rose-50 border border-rose-200 text-xs">
                                                                +{r.overtime_minutes} Mnt ({Math.round((r.overtime_minutes / 60) * 10) / 10} Jam)
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3.5 py-3 text-slate-700">
                                                        <div className="text-xs font-medium">{r.note || '-'}</div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="px-4 py-12 text-center text-slate-400 text-xs">
                                                    Tidak ada catatan presensi untuk filter status yang dipilih.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeReportDetail;
