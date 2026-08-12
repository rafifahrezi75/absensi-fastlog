import React from 'react';
import Chart from 'react-apexcharts';
import { Download, RefreshCw, BellRing, ArrowRight, Users, UserCheck, Clock, FileText, Timer, Fingerprint, Globe, UserMinus, Cpu } from 'lucide-react';

const Dashboard = () => {
    // 1. CHART TREN KEHADIRAN
    const attendanceChartOptions = {
        chart: { type: 'bar', height: 300, stacked: true, toolbar: { show: false } },
        colors: ['#10b981', '#f59e0b', '#3b82f6'],
        plotOptions: { bar: { horizontal: false, borderRadius: 6, columnWidth: '40%' } },
        xaxis: { categories: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'] },
        legend: { position: 'bottom' },
        fill: { opacity: 1 }
    };
    const attendanceChartSeries = [
        { name: 'Tepat Waktu', data: [40, 42, 38, 41, 42, 0, 0] },
        { name: 'Terlambat', data: [4, 3, 5, 4, 4, 0, 0] },
        { name: 'Izin/Sakit/Dinas', data: [6, 5, 7, 5, 6, 0, 0] }
    ];

    // 2. CHART DONUT KOMPOSISI
    const pieChartOptions = {
        labels: ['Tepat Waktu', 'Terlambat', 'Izin/Sakit/Dinas'],
        colors: ['#10b981', '#f59e0b', '#3b82f6'],
        legend: { show: false },
        dataLabels: { enabled: false },
        plotOptions: {
            pie: {
                donut: {
                    size: '75%',
                    labels: {
                        show: true,
                        total: { show: true, label: 'Hadir/Izin', formatter: () => '52/52' }
                    }
                }
            }
        }
    };
    const pieChartSeries = [42, 4, 6];

    return (
        <div className="space-y-6">
            {/* HEADER HALAMAN & AKSI CEPAT */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard Utama</h1>
                    <p className="text-sm text-slate-500">Ringkasan aktivitas absensi real-time, pengajuan user, dan monitoring mesin.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
                        <Download className="w-4 h-4" /> Export Laporan
                    </button>
                    <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
                        <RefreshCw className="w-4 h-4" /> Sync Fingerprint
                    </button>
                </div>
            </div>

            {/* WIDGET WARNING: NEED ACTION */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start md:items-center gap-3">
                    <div className="p-2 bg-amber-500 text-white rounded-lg flex-shrink-0">
                        <BellRing className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-amber-900">Perlu Tindakan Admin (5 Pengajuan Pending)</h4>
                        <p className="text-xs text-amber-700">Terdapat 3 Pengajuan Izin/Sakit dan 2 Pengajuan Lembur dari portal user yang belum ditinjau.</p>
                    </div>
                </div>
                <a href="#" className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap">
                    Tinjau Pengajuan <ArrowRight className="w-3.5 h-3.5" />
                </a>
            </div>

            {/* KARTU STATISTIK UTAMA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Total Karyawan</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">52</h3>
                        <p className="text-xs text-slate-500 mt-1">48 Enrolled Fingerprint</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Users className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-emerald-600 tracking-wider">Hadir Hari Ini</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">42</h3>
                        <p className="text-xs text-emerald-600 font-medium mt-1">80.7% Kehadiran</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <UserCheck className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-amber-600 tracking-wider">Terlambat</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">4</h3>
                        <p className="text-xs text-amber-600 font-medium mt-1">Potongan Otomatis</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase text-blue-600 tracking-wider">Dinas / Izin / Sakit</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">6</h3>
                        <p className="text-xs text-blue-600 font-medium mt-1">ACC via Portal User</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* GRAFIK TREN KEHADIRAN & DONUT KOMPOSISI */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h2 className="font-bold text-slate-900">Tren Kehadiran Mingguan</h2>
                            <p className="text-xs text-slate-500">Klik pada legend di bawah chart untuk menyembunyikan/menampilkan data.</p>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-600 self-start sm:self-auto">
                            <button className="px-3 py-1 rounded-md bg-white text-slate-900 shadow-sm">Minggu Ini</button>
                            <button className="px-3 py-1 rounded-md hover:text-slate-900 transition">Bulan Ini</button>
                        </div>
                    </div>
                    <div className="w-full">
                        <Chart options={attendanceChartOptions} series={attendanceChartSeries} type="bar" height={300} />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <div>
                            <h2 className="font-bold text-slate-900">Komposisi Hari Ini</h2>
                            <p className="text-xs text-slate-500">Persentase kehadiran pegawai.</p>
                        </div>
                        <div className="w-full flex justify-center items-center">
                            <Chart options={pieChartOptions} series={pieChartSeries} type="donut" height={230} />
                        </div>
                    </div>

                    <div className="bg-indigo-900 text-white p-5 rounded-xl shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs text-indigo-300 font-medium uppercase tracking-wider block">Total Jam Lembur Bulan Ini</span>
                            <h3 className="text-2xl font-bold mt-1">128.5 Jam</h3>
                            <p className="text-xs text-indigo-300 mt-1">Dari 14 Karyawan</p>
                        </div>
                        <div className="p-3 bg-indigo-800 rounded-lg text-indigo-300">
                            <Timer className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* TABEL LOG TERKINI & HARDWARE STATUS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                        <div>
                            <h2 className="font-bold text-slate-900">Log Absensi Masuk Terkini</h2>
                            <p className="text-xs text-slate-500">Hasil tap mesin fingerprint lobi secara real-time.</p>
                        </div>
                        <a href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Lihat Semua Log →</a>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3">Karyawan</th>
                                    <th className="px-6 py-3">Waktu Tap</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-center">Metode</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr className="hover:bg-slate-50">
                                    <td className="px-6 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">BS</div>
                                            <div>
                                                <div className="font-semibold text-sm">Budi Santoso</div>
                                                <div className="text-xs text-slate-400">Software Engineer</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5 font-mono text-slate-700">07:54:10</td>
                                    <td className="px-6 py-3.5">
                                        <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-emerald-200">Tepat Waktu</span>
                                    </td>
                                    <td className="px-6 py-3.5 text-center">
                                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                            <Fingerprint className="w-3.5 h-3.5 text-indigo-600" /> Fingerprint
                                        </span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50">
                                    <td className="px-6 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs">AR</div>
                                            <div>
                                                <div className="font-semibold text-sm">Ahmad Rizky</div>
                                                <div className="text-xs text-slate-400">Digital Marketing</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5 font-mono text-slate-700">08:14:22</td>
                                    <td className="px-6 py-3.5">
                                        <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-amber-200">Telat 14 Mnt</span>
                                    </td>
                                    <td className="px-6 py-3.5 text-center">
                                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                            <Fingerprint className="w-3.5 h-3.5 text-indigo-600" /> Fingerprint
                                        </span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50">
                                    <td className="px-6 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">S</div>
                                            <div>
                                                <div className="font-semibold text-sm">Siti Aminah</div>
                                                <div className="text-xs text-slate-400">Accountant</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5 font-mono text-slate-700">-</td>
                                    <td className="px-6 py-3.5">
                                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-blue-200">Sakit (Approved)</span>
                                    </td>
                                    <td className="px-6 py-3.5 text-center">
                                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                            <Globe className="w-3.5 h-3.5 text-blue-600" /> Portal User
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                <UserMinus className="w-4 h-4 text-rose-500" /> Belum Hadir (2 Orang)
                            </h3>
                            <span className="text-[10px] text-slate-400">Batas: 08:00 WIB</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg">
                                <div>
                                    <div className="font-medium text-slate-800">Deni Pratama</div>
                                    <div className="text-[10px] text-slate-400">Staff IT</div>
                                </div>
                                <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-medium">Tanpa Ket.</span>
                            </div>
                            <div className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg">
                                <div>
                                    <div className="font-medium text-slate-800">Rina Melati</div>
                                    <div className="text-[10px] text-slate-400">HR Admin</div>
                                </div>
                                <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-medium">Tanpa Ket.</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 text-white p-5 rounded-xl shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Status Hardware</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ONLINE</span>
                        </div>
                        <div className="space-y-1">
                            <div className="text-base font-bold flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-indigo-400" /> Solution X-100C
                            </div>
                            <div className="text-xs text-slate-400 font-mono">IP: 192.168.1.201</div>
                        </div>
                        <div className="pt-3 border-t border-slate-800 text-xs space-y-2">
                            <div className="flex justify-between text-slate-400">
                                <span>Penyimpanan:</span>
                                <span className="text-slate-200 font-medium">120 / 1000 ID</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>Sync Otomatis:</span>
                                <span className="text-emerald-400 font-medium">Aktif (Tiap 5 mnt)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
