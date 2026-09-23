import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from 'react-apexcharts';
import {
  RefreshCw,
  BellRing,
  ArrowRight,
  Users,
  UserCheck,
  Clock,
  FileText,
  Timer,
  Fingerprint,
  Globe,
  UserMinus,
  Cpu,
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
  Settings2
} from 'lucide-react';
import api from '../../../lib/api';
import { dashboardMockRecentLogs, dashboardMockAbsentEmployees, dashboardMockStats, KATEGORI_TINDAKAN, INITIAL_TINDAKAN } from './data/dashboardMock';
import ModalKelolaTindakan from './Components/ModalKelolaTindakan';
import ModalEksekusiTindakan from './Components/ModalEksekusiTindakan';

// Ekstrak angka menit dari teks status seperti "Telat 14 Mnt" -> 14
const parseMinutesLate = (inStatus) => {
  if (!inStatus) return 0;
  const match = String(inStatus).match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

// Pemetaan kategori level-3 -> filter pegawai dari data absensi ASLI hari ini.
// Kategori yang belum punya sumber data nyata (izin/cuti/shift/alpa) sengaja
// dikembalikan null -> modal akan menampilkan status kosong yang jujur,
// bukan data karangan.
const getPegawaiUntukKategori = (kategori, attendanceToday) => {
  let filterFn = null;

  if (kategori === 'Toleransi (<15 Mnt)') {
    filterFn = (r) => r.status === 'late' && parseMinutesLate(r.inStatus) < 15;
  } else if (kategori === 'Sedang (15 - 30 Mnt)') {
    filterFn = (r) => r.status === 'late' && parseMinutesLate(r.inStatus) >= 15 && parseMinutesLate(r.inStatus) < 30;
  } else if (kategori === 'Berat (>30 Mnt)') {
    filterFn = (r) => r.status === 'late' && parseMinutesLate(r.inStatus) >= 30;
  } else if (kategori === 'Lupa Tap Out/In') {
    filterFn = (r) => r.outStatus === 'Belum Tap';
  }

  if (!filterFn) return [];

  return attendanceToday.filter(filterFn).map((r) => ({
    id: r.id,
    nama: r.nama || `(PIN ${r.finger})`,
    pin: r.finger,
    dept: r.deptDisplay || 'Umum',
    keterangan: r.inStatus || r.outStatus || '-',
    status: 'Pending',
  }));
};

const Dashboard = () => {
  const navigate = useNavigate();

  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState({
    hadir: 0,
    terlambat: 0,
    izin: 0,
    belum_pulang: 0,
    total_karyawan: 0
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);

  const [drillLevel, setDrillLevel] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Master Tindakan HR — bisa diedit langsung dari Dashboard (tombol gear di chart)
  const [tindakanList, setTindakanList] = useState(INITIAL_TINDAKAN);
  const [isKelolaTindakanOpen, setIsKelolaTindakanOpen] = useState(false);

  // Modal eksekusi tindakan HR (level-3 drill-down)
  const [isEksekusiOpen, setIsEksekusiOpen] = useState(false);
  const [selectedTindakanNama, setSelectedTindakanNama] = useState('');
  const [eksekusiRows, setEksekusiRows] = useState([]);

  const handleSaveTindakan = (data) => {
    if (data.id) {
      setTindakanList(prev => prev.map(t => (t.id === data.id ? { ...t, ...data } : t)));
    } else {
      setTindakanList(prev => [{ ...data, id: Date.now() }, ...prev]);
    }
  };

  const handleDeleteTindakan = (id) => {
    setTindakanList(prev => prev.filter(t => t.id !== id));
  };

  const loadDashboardData = useCallback(async () => {
    try {
      const res = await api.get('/api/admin/attendance');
      if (res.data.stats) {
        setStats(res.data.stats);
      }
      if (res.data.attendance) {
        setRecentLogs(res.data.attendance.slice(0, 5));
        const todayStr = new Date().toISOString().slice(0, 10);
        setAllAttendance(res.data.attendance.filter((r) => r.tgl === todayStr));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const level1Data = {
    title: "Evaluasi Kedisiplinan & Kehadiran (Bulan Ini)",
    subtitle: "Klik pada salah satu batang status untuk melihat rincian kriteria keparahannya.",
    categories: ['Tepat Waktu', 'Terlambat', 'Izin / Sakit / Dinas', 'Tanpa Ket. (Alpa)'],
    series: [
      { name: 'Jumlah Kasus/Pegawai', data: [stats.hadir, stats.terlambat, stats.izin, stats.belum_pulang] }
    ]
  };

  const level2Data = {
    'Tepat Waktu': {
      categories: ['Sangat Awal (>15 Mnt)', 'Tepat Waktu (0-15 Mnt)', 'Shift Pagi', 'Shift Middle'],
      series: [{ name: 'Jumlah Pegawai', data: [Math.round(stats.hadir * 0.4), Math.round(stats.hadir * 0.5), Math.round(stats.hadir * 0.08), Math.round(stats.hadir * 0.02)] }]
    },
    'Terlambat': {
      categories: ['Toleransi (<15 Mnt)', 'Sedang (15 - 30 Mnt)', 'Berat (>30 Mnt)'],
      series: [{ name: 'Jumlah Kasus', data: [Math.round(stats.terlambat * 0.6), Math.round(stats.terlambat * 0.3), Math.round(stats.terlambat * 0.1)] }]
    },
    'Izin / Sakit / Dinas': {
      categories: ['Dinas Luar / Field', 'Sakit (Surat Dokter)', 'Izin Alasan Penting', 'Cuti Tahunan'],
      series: [{ name: 'Jumlah Kasus', data: [stats.izin, 0, 0, 0] }]
    },
    'Tanpa Ket. (Alpa)': {
      categories: ['Mangkir 1 Hari', 'Mangkir >2 Hari Berturut', 'Lupa Tap Out/In'],
      series: [{ name: 'Jumlah Kasus', data: [stats.belum_pulang, 0, 0] }]
    }
  };

  // Level 3 sekarang dibangun dinamis dari Master Tindakan HR (bisa diedit lewat tombol gear)
  const level3Data = useMemo(() => {
    const result = {};
    KATEGORI_TINDAKAN.forEach(kategori => {
      const items = tindakanList.filter(t => t.kategori === kategori && t.status === 'aktif');
      result[kategori] = {
        categories: items.map(t => t.nama),
        series: [{ name: 'Jumlah Tindakan', data: items.map(t => t.jumlahKasus) }],
      };
    });
    return result;
  }, [tindakanList]);

  const getCurrentChartData = () => {
    if (drillLevel === 1) {
      return {
        title: level1Data.title,
        subtitle: level1Data.subtitle,
        categories: level1Data.categories,
        series: level1Data.series
      };
    } else if (drillLevel === 2) {
      const data = level2Data[selectedStatus] || level2Data['Terlambat'];
      return {
        title: `Kategori Detail: ${selectedStatus}`,
        subtitle: "Klik kategori spesifik untuk melihat tindakan HR yang diterapkan.",
        categories: data.categories,
        series: data.series
      };
    } else if (drillLevel === 3) {
      const data = level3Data[selectedCategory] || {
        categories: [],
        series: [{ name: 'Jumlah Kasus', data: [] }]
      };
      return {
        title: `Tindakan & Resolusi HR: ${selectedCategory}`,
        subtitle: "Tindakan kedisiplinan dan status pemotongan yang diproses oleh sistem.",
        categories: data.categories,
        series: data.series
      };
    }
    return { title: '', subtitle: '', categories: [], series: [] };
  };

  const activeChart = getCurrentChartData();

  const handleChartClick = (event, chartContext, config) => {
    const clickedIndex = config.dataPointIndex;
    if (clickedIndex === undefined || clickedIndex === -1) return;

    if (drillLevel === 1) {
      const statusName = level1Data.categories[clickedIndex];
      setSelectedStatus(statusName);
      setDrillLevel(2);
    } else if (drillLevel === 2) {
      const currentLevel2 = level2Data[selectedStatus] || level2Data['Terlambat'];
      const categoryName = currentLevel2.categories[clickedIndex];
      setSelectedCategory(categoryName);
      setDrillLevel(3);
    } else if (drillLevel === 3) {
      const currentLevel3 = level3Data[selectedCategory] || { categories: [] };
      const tindakanNama = currentLevel3.categories[clickedIndex];
      if (!tindakanNama) return;

      const pegawai = getPegawaiUntukKategori(selectedCategory, allAttendance).map((p) => ({
        ...p,
        aksi: tindakanNama,
      }));

      setSelectedTindakanNama(tindakanNama);
      setEksekusiRows(pegawai);
      setIsEksekusiOpen(true);
    }
  };

  // Opsi tindakan aktif untuk kategori yang sedang dibuka di modal eksekusi —
  // diambil dari master tindakanList (dinamis), bukan daftar hardcode.
  const opsiTindakanUntukModal = tindakanList
    .filter((t) => t.kategori === selectedCategory && t.status === 'aktif')
    .map((t) => t.nama);

  const handleExecuteTindakan = (rowId) => {
    setEksekusiRows((prev) => prev.map((row) => (
      row.id === rowId ? { ...row, status: 'Selesai' } : row
    )));
  };

  const handleChangeTindakanAksi = (rowId, newAksi) => {
    setEksekusiRows((prev) => prev.map((row) => (
      row.id === rowId ? { ...row, aksi: newAksi } : row
    )));
  };

  const handleResetDrill = () => {
    setDrillLevel(1);
    setSelectedStatus('');
    setSelectedCategory('');
  };

  const handleBackToLevel2 = () => {
    setDrillLevel(2);
    setSelectedCategory('');
  };

  const barChartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
      events: {
        dataPointSelection: handleChartClick
      },
      cursor: 'pointer'
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '45%',
        distributed: true,
        dataLabels: { position: 'top' }
      }
    },
    dataLabels: {
      enabled: true,
      offsetY: -20,
      style: { fontSize: '11px', fontWeight: 600, colors: ['#475569'] }
    },
    colors: drillLevel === 1
      ? ['#10b981', '#f59e0b', '#3b82f6', '#ef4444']
      : (drillLevel === 2 ? ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'] : ['#f43f5e', '#fb7185', '#fda4af']),
    xaxis: {
      categories: activeChart.categories,
      labels: {
        style: { fontSize: '11px', fontWeight: 500, colors: '#64748b' },
        rotate: -15
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { fontSize: '11px', colors: '#64748b' }
      }
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4
    },
    legend: { show: false },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (val) => `${val} Data`
      }
    }
  };

  const pieChartOptions = {
    chart: { type: 'donut', fontFamily: 'Inter, sans-serif' },
    labels: ['Tepat Waktu', 'Terlambat', 'Izin/Sakit'],
    colors: ['#10b981', '#f59e0b', '#3b82f6'],
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { width: 0 },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Hadir',
              fontSize: '11px',
              color: '#64748b',
              formatter: () => `${stats.hadir}`
            }
          }
        }
      }
    }
  };

  const pieChartSeries = [
    stats.hadir,
    stats.terlambat,
    stats.izin || 0
  ];

  const handleSyncFingerprint = async () => {
    try {
      setIsSyncing(true);
      await api.post('/api/admin/attendance/fetch');
      await loadDashboardData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGoToPermissions = () => navigate('/admin/permissions');
  const handleGoToAttendance = () => navigate('/admin/attendance');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Utama</h1>
          <p className="text-sm text-slate-500">Ringkasan aktivitas absensi real-time, evaluasi kedisiplinan, dan monitoring mesin.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSyncFingerprint}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Fingerprint'}
          </button>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start md:items-center gap-3">
          <div className="p-2 bg-amber-500 text-white rounded-lg flex-shrink-0">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900">Perlu Tindakan Admin</h4>
            <p className="text-xs text-amber-700">Terdapat pengajuan perizinan dan lembur dari portal user yang siap ditinjau.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleGoToPermissions}
          className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer"
        >
          Tinjau Pengajuan <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_28px_-8px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Total Karyawan</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.total_karyawan}</h3>
            <p className="text-xs text-slate-500 mt-1">{stats.total_karyawan} Terdaftar</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_28px_-8px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-emerald-600 tracking-wider">Hadir Hari Ini</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.hadir}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              {stats.total_karyawan > 0 ? Math.round((stats.hadir / stats.total_karyawan) * 100) : 0}% Kehadiran
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_28px_-8px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-amber-600 tracking-wider">Terlambat</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.terlambat}</h3>
            <p className="text-xs text-amber-600 font-medium mt-1">Lewat 08:00 WIB</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={handleGoToPermissions}
          className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_10px_28px_-8px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-between cursor-pointer hover:border-blue-200"
        >
          <div>
            <p className="text-xs font-semibold uppercase text-blue-600 tracking-wider">Dinas / Izin / Sakit</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.izin}</h3>
            <p className="text-xs text-blue-600 font-medium mt-1">Disetujui Admin</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-slate-900 text-base">{activeChart.title}</h2>
                  {drillLevel > 1 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                      Level {drillLevel} Drill-down
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{activeChart.subtitle}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsKelolaTindakanOpen(true)}
                  title="Kelola Tindakan HR"
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                >
                  <Settings2 className="w-4 h-4" />
                </button>

                {drillLevel > 1 && (
                  <>
                    {drillLevel === 3 && (
                      <button
                        type="button"
                        onClick={handleBackToLevel2}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                      >
                        <ArrowLeft className="w-3 h-3" /> Kembali
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleResetDrill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                    >
                      Reset Utama
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="w-full">
              <Chart options={barChartOptions} series={activeChart.series} type="bar" height={280} />
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="text-slate-400">Navigasi:</span>
              <span className={drillLevel === 1 ? 'text-indigo-600 font-bold' : ''}>Status Utama</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className={drillLevel === 2 ? 'text-indigo-600 font-bold' : ''}>{selectedStatus || 'Kategori'}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className={drillLevel === 3 ? 'text-indigo-600 font-bold' : ''}>{selectedCategory || 'Tindakan HR'}</span>
            </div>
            <span className="text-[11px] text-slate-400 italic">
              {drillLevel < 3 ? 'Tip: Klik batang grafik untuk drill-down' : 'Tip: Klik batang untuk membuka & mengeksekusi daftar pegawai'}
            </span>
          </div>
        </div>

        <div className="space-y-6 flex flex-col justify-between">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] space-y-4">
            <div>
              <h2 className="font-bold text-slate-900">Komposisi Hari Ini</h2>
              <p className="text-xs text-slate-500">Persentase kehadiran pegawai realtime.</p>
            </div>
            <div className="w-full flex justify-center items-center">
              <Chart options={pieChartOptions} series={pieChartSeries} type="donut" height={230} />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
              <div className="flex flex-col items-center gap-1">
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Tepat Waktu
                </span>
                <span className="text-sm font-bold text-slate-900">{stats.hadir - stats.terlambat > 0 ? stats.hadir - stats.terlambat : 0}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> Terlambat
                </span>
                <span className="text-sm font-bold text-slate-900">{stats.terlambat}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> Izin/Sakit
                </span>
                <span className="text-sm font-bold text-slate-900">{stats.izin}</span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-900 text-white p-5 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] flex items-center justify-between">
            <div>
              <span className="text-xs text-indigo-300 font-medium uppercase tracking-wider block">Total Karyawan Hadir</span>
              <h3 className="text-2xl font-bold mt-1">{stats.hadir} Karyawan</h3>
              <p className="text-xs text-indigo-300 mt-1">Dari {stats.total_karyawan} Terdaftar</p>
            </div>
            <div className="p-3 bg-indigo-800 rounded-lg text-indigo-300">
              <Timer className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">Log Absensi Masuk Terkini</h2>
              <p className="text-xs text-slate-500">Hasil tap mesin fingerprint secara real-time dari database.</p>
            </div>
            <button
              type="button"
              onClick={handleGoToAttendance}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition cursor-pointer"
            >
              Lihat Semua Log →
            </button>
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
                {recentLogs.length > 0 ? (
                  recentLogs.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                            {row.initials && row.initials !== '-' ? row.initials : (row.finger ? row.finger : '-')}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{row.nama || <span className="text-slate-400 italic font-normal">(Nama belum sinkron)</span>}</div>
                            <div className="text-xs text-slate-400">PIN: {row.finger} • {row.deptDisplay || 'Umum'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 font-mono text-slate-700">{row.in || '-'}</td>
                      <td className="px-6 py-3.5">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${row.status === 'late'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}>
                          {row.inStatus || 'Tepat Waktu'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Fingerprint className="w-3.5 h-3.5 text-indigo-600" /> {row.locIn}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-xs text-slate-400">
                      Belum ada log absensi hari ini. Klik tombol "Sync Fingerprint" untuk menarik data dari cloud.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <UserMinus className="w-4 h-4 text-amber-500" /> Belum Pulang ({stats.belum_pulang} Orang)
              </h3>
              <span className="text-[10px] text-slate-400">Batas: 16:30 WIB</span>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-500">
                {stats.belum_pulang > 0
                  ? `${stats.belum_pulang} karyawan yang hadir belum melakukan tap pulang.`
                  : 'Semua karyawan yang hadir telah menyelesaikan tap pulang.'}
              </p>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Status Hardware</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ONLINE</span>
            </div>
            <div className="space-y-1">
              <div className="text-base font-bold flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" /> Fingerspot Online Cloud
              </div>
              <div className="text-xs text-slate-400 font-mono">Cloud ID: C260503403233826</div>
            </div>
            <div className="pt-3 border-t border-slate-800 text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Total Presensi Masuk:</span>
                <span className="text-slate-200 font-medium">{stats.hadir} Data Hari Ini</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Sinkronisasi:</span>
                <span className="text-emerald-400 font-medium">Aktif Realtime</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ModalKelolaTindakan
        isOpen={isKelolaTindakanOpen}
        onClose={() => setIsKelolaTindakanOpen(false)}
        tindakanList={tindakanList}
        onSave={handleSaveTindakan}
        onDelete={handleDeleteTindakan}
      />

      <ModalEksekusiTindakan
        isOpen={isEksekusiOpen}
        onClose={() => setIsEksekusiOpen(false)}
        kategoriTitle={selectedCategory}
        tindakanTitle={selectedTindakanNama}
        dataKaryawan={eksekusiRows}
        opsiTindakan={opsiTindakanUntukModal.length > 0 ? opsiTindakanUntukModal : [selectedTindakanNama]}
        onExecute={handleExecuteTindakan}
        onChangeAction={handleChangeTindakanAksi}
      />
    </div>
  );
};

export default Dashboard;