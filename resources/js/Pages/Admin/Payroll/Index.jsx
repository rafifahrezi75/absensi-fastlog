import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Download, Calculator, Search, CheckCircle, FileText, Clock, ReceiptText, CalendarCheck2, Loader2 } from 'lucide-react';
import ModalSlip from './Components/ModalSlip';
import ModalDetails from './Components/ModalDetails';
import api from '../../../lib/api';
import { showSuccess, showError, showConfirm } from '../../../lib/swal';

const Payroll = () => {
    const [payrollList, setPayrollList] = useState([]);
    const [periode, setPeriode] = useState(() => {
        const date = new Date();
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    });
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const [modalData, setModalData] = useState({
        isOpen: false,
        nama: '',
        nik: '',
        dept: '',
        deptLabel: '',
        jabatan: '',
        golongan: '',
        gapok: 0,
        tunjangan: 0,
        lembur: 0,
        bonus: 0,
        potongan_terlambat: 0,
        potongan_alpa: 0,
        potongan_lainnya: 0,
        potongan: 0,
        thp: 0,
        hadir: 0,
        terlambat: 0,
        alpa: 0,
        lembur_menit: 0,
        periode: ''
    });

    const [detailModal, setDetailModal] = useState({
        isOpen: false,
        employee: null
    });

    const fetchPayroll = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/admin/payroll?periode=${periode}`);
            setPayrollList(response.data || []);
        } catch (error) {
            console.error('Failed to fetch payroll data', error);
            showError('Gagal memuat data payroll.');
        } finally {
            setLoading(false);
        }
    }, [periode]);

    useEffect(() => {
        fetchPayroll();
    }, [fetchPayroll]);

    const handleTandaiDibayar = async (item) => {
        const confirmed = await showConfirm({
            title: 'Konfirmasi Pembayaran Gaji',
            text: `Tandai gaji ${item.nama} periode ${periode} sebesar ${formatIDR(item.thp)} sebagai sudah dibayar?`,
            confirmText: 'Ya, Tandai Dibayar',
            confirmColor: '#059669'
        });
        if (!confirmed) return;

        try {
            await api.post('/api/admin/payroll/pay', {
                employee_id: item.id,
                periode: periode
            });
            showSuccess(`Gaji ${item.nama} berhasil ditandai sebagai dibayar.`);
            fetchPayroll();
        } catch (err) {
            showError(err.response?.data?.message || 'Gagal mengubah status pembayaran.');
        }
    };

    const handleRecalculatePayroll = async () => {
        try {
            setLoading(true);
            const res = await api.post('/api/admin/payroll/recalculate', { periode });
            setPayrollList(res.data.data || []);
            showSuccess(`Payroll periode ${periode} berhasil dikalkulasi ulang.`);
        } catch (err) {
            showError(err.response?.data?.message || 'Gagal melakukan kalkulasi ulang.');
        } finally {
            setLoading(false);
        }
    };

    const formatIDR = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    const filteredPayroll = useMemo(() => {
        return payrollList.filter(item => {
            const matchesPeriode = periode ? item.periode === periode : true;
            const matchesSearch = (item.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.nik || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesDept = selectedDept ? (item.dept || '').toLowerCase() === selectedDept.toLowerCase() : true;
            const matchesStatus = selectedStatus ? item.status === selectedStatus : true;

            return matchesPeriode && matchesSearch && matchesDept && matchesStatus;
        });
    }, [payrollList, periode, searchQuery, selectedDept, selectedStatus]);

    const stats = useMemo(() => {
        const totalTHP = filteredPayroll.reduce((acc, curr) => acc + (curr.thp != null ? curr.thp : (curr.gapok + curr.bonus - curr.potongan)), 0);
        const totalBonus = filteredPayroll.reduce((acc, curr) => acc + (curr.bonus || 0), 0);
        const totalPotongan = filteredPayroll.reduce((acc, curr) => acc + (curr.potongan || 0), 0);
        const countKaryawan = filteredPayroll.length;

        return { totalTHP, totalBonus, totalPotongan, countKaryawan };
    }, [filteredPayroll]);

    const openModalSlip = useCallback((item) => {
        const [year, month] = (item.periode || periode).split('-');
        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        const formattedPeriode = `${monthNames[parseInt(month, 10) - 1]} ${year}`;

        setModalData({
            isOpen: true,
            nama: item.nama,
            nik: item.nik,
            dept: item.dept,
            deptLabel: item.deptLabel,
            jabatan: item.jabatan,
            golongan: item.golongan,
            gapok: item.gapok,
            tunjangan: item.tunjangan,
            lembur: item.lembur,
            bonus: item.bonus,
            potongan_terlambat: item.potongan_terlambat,
            potongan_alpa: item.potongan_alpa,
            potongan_lainnya: item.potongan_lainnya,
            potongan: item.potongan,
            thp: item.thp,
            hadir: item.hadir,
            terlambat: item.terlambat,
            alpa: item.alpa,
            lembur_menit: item.lembur_menit,
            periode: formattedPeriode
        });
    }, [periode]);

    const closeModalSlip = useCallback(() => {
        setModalData(prev => ({ ...prev, isOpen: false }));
    }, []);

    const openModalDetails = (item) => {
        setDetailModal({
            isOpen: true,
            employee: item
        });
    };

    const closeModalDetails = () => {
        setDetailModal({
            isOpen: false,
            employee: null
        });
    };

    const handleExportCSV = () => {
        if (filteredPayroll.length === 0) {
            alert('Tidak ada data payroll untuk diexport pada periode ini.');
            return;
        }

        const headers = ['NIK', 'Nama', 'Departemen', 'Jabatan', 'Golongan', 'Periode', 'Gaji Pokok', 'Tunjangan', 'Lembur', 'Potongan Terlambat', 'Potongan Alpa', 'Potongan Lainnya', 'Total Potongan', 'Total THP', 'Status'];
        const csvRows = [
            headers.join(','),
            ...filteredPayroll.map(item => [
                `"${item.nik || '-'}"`,
                `"${item.nama || '-'}"`,
                `"${item.deptLabel || item.dept || '-'}"`,
                `"${item.jabatan || '-'}"`,
                `"${item.golongan || '-'}"`,
                `"${item.periode}"`,
                item.gapok || 0,
                item.tunjangan || 0,
                item.lembur || 0,
                item.potongan_terlambat || 0,
                item.potongan_alpa || 0,
                item.potongan_lainnya || 0,
                item.potongan || 0,
                item.thp || 0,
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Penggajian & Payroll</h1>
                    <p className="text-sm text-slate-500">Kalkulasi gaji otomatis berdasarkan golongan master, rekap absensi, keterlambatan, dan jam lembur.</p>
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
                        disabled={loading}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                        Hitung Payroll Bulan Ini
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Output Gaji ({periode})</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{formatIDR(stats.totalTHP)}</div>
                    <span className="text-[11px] text-slate-500">{stats.countKaryawan} Karyawan Terfilter</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Total Lembur & Tunjangan</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{formatIDR(stats.totalBonus)}</div>
                    <span className="text-[11px] text-indigo-600 font-medium">Berdasarkan Jam Lembur Valid & Komponen</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Total Potongan Absensi & BPJS</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{formatIDR(stats.totalPotongan)}</div>
                    <span className="text-[11px] text-rose-600 font-medium">Terlambat, Alpa & Komponen Potongan</span>
                </div>
            </div>

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
                            <option value="IT & Tech">IT & Tech</option>
                            <option value="HRD & GA">HRD & GA</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Finance & Accounting">Finance & Accounting</option>
                            <option value="Operasional">Operasional</option>
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
                            <option value="draft">Draft / Belum Transfer</option>
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

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3.5 font-semibold">Karyawan</th>
                                <th className="px-6 py-3.5 font-semibold">Gaji Pokok</th>
                                <th className="px-6 py-3.5 font-semibold">Tunjangan & Lembur</th>
                                <th className="px-6 py-3.5 font-semibold">Potongan</th>
                                <th className="px-6 py-3.5 font-semibold">Total Diterima (THP)</th>
                                <th className="px-6 py-3.5 font-semibold">Status</th>
                                <th className="px-6 py-3.5 font-semibold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                                            <p className="text-sm font-medium text-slate-600">Memuat kalkulasi payroll...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredPayroll.length > 0 ? (
                                filteredPayroll.map((item) => {
                                    const thp = item.thp != null ? item.thp : (item.gapok + item.bonus - item.potongan);
                                    const avatarInitials = (item.nama || 'NA').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full ${item.status === 'paid' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'} font-bold flex items-center justify-center text-xs`}>
                                                        {avatarInitials}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-sm">{item.nama || <span className="text-slate-300 italic font-normal">Nama tidak tersedia</span>}</div>
                                                        <div className="text-xs text-slate-400">
                                                            {item.deptLabel || item.dept || '-'} &bull; {item.jabatan || 'Staff'} <span className="text-indigo-600 font-semibold">({item.golongan || 'Staff'})</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-slate-700 whitespace-nowrap">{item.gapok != null ? formatIDR(item.gapok) : <span className="text-slate-300 italic">-</span>}</td>
                                            <td className="px-6 py-4 text-xs font-mono text-emerald-600 whitespace-nowrap">
                                                <div>+ {formatIDR(item.bonus || 0)}</div>
                                                {item.lembur > 0 && <div className="text-[10px] text-slate-400 font-sans">Lembur: {formatIDR(item.lembur)}</div>}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-rose-600 whitespace-nowrap">
                                                <div>- {formatIDR(item.potongan || 0)}</div>
                                                <div className="text-[10px] text-slate-400 font-sans">
                                                    {item.terlambat > 0 ? `Telat: ${item.terlambat}m ` : ''}
                                                    {item.alpa > 0 ? `Alpa: ${item.alpa}h` : ''}
                                                </div>
                                            </td>
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
                                                        onClick={() => openModalDetails(item)}
                                                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition inline-flex items-center gap-1"
                                                        title="Rincian Absensi & Dispensasi"
                                                    >
                                                        <CalendarCheck2 className="w-3.5 h-3.5 text-indigo-600" /> Rincian
                                                    </button>
                                                    <button
                                                        onClick={() => openModalSlip(item)}
                                                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium transition inline-flex items-center gap-1"
                                                    >
                                                        <FileText className="w-3.5 h-3.5" /> Slip
                                                    </button>
                                                    {item.status !== 'paid' && (
                                                        <button
                                                            onClick={() => handleTandaiDibayar(item)}
                                                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition inline-flex items-center gap-1"
                                                        >
                                                            <CheckCircle className="w-3.5 h-3.5" /> Bayar
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

            <ModalSlip isOpen={modalData.isOpen} onClose={closeModalSlip} data={modalData} />
            <ModalDetails
                isOpen={detailModal.isOpen}
                onClose={closeModalDetails}
                employee={detailModal.employee}
                periode={periode}
                onDataChanged={fetchPayroll}
            />
        </div>
    );
};

export default Payroll;