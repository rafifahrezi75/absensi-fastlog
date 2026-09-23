import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { FileSpreadsheet, Printer, Search, TableProperties, Loader2 } from 'lucide-react';
import api from '../../../lib/api';

const dayNamesIndo = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const Reports = () => {
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}-01`;
    });
    const [endDate, setEndDate] = useState(() => {
        const d = new Date();
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const lastDay = new Date(y, m, 0).getDate();
        return `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    });
    const [selectedDept, setSelectedDept] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [holidays, setHolidays] = useState({});
    const [loading, setLoading] = useState(true);

    const loadReports = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/admin/reports', {
                params: {
                    start_date: startDate,
                    end_date: endDate,
                    dept: selectedDept || undefined,
                    search: searchQuery || undefined,
                }
            });
            setEmployees(res.data.employees || []);
            if (res.data.departments) {
                setDepartments(res.data.departments);
            }
            if (res.data.holidays) {
                setHolidays(res.data.holidays);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, selectedDept, searchQuery]);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadReports();
        }, 300);
        return () => clearTimeout(timer);
    }, [loadReports]);

    const daysInPeriod = useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = [];

        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return [];

        let current = new Date(start);
        while (current <= end) {
            const y = current.getFullYear();
            const m = String(current.getMonth() + 1).padStart(2, '0');
            const d = String(current.getDate()).padStart(2, '0');
            const fullDate = `${y}-${m}-${d}`;
            const isSun = current.getDay() === 0;
            const isHol = Boolean(holidays && holidays[fullDate]);
            const holName = (holidays && holidays[fullDate]) || '';

            days.push({
                fullDate,
                dayNum: current.getDate(),
                dayName: dayNamesIndo[current.getDay()],
                isSunday: isSun,
                isHoliday: isHol,
                holidayName: holName,
            });
            current.setDate(current.getDate() + 1);
        }
        return days;
    }, [startDate, endDate, holidays]);

    const renderStatusBadge = (status) => {
        switch (status) {
            case 'H':
                return <span className="font-bold text-slate-700">H</span>;
            case 'T':
                return <span className="w-5 h-5 rounded font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center text-[10px] mx-auto">T</span>;
            case 'OT':
                return <span className="w-5 h-5 rounded font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center text-[10px] mx-auto">OT</span>;
            case 'I':
                return <span className="w-5 h-5 rounded font-bold bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center text-[10px] mx-auto">I</span>;
            case 'S':
                return <span className="w-5 h-5 rounded font-bold bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center text-[10px] mx-auto">S</span>;
            case 'L':
                return <span className="w-5 h-5 rounded font-bold bg-slate-200 text-slate-500 border border-slate-300 flex items-center justify-center text-[10px] mx-auto">L</span>;
            case 'LN':
                return <span className="px-1 h-5 rounded font-bold bg-rose-100 text-rose-700 border border-rose-300 flex items-center justify-center text-[9px] mx-auto min-w-[20px]">LN</span>;
            default:
                return <span className="text-slate-300">-</span>;
        }
    };

    const handlePrintPDF = () => {
        const printArea = document.getElementById('table-to-print');
        if (!printArea) return;

        const printWindow = window.open('', '_blank', 'width=1200,height=800');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Laporan Rekap Presensi Karyawan</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        @page {
                            size: A4 landscape;
                            margin: 5mm;
                        }
                        body {
                            font-family: ui-sans-serif, system-ui, sans-serif;
                            padding: 10px;
                            background: white;
                            color: #0f172a;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        table {
                            width: 100% !important;
                            border-collapse: collapse !important;
                            table-layout: auto !important;
                        }
                        th, td {
                            padding: 3px 2px !important;
                            font-size: 8px !important;
                        }
                        .sticky {
                            position: static !important;
                            box-shadow: none !important;
                        }
                    </style>
                </head>
                <body>
                    <div style="text-align: center; margin-bottom: 12px;">
                        <h2 style="font-size: 14px; font-weight: bold; margin: 0; text-transform: uppercase;">Laporan Rekap Presensi & Overtime Karyawan</h2>
                        <p style="font-size: 10px; color: #475569; margin: 2px 0 0 0;">Periode: ${startDate} s.d. ${endDate}</p>
                    </div>
                    ${printArea.outerHTML}
                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                                window.close();
                            }, 300);
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleExportExcel = () => {
        if (employees.length === 0) {
            alert('Tidak ada data untuk diexport');
            return;
        }

        const headers = ['Nama', 'Departemen', ...daysInPeriod.map(d => `${d.dayNum}/${d.dayName}`), 'Hadir (H)', 'Terlambat (T)', 'Lembur (OT)', 'Izin/Sakit (I/S)'];

        const rows = employees.map(emp => {
            let countH = 0, countT = 0, countOT = 0, countIS = 0;

            const dailyStatus = daysInPeriod.map(d => {
                const defaultSt = d.isHoliday ? 'LN' : (d.isSunday ? 'L' : '-');
                const st = (emp.attendance && (emp.attendance[d.fullDate] || emp.attendance[d.dayNum])) || defaultSt;
                if (st === 'H') countH++;
                if (st === 'T') countT++;
                if (st === 'OT') countOT++;
                if (st === 'I' || st === 'S') countIS++;
                return st;
            });

            return [
                `"${emp.nama}"`,
                `"${emp.deptLabel}"`,
                ...dailyStatus,
                countH,
                countT,
                countOT,
                countIS
            ].join(',');
        });

        const csvContent = 'sep=,\n' + [headers.join(','), ...rows].join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Rekap_Presensi_${startDate}_s.d_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Laporan Rekap Presensi & OT</h1>
                    <p className="text-sm text-slate-500">Rekapitulasi kehadiran dan jam lembur (Overtime) karyawan per periode.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
                    >
                        <FileSpreadsheet className="w-4 h-4" /> Export Excel
                    </button>
                    <button
                        onClick={handlePrintPDF}
                        className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
                    >
                        <Printer className="w-4 h-4" /> Cetak PDF
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Mulai</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Selesai</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Departemen</label>
                        <select
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                            <option value="">Semua Departemen</option>
                            {departments.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Cari Karyawan</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Nama Karyawan..."
                                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-700">
                <span className="font-bold text-slate-900 border-r border-slate-200 pr-4">Keterangan Status:</span>
                <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded font-bold bg-slate-100 text-slate-800 border border-slate-300 flex items-center justify-center text-[10px]">H</span>
                    <span>Hadir Tepat Waktu</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center text-[10px]">T</span>
                    <span>Terlambat</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center text-[10px]">OT</span>
                    <span>Overtime (Lembur)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded font-bold bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center text-[10px]">I</span>
                    <span>Izin / Cuti</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded font-bold bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center text-[10px]">S</span>
                    <span>Sakit</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded font-bold bg-slate-200 text-slate-500 border border-slate-300 flex items-center justify-center text-[10px]">L</span>
                    <span>Libur Minggu</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="px-1 h-5 rounded font-bold bg-rose-100 text-rose-700 border border-rose-300 flex items-center justify-center text-[9px] min-w-[20px]">LN</span>
                    <span>Libur Nasional</span>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table id="table-to-print" className="w-full text-xs border-collapse border border-slate-200 text-center">
                        <thead>
                            <tr className="bg-slate-900 text-white font-bold border-b border-slate-800">
                                <th className="px-4 py-2.5 text-left border-r border-slate-800 min-w-[180px] sticky left-0 bg-slate-900 z-[5]" rowSpan="2">
                                    Karyawan
                                </th>
                                <th className="py-2 border-r border-slate-800" colSpan={daysInPeriod.length}>
                                    Periode Presensi Bulanan
                                </th>
                                <th className="px-2 py-2 border-l border-slate-800 text-emerald-300 min-w-[36px]" rowSpan="2" title="Total Hadir">H</th>
                                <th className="px-2 py-2 border-l border-slate-800 text-amber-300 min-w-[36px]" rowSpan="2" title="Total Terlambat">T</th>
                                <th className="px-2 py-2 border-l border-slate-800 text-rose-300 min-w-[36px]" rowSpan="2" title="Total Lembur">OT</th>
                                <th className="px-2 py-2 border-l border-slate-800 text-blue-300 min-w-[36px]" rowSpan="2" title="Total Izin/Sakit">I/S</th>
                            </tr>
                            <tr className="bg-slate-800 text-slate-200 border-b border-slate-700">
                                {daysInPeriod.map((d) => (
                                    <th
                                        key={d.fullDate || d.dayNum}
                                        title={d.holidayName || (d.isSunday ? 'Hari Minggu' : '')}
                                        className={`px-1 py-1.5 border-r border-slate-700 min-w-[30px] ${
                                            d.isSunday || d.isHoliday ? 'bg-rose-950/40 text-rose-300' : ''
                                        }`}
                                    >
                                        <div className="font-bold text-xs">{d.dayNum}</div>
                                        <div className={`text-[9px] font-normal ${d.isSunday || d.isHoliday ? 'text-rose-300' : 'text-slate-400'}`}>
                                            {d.dayName}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={daysInPeriod.length + 5} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                                            <p className="text-sm text-slate-400">Memuat data rekap presensi...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : employees.length > 0 ? (
                                employees.map((emp) => {
                                    let countH = 0, countT = 0, countOT = 0, countIS = 0;

                                    return (
                                        <tr key={emp.id} className="hover:bg-slate-100/60 transition">
                                            <td className="px-4 py-2 text-left font-semibold border-r border-slate-200 sticky left-0 bg-white z-[5] shadow-sm">
                                                <div className="text-slate-900 font-bold leading-tight">{emp.nama}</div>
                                                <div className="text-[10px] font-normal text-slate-400">{emp.deptLabel}</div>
                                            </td>

                                            {daysInPeriod.map((d) => {
                                                const defaultSt = d.isHoliday ? 'LN' : (d.isSunday ? 'L' : '-');
                                                const status = (emp.attendance && (emp.attendance[d.fullDate] || emp.attendance[d.dayNum])) || defaultSt;

                                                if (status === 'H') countH++;
                                                if (status === 'T') countT++;
                                                if (status === 'OT') countOT++;
                                                if (status === 'I' || status === 'S') countIS++;

                                                return (
                                                    <td
                                                        key={d.fullDate || d.dayNum}
                                                        className={`p-1 border-r border-slate-200 ${status === 'LN' ? 'bg-rose-50/40' : status === 'L' ? 'bg-slate-50' : ''}`}
                                                    >
                                                        {renderStatusBadge(status)}
                                                    </td>
                                                );
                                            })}

                                            <td className="px-2 py-2 font-bold border-l border-slate-200 bg-emerald-50 text-emerald-800">{countH}</td>
                                            <td className="px-2 py-2 font-bold border-l border-slate-200 bg-amber-50 text-amber-800">{countT}</td>
                                            <td className="px-2 py-2 font-bold border-l border-slate-200 bg-rose-50 text-rose-800">{countOT}</td>
                                            <td className="px-2 py-2 font-bold border-l border-slate-200 bg-blue-50 text-blue-800">{countIS}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={daysInPeriod.length + 5} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                                                <TableProperties className="w-7 h-7 text-slate-300" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-500">
                                                    {searchQuery || selectedDept ? 'Data tidak ditemukan' : 'Belum ada data rekap presensi'}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {searchQuery || selectedDept
                                                        ? 'Coba ubah filter atau kata kunci pencarian.'
                                                        : 'Data rekap akan muncul setelah ada data absensi pada periode ini.'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;