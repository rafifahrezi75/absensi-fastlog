import React, { useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download, ExternalLink, FileText } from 'lucide-react';

const RekapPreview = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const iframeRef = useRef(null);

    const startDate = searchParams.get('start_date') || '';
    const endDate = searchParams.get('end_date') || '';
    const dept = searchParams.get('dept') || '';
    const search = searchParams.get('search') || '';

    const rekapPdfUrl = `/api/admin/reports/pdf?start_date=${startDate}&end_date=${endDate}${dept ? `&dept=${encodeURIComponent(dept)}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
    const rekapPdfDownloadUrl = `${rekapPdfUrl}&download=1`;

    const handleBack = () => {
        const params = new URLSearchParams();
        if (startDate) params.set('start_date', startDate);
        if (endDate) params.set('end_date', endDate);
        if (dept) params.set('dept', dept);
        if (search) params.set('search', search);
        navigate(`/admin/reports?${params.toString()}`);
    };

    const handlePrint = () => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.print();
        } else {
            window.open(rekapPdfUrl, '_blank');
        }
    };

    const handleOpenNewTab = () => {
        window.open(rekapPdfUrl, '_blank');
    };

    const handleDownload = () => {
        window.location.href = rekapPdfDownloadUrl;
    };

    return (
        <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleBack}
                        className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition"
                        title="Kembali ke Rekap Presensi"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-600" />
                            <h1 className="text-base sm:text-lg font-bold text-slate-900">
                                Pratinjau &amp; Cetak Rekap Presensi &amp; Overtime
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Periode: {startDate || '-'} s.d {endDate || '-'} {dept ? `• Departemen: ${dept}` : ''} {search ? `• Pencarian: "${search}"` : ''}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={handleOpenNewTab}
                        className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 border border-slate-300 shadow-xs"
                        title="Buka PDF di Tab Baru"
                    >
                        <ExternalLink className="w-3.5 h-3.5" /> Buka Tab Baru
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 shadow-sm"
                        title="Cetak Dokumen PDF"
                    >
                        <Printer className="w-3.5 h-3.5" /> Cetak
                    </button>
                    <button
                        onClick={handleDownload}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 shadow-sm"
                        title="Unduh Berkas PDF"
                    >
                        <Download className="w-3.5 h-3.5" /> Unduh PDF
                    </button>
                </div>
            </div>

            <div className="bg-slate-100/70 p-2 sm:p-3 rounded-2xl border border-slate-200 shadow-xs flex justify-center">
                <iframe
                    ref={iframeRef}
                    src={`${rekapPdfUrl}#view=FitH`}
                    title="Pratinjau Rekap Presensi PDF"
                    className="w-full h-[calc(100vh-210px)] min-h-[550px] bg-white rounded-xl border border-slate-300 shadow-md"
                />
            </div>
        </div>
    );
};

export default RekapPreview;
