import React, { useState, useMemo, useCallback } from 'react';
import { Users, Plus, Search, Download, CheckCircle2, AlertCircle, Edit3, Trash2 } from 'lucide-react';
import ModalKaryawan from './Components/ModalKaryawan';

const INITIAL_EMPLOYEES = [
    { id: 1, nama: 'Budi Santoso', nik: '20260101', idFinger: '101', dept: 'IT & Tech', jabatan: 'Software Engineer', syncStatus: 'synced' },
    { id: 2, nama: 'Ahmad Rizky', nik: '20260104', idFinger: '104', dept: 'Marketing', jabatan: 'Digital Marketer', syncStatus: 'synced' },
    { id: 3, nama: 'Siti Aminah', nik: '20260105', idFinger: '', dept: 'HRD & GA', jabatan: 'HR Officer', syncStatus: 'unsynced' },
    { id: 4, nama: 'Dewi Lestari', nik: '20260108', idFinger: '108', dept: 'IT & Tech', jabatan: 'UI/UX Designer', syncStatus: 'synced' },
];

const Employees = () => {
    const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
    const [searchQuery, setSearchQuery] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [syncFilter, setSyncFilter] = useState('');

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        data: null // Null untuk 'Tambah', bertipe Object untuk 'Edit'
    });

    // Helper Avatar Initial
    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    // Filter Data
    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const matchesSearch = emp.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.nik.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesDept = deptFilter ? emp.dept === deptFilter : true;
            const matchesSync = syncFilter ? emp.syncStatus === syncFilter : true;

            return matchesSearch && matchesDept && matchesSync;
        });
    }, [employees, searchQuery, deptFilter, syncFilter]);

    // Counter Stats
    const stats = useMemo(() => {
        const total = employees.length;
        const synced = employees.filter(e => e.idFinger && e.syncStatus === 'synced').length;
        const unsynced = total - synced;
        return { total, synced, unsynced };
    }, [employees]);

    // Handle Open/Close Modal
    const handleOpenModal = (employee = null) => {
        setModalConfig({ isOpen: true, data: employee });
    };

    const handleCloseModal = () => {
        setModalConfig({ isOpen: false, data: null });
    };

    // Handle Save (Create / Update)
    const handleSaveEmployee = (formData) => {
        if (formData.id) {
            // Mode Edit
            setEmployees(prev => prev.map(emp => emp.id === formData.id ? {
                ...formData,
                syncStatus: formData.idFinger ? 'synced' : 'unsynced'
            } : emp));
        } else {
            // Mode Tambah
            const newEmployee = {
                ...formData,
                id: Date.now(),
                syncStatus: formData.idFinger ? 'synced' : 'unsynced'
            };
            setEmployees(prev => [newEmployee, ...prev]);
        }
        handleCloseModal();
    };

    // Handle Delete
    const handleDeleteEmployee = (id, nama) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus data "${nama}"?`)) {
            setEmployees(prev => prev.filter(emp => emp.id !== id));
        }
    };

    // Export Data to CSV
    const handleExport = () => {
        if (filteredEmployees.length === 0) {
            alert('Tidak ada data untuk diexport');
            return;
        }

        const headers = ['NIK', 'Nama Lengkap', 'ID Fingerprint', 'Departemen', 'Jabatan', 'Status Sync'];
        const csvRows = [
            headers.join(','),
            ...filteredEmployees.map(emp => [
                `"${emp.nik}"`,
                `"${emp.nama}"`,
                `"${emp.idFinger || '-'}"`,
                `"${emp.dept}"`,
                `"${emp.jabatan}"`,
                `"${emp.syncStatus === 'synced' ? 'Sync Mesin' : 'Belum Sync'}"`
            ].join(','))
        ];

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Data_Karyawan_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Data Karyawan</h1>
                    <p className="text-sm text-slate-500">Kelola informasi pegawai dan pemetaan ID mesin fingerprint (Jam Kerja: 08:00 - 16:30 WIB).</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
                    >
                        <Download className="w-4 h-4" /> Export Data
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Tambah Karyawan
                    </button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Karyawan</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</div>
                    <span className="text-[11px] text-slate-500">Pegawai Terdaftar</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Terhubung Mesin</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{stats.synced}</div>
                    <span className="text-[11px] text-emerald-600 font-medium">ID Fingerprint Mapping Valid</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm bg-rose-50/50">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Belum Setting ID</span>
                        {stats.unsynced > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>}
                    </div>
                    <div className="text-2xl font-bold text-rose-700 mt-1">{stats.unsynced}</div>
                    <span className="text-[11px] text-rose-600 font-medium">
                        {stats.unsynced > 0 ? 'Segera assign ID Fingerprint!' : 'Semua ID tersinkronisasi'}
                    </span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama atau NIK..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                </div>
                <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-600"
                >
                    <option value="">Semua Departemen</option>
                    <option value="IT & Tech">IT & Tech</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HRD & GA">HRD & GA</option>
                </select>
                <select
                    value={syncFilter}
                    onChange={(e) => setSyncFilter(e.target.value)}
                    className="border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-600"
                >
                    <option value="">Semua Status Sinkronisasi</option>
                    <option value="synced">Sudah Tersinkron</option>
                    <option value="unsynced">Belum Tersinkron (Error)</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Profil Pegawai</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">ID Fingerprint</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Departemen</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Jabatan</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold">Status Sync</th>
                                <th scope="col" className="px-6 py-3.5 font-semibold text-center">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredEmployees.length > 0 ? (
                                filteredEmployees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                                                    {getInitials(emp.nama)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-sm">{emp.nama}</div>
                                                    <div className="text-xs text-slate-400">NIK: {emp.nik}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-800 whitespace-nowrap">
                                            {emp.idFinger ? (
                                                <span className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded font-bold">
                                                    {emp.idFinger}
                                                </span>
                                            ) : (
                                                <span className="text-rose-500 text-xs italic font-medium">Belum set</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-800 whitespace-nowrap">
                                            {emp.dept}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                                            {emp.jabatan}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {emp.syncStatus === 'synced' ? (
                                                <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Sync Mesin
                                                </span>
                                            ) : (
                                                <span className="bg-rose-100 text-rose-800 text-xs font-medium px-2.5 py-1 rounded-full border border-rose-200 inline-flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> Belum Sync
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(emp)}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                    title="Edit Data"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteEmployee(emp.id, emp.nama)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-slate-400 text-xs">
                                        Data karyawan tidak ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            <ModalKaryawan
                isOpen={modalConfig.isOpen}
                onClose={handleCloseModal}
                onSave={handleSaveEmployee}
                data={modalConfig.data}
            />
        </div>
    );
};

export default Employees;