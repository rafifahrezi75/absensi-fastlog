import React, { useRef, useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download, ExternalLink, User } from 'lucide-react';
import api from '../../../lib/api';

const EmployeePreview = () => {
    const { employeeId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const iframeRef = useRef(null);

    const startDate = searchParams.get('start_date') || '';
    const endDate = searchParams.get('end_date') || '';

    const [employee, setEmployee] = useState(null);

    useEffect(() => {
        let isMounted = true;
        if (!employeeId) return;

        api.get(`/api/admin/reports/employee/${employeeId}`, {
            params: {
                start_date: startDate || undefined,
                end_date: endDate || undefined,
            }
        })
            .then((res) => {
                if (isMounted && res.data?.employee) {
                    setEmployee(res.data.employee);
                }
            })
            .catch(() => {});

        return () => {
            isMounted = false;
        };
    }, [employeeId, startDate, endDate]);

    const pdfUrl = `/api/admin/reports/employee/${employeeId}/pdf?start_date=${startDate}&end_date=${endDate}`;
    const pdfDownloadUrl = `${pdfUrl}&download=1`;

    const handleBack = () => {
        const params = new URLSearchParams();
        if (startDate) params.set('start_date', startDate);
        if (endDate) params.set('end_date', endDate);
        navigate(`/admin/reports/${employeeId}?${params.toString()}`);
    };

    const handlePrint = () => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.print();
        } else {
            window.open(pdfUrl, '_blank');
        }
    };

    const handleOpenNewTab = () => {
        window.open(pdfUrl, '_blank');
    };

    const handleDownload = () => {
        window.location.href = pdfDownloadUrl;
    };

    const employeeIdentifier = employee?.pin ? `ID: ${employee.pin}` : (employee?.id ? `ID: ${employee.id}` : '');

    return (
        <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleBack}
                        className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition"
                        title="Kembali ke Detail Karyawan"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-indigo-600" />
                            <h1 className="text-base sm:text-lg font-bold text-slate-900">
                                Pratinjau &amp; Cetak Laporan Presensi {employee?.nama ? `• ${employee.nama}` : ''}
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {employeeIdentifier ? `${employeeIdentifier} • ` : ''}Periode: {startDate || '-'} s.d {endDate || '-'} {employee?.dept ? `• Departemen: ${employee.dept}` : ''}
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
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 shadow-sm"
                        title="Unduh Berkas PDF"
                    >
                        <Download className="w-3.5 h-3.5" /> Unduh PDF
                    </button>
                </div>
            </div>

            <div className="bg-slate-100/70 p-2 sm:p-3 rounded-2xl border border-slate-200 shadow-xs flex justify-center">
                <iframe
                    ref={iframeRef}
                    src={`${pdfUrl}#view=FitH`}
                    title="Pratinjau Laporan Presensi Karyawan PDF"
                    className="w-full h-[calc(100vh-210px)] min-h-[550px] bg-white rounded-xl border border-slate-300 shadow-md"
                />
            </div>
        </div>
    );
};

export default EmployeePreview;
