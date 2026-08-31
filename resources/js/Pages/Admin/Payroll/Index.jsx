import React, { useState, useMemo, useCallback } from 'react';
import { Download, Calculator, Search, CheckCircle, FileText, Clock, ReceiptText } from 'lucide-react';
import ModalSlip from './Components/ModalSlip';

// Tambahkan field 'periode' (format YYYY-MM) pada mock data
const INITIAL_PAYROLL_DATA = [
    {
        id: 1,
        nama: 'Budi Santoso',
        nik: '20260101',
        dept: 'it',
        deptLabel: 'IT & Tech',
        jabatan: 'Software Engineer',
        gapok: 8000000,
        bonus: 750000,
        potongan: 50000,
        status: 'paid',
        periode: '2026-08'
    },
    {
        id: 2,
        nama: 'Ahmad Rizky',
        nik: '20260104',
        dept: 'marketing',
        deptLabel: 'Marketing',
        jabatan: 'Digital Marketer',
        gapok: 6500000,
        bonus: 300000,
        potongan: 150000,
        status: 'pending',
        periode: '2026-08'
    },
    {
        id: 3,
        nama: 'Siti Aminah',
        nik: '20260105',
        dept: 'hrd',
        deptLabel: 'HRD & GA',
        jabatan: 'HR Officer',
        gapok: 7000000,
        bonus: 450000,
        potongan: 0,
        status: 'paid',
        periode: '2026-08'
    },
    {
        id: 4,
        nama: 'Dewi Lestari',
        nik: '20260108',
        dept: 'it',
        deptLabel: 'IT & Tech',
        jabatan: 'UI/UX Designer',
        gapok: 7500000,
        bonus: 500000,
        potongan: 100000,
        status: 'pending',
        periode: '2026-07' // Contoh data bulan Juli 2026
    }
];

const Payroll = () => {
    const [payrollList, setPayrollList] = useState(INITIAL_PAYROLL_DATA);
    const [periode, setPeriode] = useState('2026-08');
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [modalData, setModalData] = useState({
        isOpen: false,
        nama: '',
        nik: '',
        jabatan: '',
        gapok: 0,
        bonus: 0,
        potongan: 0,
        thp: 0,
        periode: 'Agustus 2026'
    });

    // Handle Tandai Dibayar (Draft -> Paid)
    const handleTandaiDibayar = (item) => {
        if (window.confirm(`Tandai gaji ${item.nama} sebagai sudah dibayar?`)) {
            setPayrollList(prev => prev.map(p =>
                p.id === item.id ? { ...p, status: 'paid' } : p
            ));
        }
    };

    // Helper Currency Formatter
    const formatIDR = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    // Filter Data Real-time
    const filteredPayroll = useMemo(() => {
        return payrollList.filter(item => {
            const matchesPeriode = periode ? item.periode === periode : true;
            const matchesSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.nik.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesDept = selectedDept ? item.dept === selectedDept : true;
            const matchesStatus = selectedStatus ? item.status === selectedStatus : true;

            return matchesPeriode && matchesSearch && matchesDept && matchesStatus;
        });
    }, [payrollList, periode, searchQuery, selectedDept, selectedStatus]);

    // Counter Dynamic Stats
    const stats = useMemo(() => {
        const totalTHP = filteredPayroll.reduce((acc, curr) => acc + (curr.gapok + curr.bonus - curr.potongan), 0);
        const totalBonus = filteredPayroll.reduce((acc, curr) => acc + curr.bonus, 0);
        const totalPotongan = filteredPayroll.reduce((acc, curr) => acc + curr.potongan, 0);
        const countKaryawan = filteredPayroll.length;

        return { totalTHP, totalBonus, totalPotongan, countKaryawan };
    }, [filteredPayroll]);

    // Handle Open Slip Modal
    const openModalSlip = useCallback((item) => {
        const thp = item.gapok + item.bonus - item.potongan;

        const [year, month] = (item.periode || periode).split('-');
        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        const formattedPeriode = `${monthNames[parseInt(month, 10) - 1]} ${year}`;

        setModalData({
            isOpen: true,
            nama: item.nama,
            nik: item.nik,
            jabatan: item.jabatan,
            gapok: item.gapok,
            bonus: item.bonus,
            potongan: item.potongan,
            thp: thp,
            periode: formattedPeriode
        });
    }, [periode]);

    const closeModalSlip = useCallback(() => {
        setModalData(prev => ({ ...prev, isOpen: false }));
    }, []);

    // Handle Calculate Payroll (Simulasi)
    const handleRecalculatePayroll = () => {
        alert(`Payroll untuk periode ${periode} berhasil dikalkulasi ulang berdasarkan rekap data absensi terbaru!`);
    };

    // Export Data CSV
    const handleExportCSV = () => {
        if (filteredPayroll.length === 0) {
            alert('Tidak ada data payroll untuk diexport pada periode ini.');
            return;
        }

        const headers = ['NIK', 'Nama', 'Departemen', 'Jabatan', 'Periode', 'Gaji Pokok', 'Bonus & Lembur', 'Potongan', 'Total THP', 'Status'];
        const csvRows = [
            headers.join(','),
            ...filteredPayroll.map(item => [
                `"${item.nik}"`,
                `"${item.nama}"`,
                `"${item.deptLabel}"`,
                `"${item.jabatan}"`,
                `"${item.periode}"`,
                item.gapok,
                item.bonus,
                item.potongan,
                (item.gapok + item.bonus - item.potongan),
                `"${item.status === 'paid' ? 'Paid' : 'Draft'}"`
            ].join(','))
        ];

        const csvContent = 'sep=,\n' + csvRows.join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Payroll_Report_${periode}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Penggajian & Payroll</h1>
                    <p className="text-sm text-slate-500">Kalkulasi gaji otomatis berdasarkan rekap absensi, keterlambatan, dan lembur.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
                    >
                        <Download className="w-4 h-4" /> Export Slip Gaji
                    </button>
                    <button
                        onClick={handleRecalculatePayroll}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
                    >
                        <Calculator className="w-4 h-4" /> Hitung Payroll Bulan Ini
                    </button>
                </div>
            </div>

            {/* Dynamic Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Output Gaji ({periode})</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{formatIDR(stats.totalTHP)}</div>
                    <span className="text-[11px] text-slate-500">{stats.countKaryawan} Karyawan Terfilter</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Total Lembur & Tunjangan</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{formatIDR(stats.totalBonus)}</div>
                    <span className="text-[11px] text-indigo-600 font-medium">Berdasarkan Jam Lembur Valid</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Total Potongan Absensi</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{formatIDR(stats.totalPotongan)}</div>
                    <span className="text-[11px] text-rose-600 font-medium">Terlambat & Alpa</span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Periode Bulan</label>
                        <input
                            type="month"
                            value={periode}
                            onChange={(e) => setPeriode(e.target.value)}
                            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Departemen / Divisi</label>
                        <select
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                            <option value="">Semua Departemen</option>
                            <option value="it">IT & Tech</option>
                            <option value="hrd">HRD & General Affair</option>
                            <option value="finance">Finance & Accounting</option>
                            <option value="marketing">Marketing</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Status Pembayaran</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                            <option value="">Semua Status</option>
                            <option value="paid">Sudah Dibayar</option>
                            <option value="pending">Draft / Belum Transfer</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Cari Karyawan</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Nama / NIK..."
                                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3.5 font-semibold">Karyawan</th>
                                <th className="px-6 py-3.5 font-semibold">Gaji Pokok</th>
                                <th className="px-6 py-3.5 font-semibold">Bonus & Lembur</th>
                                <th className="px-6 py-3.5 font-semibold">Potongan</th>
                                <th className="px-6 py-3.5 font-semibold">Total Diterima (THP)</th>
                                <th className="px-6 py-3.5 font-semibold">Status</th>
                                <th className="px-6 py-3.5 font-semibold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPayroll.length > 0 ? (
                                filteredPayroll.map((item) => {
                                    const thp = item.gapok + item.bonus - item.potongan;
                                    const avatarInitials = item.nama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full ${item.status === 'paid' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'} font-bold flex items-center justify-center text-xs`}>
                                                        {avatarInitials}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-sm">{item.nama || <span className="text-slate-300 italic font-normal">Nama tidak tersedia</span>}</div>
                                                        <div className="text-xs text-slate-400">{item.deptLabel || '-'} &bull; {item.jabatan || <span className="italic">Belum diisi</span>}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-slate-700 whitespace-nowrap">{item.gapok != null ? formatIDR(item.gapok) : <span className="text-slate-300 italic">-</span>}</td>
                                            <td className="px-6 py-4 text-xs font-mono text-emerald-600 whitespace-nowrap">+ {item.bonus != null ? formatIDR(item.bonus) : <span className="text-slate-300 italic">-</span>}</td>
                                            <td className="px-6 py-4 text-xs font-mono text-rose-600 whitespace-nowrap">- {item.potongan != null ? formatIDR(item.potongan) : <span className="text-slate-300 italic">-</span>}</td>
                                            <td className="px-6 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">{formatIDR(thp)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {item.status === 'paid' ? (
                                                    <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3" /> Paid
                                                    </span>
                                                ) : (
                                                    <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> Draft
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => openModalSlip(item)}
                                                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition inline-flex items-center gap-1.5"
                                                    >
                                                        <FileText className="w-3.5 h-3.5" /> Slip Gaji
                                                    </button>
                                                    {item.status !== 'paid' && (
                                                        <button
                                                            onClick={() => handleTandaiDibayar(item)}
                                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition inline-flex items-center gap-1.5"
                                                        >
                                                            <CheckCircle className="w-3.5 h-3.5" /> Tandai Dibayar
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                                                <ReceiptText className="w-7 h-7 text-slate-300" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-500">
                                                    {searchQuery || selectedDept || selectedStatus ? 'Data tidak ditemukan' : `Belum ada data payroll untuk periode ${periode}`}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">
                                                    {searchQuery || selectedDept || selectedStatus
                                                        ? 'Coba ubah filter atau kata kunci pencarian.'
                                                        : 'Klik "Hitung Payroll" untuk memulai kalkulasi gaji.'}
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

            {/* Modal Slip Gaji */}
            <ModalSlip isOpen={modalData.isOpen} onClose={closeModalSlip} data={modalData} />
        </div>
    );
};

export default Payroll;