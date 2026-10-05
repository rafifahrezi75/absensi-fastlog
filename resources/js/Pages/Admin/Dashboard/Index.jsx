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

const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseMinutesLate = (inStatus) => {
  if (!inStatus) return 0;
  const match = String(inStatus).match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

const parseTimeMinutes = (timeStr) => {
  if (!timeStr) return null;
  const parts = String(timeStr).split(':').map(Number);
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
  return parts[0] * 60 + parts[1];
};

const getPegawaiUntukKategori = (kategori, attendanceToday = [], permissions = [], allEmployees = []) => {
  let filterFn = null;

  if (kategori === 'Sangat Awal (>15 Mnt)') {
    filterFn = (r) => {
      const isOntime = r.status === 'hadir' || r.status === 'ontime' || !String(r.inStatus || '').startsWith('Telat');
      const mins = parseTimeMinutes(r.in);
      return isOntime && mins !== null && mins < 465;
    };
  } else if (kategori === 'Tepat Waktu (0-15 Mnt)') {
    filterFn = (r) => {
      const isOntime = r.status === 'hadir' || r.status === 'ontime' || !String(r.inStatus || '').startsWith('Telat');
      const mins = parseTimeMinutes(r.in);
      return isOntime && (mins === null || mins >= 465);
    };
  } else if (kategori === 'Shift Pagi') {
    filterFn = (r) => {
      const mins = parseTimeMinutes(r.in);
      return mins !== null && mins < 420;
    };
  } else if (kategori === 'Shift Middle') {
    filterFn = (r) => {
      const mins = parseTimeMinutes(r.in);
      return mins !== null && mins >= 660 && mins <= 780;
    };
  } else if (kategori === 'Toleransi (<15 Mnt)') {
    filterFn = (r) => (r.status === 'late' || r.status === 'terlambat' || String(r.inStatus || '').startsWith('Telat')) && parseMinutesLate(r.inStatus) < 15;
  } else if (kategori === 'Sedang (15 - 30 Mnt)') {
    filterFn = (r) => (r.status === 'late' || r.status === 'terlambat' || String(r.inStatus || '').startsWith('Telat')) && parseMinutesLate(r.inStatus) >= 15 && parseMinutesLate(r.inStatus) < 30;
  } else if (kategori === 'Berat (>30 Mnt)') {
    filterFn = (r) => (r.status === 'late' || r.status === 'terlambat' || String(r.inStatus || '').startsWith('Telat')) && parseMinutesLate(r.inStatus) >= 30;
  } else if (kategori === 'Lupa Tap Out/In') {
    filterFn = (r) => r.outStatus === 'Belum Tap' || !r.out || r.out === '-';
  }

  if (filterFn) {
    return attendanceToday.filter(filterFn).map((r) => {
      let ket = 'Tepat Waktu';
      if (kategori === 'Sangat Awal (>15 Mnt)') {
        ket = 'Sangat Awal';
      } else if (kategori === 'Tepat Waktu (0-15 Mnt)') {
        ket = 'Tepat Waktu';
      } else if (kategori === 'Shift Pagi') {
        ket = 'Shift Pagi';
      } else if (kategori === 'Shift Middle') {
        ket = 'Shift Middle';
      } else if (kategori === 'Lupa Tap Out/In') {
        ket = 'Belum Tap Pulang';
      } else if (r.inStatus) {
        ket = r.inStatus;
      }

      return {
        id: r.id || `${r.finger}_${kategori}`,
        nama: r.nama || `(PIN ${r.finger})`,
        pin: String(r.finger),
        dept: r.deptDisplay || 'Umum',
        jamMasuk: r.in || '-',
        jamPulang: r.out || '-',
        keterangan: ket,
        status: 'Pending',
      };
    });
  }

  if (['Dinas Luar / Field', 'Sakit (Surat Dokter)', 'Izin Alasan Penting', 'Cuti Tahunan'].includes(kategori)) {
    const catMap = {
      'Dinas Luar / Field': 'dinas',
      'Sakit (Surat Dokter)': 'sakit',
      'Izin Alasan Penting': 'izin',
      'Cuti Tahunan': 'cuti',
    };
    const targetCat = catMap[kategori];
    return permissions
      .filter((p) => p.category === targetCat || p.kategori?.toLowerCase() === targetCat)
      .map((p) => ({
        id: p.id,
        nama: p.employee?.nama || p.nama || 'Karyawan',
        pin: String(p.employee?.pin || p.pin || '-'),
        dept: p.employee?.dept || p.dept || 'Umum',
        jamMasuk: p.jam_mulai || '-',
        jamPulang: p.jam_selesai || '-',
        keterangan: p.keterangan || kategori,
        status: p.status || 'Pending',
      }));
  }

  if (kategori === 'Mangkir 1 Hari' || kategori === 'Mangkir >2 Hari Berturut') {
    const attendedPins = new Set(attendanceToday.map((r) => String(r.finger || r.pin)));
    const permPins = new Set(permissions.map((p) => String(p.employee?.pin || p.pin)));
    return allEmployees
      .filter((e) => !attendedPins.has(String(e.pin)) && !permPins.has(String(e.pin)))
      .map((e) => ({
        id: e.id,
        nama: e.nama,
        pin: String(e.pin),
        dept: e.dept || 'Umum',
        jamMasuk: '-',
        jamPulang: '-',
        keterangan: kategori,
        status: 'Pending',
      }));
  }

  return [];
};

const DEFAULT_CATEGORY_ACTIONS = {
  'Sangat Awal (>15 Mnt)': ['Apresiasi Kedisiplinan', 'Tambah Poin Reward', 'Catatan Positif HR'],
  'Tepat Waktu (0-15 Mnt)': ['Apresiasi Kedisiplinan', 'Tambah Poin Reward', 'Catatan Positif HR', 'Rekomendasi Bonus'],
  'Shift Pagi': ['Verifikasi Jadwal Shift', 'Penyesuaian Jam Kerja', 'Apresiasi Shift Penuh'],
  'Shift Middle': ['Verifikasi Jadwal Shift', 'Penyesuaian Jam Kerja', 'Apresiasi Shift Penuh'],
  'Toleransi (<15 Mnt)': ['Teguran Otomatis System', 'Peringatan Lisan', 'Pemutihan System'],
  'Sedang (15 - 30 Mnt)': ['Potong Uang Makan 50%', 'Form Alasan Keterlambatan', 'Surat Teguran 1', 'Peringatan Tertulis'],
  'Berat (>30 Mnt)': ['Potong Gaji/Transport 100%', 'Pemanggilan HRD', 'SP 1 (Surat Peringatan)', 'Skorsing 1 Hari'],
  'Dinas Luar / Field': ['Approved via Portal', 'Pending Verification', 'Rejected', 'Reimbursement Operasional'],
  'Sakit (Surat Dokter)': ['Approved (Surat Dokter)', 'Verifikasi Faskes / Dokter', 'Izin Pemulihan Lanjutan', 'Rejected (Tanpa Surat)'],
  'Izin Alasan Penting': ['Approved Admin', 'Potong Jatah Cuti', 'Izin Khusus Perusahaan', 'Potong Gaji Proporsional'],
  'Cuti Tahunan': ['Potong Jatah Cuti', 'Approved Direksi', 'Reschedule Cuti'],
  'Mangkir 1 Hari': ['Potong Gaji Harian', 'Surat Panggilan Klarifikasi', 'SP 1 (Surat Peringatan)'],
  'Mangkir >2 Hari Berturut': ['SP 2 (Surat Peringatan)', 'SP 3 (Peringatan Terakhir)', 'Pemanggilan Keluarga', 'Potong Gaji & Tunjangan'],
  'Lupa Tap Out/In': ['Konfirmasi via WA/HRD', 'Koreksi Jam Manual', 'Teguran Lupa Tap', 'Pemutihan Presensi'],
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
  const [permissions, setPermissions] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [savedHrActions, setSavedHrActions] = useState([]);

  const [drillLevel, setDrillLevel] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [tindakanList, setTindakanList] = useState([]);
  const [isKelolaTindakanOpen, setIsKelolaTindakanOpen] = useState(false);

  const [isEksekusiOpen, setIsEksekusiOpen] = useState(false);
  const [selectedTindakanNama, setSelectedTindakanNama] = useState('');
  const [eksekusiRows, setEksekusiRows] = useState([]);
  const [chartRefreshKey, setChartRefreshKey] = useState(0);

  const fetchTindakan = useCallback(async () => {
    try {
      const res = await api.get('/api/admin/master-tindakan');
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setTindakanList(res.data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil master tindakan:', err);
    }
  }, []);

  const handleSaveTindakan = async (data) => {
    try {
      if (data.id) {
        const res = await api.put(`/api/admin/master-tindakan/${data.id}`, data);
        if (res.data && res.data.success) {
          setTindakanList(prev => prev.map(t => (t.id === data.id ? res.data.data : t)));
        }
      } else {
        const res = await api.post('/api/admin/master-tindakan', data);
        if (res.data && res.data.success) {
          setTindakanList(prev => [...prev, res.data.data]);
        }
      }
    } catch (err) {
      console.error('Gagal menyimpan tindakan:', err);
    }
  };

  const handleDeleteTindakan = async (id) => {
    try {
      const res = await api.delete(`/api/admin/master-tindakan/${id}`);
      if (res.data && res.data.success) {
        setTindakanList(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error('Gagal menghapus tindakan:', err);
    }
  };

  const loadDashboardData = useCallback(async () => {
    try {
      const todayStr = getLocalDateString();
      const [attRes, permRes, actionRes, empRes] = await Promise.allSettled([
        api.get('/api/admin/attendance'),
        api.get('/api/admin/permissions'),
        api.get(`/api/admin/employee-hr-actions?tanggal=${todayStr}`),
        api.get('/api/admin/employees'),
      ]);

      if (attRes.status === 'fulfilled' && attRes.value.data) {
        if (attRes.value.data.stats) {
          setStats(attRes.value.data.stats);
        }
        if (attRes.value.data.attendance) {
          setRecentLogs(attRes.value.data.attendance.slice(0, 5));
          const todayRecords = attRes.value.data.attendance.filter((r) => r.tgl === todayStr);
          setAllAttendance(todayRecords.length > 0 ? todayRecords : attRes.value.data.attendance);
        }
      }

      if (permRes.status === 'fulfilled' && permRes.value.data?.permissions) {
        setPermissions(permRes.value.data.permissions);
      }

      if (actionRes.status === 'fulfilled' && actionRes.value.data?.success) {
        setSavedHrActions(actionRes.value.data.data || []);
      }

      if (empRes.status === 'fulfilled' && empRes.value.data?.employees) {
        setAllEmployees(empRes.value.data.employees || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    fetchTindakan();
  }, [loadDashboardData, fetchTindakan]);

  const ontimeCount = stats.hadir - stats.terlambat > 0 ? stats.hadir - stats.terlambat : 0;

  const tepatWaktuRows = useMemo(() => {
    return allAttendance.filter((r) => r.status === 'hadir' || r.status === 'ontime' || !String(r.inStatus || '').startsWith('Telat'));
  }, [allAttendance]);

  const realSangatAwalCount = useMemo(() => {
    return tepatWaktuRows.filter((r) => {
      const mins = parseTimeMinutes(r.in);
      return mins !== null && mins < 465;
    }).length;
  }, [tepatWaktuRows]);

  const realTepatWaktuNormalCount = useMemo(() => {
    return tepatWaktuRows.filter((r) => {
      const mins = parseTimeMinutes(r.in);
      return mins === null || mins >= 465;
    }).length;
  }, [tepatWaktuRows]);

  const sangatAwalCount = tepatWaktuRows.length > 0 ? realSangatAwalCount : Math.round(ontimeCount * 0.4);
  const tepatWaktuNormalCount = tepatWaktuRows.length > 0 ? realTepatWaktuNormalCount : (ontimeCount - Math.round(ontimeCount * 0.4));

  const level1Data = {
    title: "Evaluasi Kedisiplinan & Kehadiran (Bulan Ini)",
    subtitle: "Klik pada salah satu batang status untuk melihat rincian kriteria keparahannya.",
    categories: ['Tepat Waktu', 'Terlambat', 'Izin / Sakit / Dinas', 'Tanpa Ket. (Alpa)'],
    series: [
      {
        name: 'Jumlah Kasus/Pegawai',
        data: [
          ontimeCount,
          stats.terlambat,
          stats.izin,
          Math.max(0, stats.total_karyawan - (stats.hadir + stats.izin))
        ]
      }
    ]
  };

  const toleransiCount = useMemo(() => {
    return allAttendance.filter((r) => (r.status === 'late' || r.status === 'terlambat') && parseMinutesLate(r.inStatus) < 15).length;
  }, [allAttendance]);

  const sedangCount = useMemo(() => {
    return allAttendance.filter((r) => (r.status === 'late' || r.status === 'terlambat') && parseMinutesLate(r.inStatus) >= 15 && parseMinutesLate(r.inStatus) < 30).length;
  }, [allAttendance]);

  const beratCount = useMemo(() => {
    return allAttendance.filter((r) => (r.status === 'late' || r.status === 'terlambat') && parseMinutesLate(r.inStatus) >= 30).length;
  }, [allAttendance]);

  const lupaTapCount = useMemo(() => {
    return allAttendance.filter((r) => r.outStatus === 'Belum Tap' || !r.out || r.out === '-').length;
  }, [allAttendance]);


  const level2Data = {
    'Tepat Waktu': {
      categories: ['Sangat Awal (>15 Mnt)', 'Tepat Waktu (0-15 Mnt)', 'Shift Pagi', 'Shift Middle'],
      series: [{ name: 'Jumlah Pegawai', data: [sangatAwalCount, tepatWaktuNormalCount, 0, 0] }]
    },
    'Terlambat': {
      categories: ['Toleransi (<15 Mnt)', 'Sedang (15 - 30 Mnt)', 'Berat (>30 Mnt)'],
      series: [{ name: 'Jumlah Kasus', data: [toleransiCount || Math.round(stats.terlambat * 0.6), sedangCount || Math.round(stats.terlambat * 0.3), beratCount || Math.round(stats.terlambat * 0.1)] }]
    },
    'Izin / Sakit / Dinas': {
      categories: ['Dinas Luar / Field', 'Sakit (Surat Dokter)', 'Izin Alasan Penting', 'Cuti Tahunan'],
      series: [{ name: 'Jumlah Kasus', data: [stats.izin, 0, 0, 0] }]
    },
    'Tanpa Ket. (Alpa)': {
      categories: ['Mangkir 1 Hari', 'Mangkir >2 Hari Berturut', 'Lupa Tap Out/In'],
      series: [{ name: 'Jumlah Kasus', data: [0, 0, lupaTapCount || stats.belum_pulang] }]
    }
  };

  const getOpsiTindakanForCategory = useCallback((kategori) => {
    const rawItems = tindakanList
      .filter((t) => t.kategori === kategori && t.status === 'aktif')
      .map((t) => t.nama);
    const defaults = DEFAULT_CATEGORY_ACTIONS[kategori] || [];
    const options = ['Tidak Ada Tindakan'];
    [...rawItems, ...defaults].forEach((name) => {
      if (name && !options.includes(name)) {
        options.push(name);
      }
    });
    return options;
  }, [tindakanList]);

  const getEmployeeAction = useCallback((pin, kategori) => {
    const match = savedHrActions.find(
      (a) => String(a.finger) === String(pin) && a.kategori === kategori
    );
    if (match && match.tindakan) {
      return {
        tindakan: match.tindakan,
        status: match.tindakan === 'Tidak Ada Tindakan' ? 'Belum Diproses' : (match.status || 'Selesai'),
      };
    }
    return {
      tindakan: 'Tidak Ada Tindakan',
      status: 'Belum Diproses',
    };
  }, [savedHrActions]);

  const level3Data = useMemo(() => {
    const result = {};
    KATEGORI_TINDAKAN.forEach((kategori) => {
      const actions = getOpsiTindakanForCategory(kategori);
      const pegawaiList = getPegawaiUntukKategori(kategori, allAttendance, permissions, allEmployees);

      const counts = actions.map((act) => {
        return pegawaiList.filter((p) => {
          const current = getEmployeeAction(p.pin, kategori);
          return current.tindakan === act;
        }).length;
      });

      result[kategori] = {
        categories: actions,
        series: [{ name: 'Jumlah Pegawai', data: counts }],
      };
    });
    return result;
  }, [tindakanList, allAttendance, permissions, allEmployees, savedHrActions, getOpsiTindakanForCategory, getEmployeeAction]);

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

  const openEksekusiModal = (kategori, filterAksi = '') => {
    const rawList = getPegawaiUntukKategori(kategori, allAttendance, permissions, allEmployees);
    const withActions = rawList.map((p) => {
      const current = getEmployeeAction(p.pin, kategori);
      return {
        ...p,
        kategori: kategori,
        aksi: current.tindakan,
        status: current.status,
      };
    });

    const matchingPegawai = (filterAksi && filterAksi !== 'Semua Tindakan')
      ? withActions.filter((p) => p.aksi === filterAksi)
      : withActions;

    setSelectedCategory(kategori);
    setSelectedTindakanNama(filterAksi || 'Semua Tindakan');
    setEksekusiRows(matchingPegawai);
    setIsEksekusiOpen(true);
  };

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
      openEksekusiModal(selectedCategory, tindakanNama || 'Semua Tindakan');
    }
  };

  const opsiTindakanUntukModal = useMemo(() => {
    return getOpsiTindakanForCategory(selectedCategory);
  }, [getOpsiTindakanForCategory, selectedCategory]);

  const handleChangeTindakanAksi = async (pin, newAksi, itemKategori = null) => {
    const targetCat = itemKategori || selectedCategory;
    const employee = eksekusiRows.find(
      (r) => String(r.pin) === String(pin) && (!itemKategori || r.kategori === itemKategori)
    );
    if (!employee) return;

    const todayStr = getLocalDateString();
    const newStatus = newAksi === 'Tidak Ada Tindakan' ? 'Belum Diproses' : 'Selesai';

    setEksekusiRows((prev) =>
      prev.map((r) =>
        String(r.pin) === String(pin) && (!itemKategori || r.kategori === itemKategori)
          ? { ...r, aksi: newAksi, status: newStatus }
          : r
      )
    );

    setSavedHrActions((prev) => {
      const existing = prev.filter(
        (a) => !(String(a.finger) === String(pin) && a.kategori === targetCat)
      );
      return [
        ...existing,
        {
          finger: String(pin),
          nama: employee.nama,
          tanggal: todayStr,
          kategori: targetCat,
          tindakan: newAksi,
          status: newStatus,
        },
      ];
    });

    try {
      const res = await api.post('/api/admin/employee-hr-actions', {
        finger: String(pin),
        nama: employee.nama,
        tanggal: todayStr,
        kategori: targetCat,
        tindakan: newAksi,
        status: newStatus,
      });
      if (res.data && res.data.all_actions) {
        setSavedHrActions(res.data.all_actions);
      }
      setChartRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Gagal menyimpan tindakan pegawai:', err);
    }
  };

  const handleBatchApply = async (newAksi, targetPins = null, targetCat = null) => {
    if (!newAksi || eksekusiRows.length === 0) return;

    const todayStr = getLocalDateString();
    const newStatus = newAksi === 'Tidak Ada Tindakan' ? 'Belum Diproses' : 'Selesai';
    const targetSet = targetPins && targetPins.length > 0 ? new Set(targetPins.map(String)) : null;

    const itemsToUpdate = eksekusiRows.filter(
      (r) => (!targetSet || targetSet.has(String(r.pin))) && (!targetCat || r.kategori === targetCat)
    );
    if (itemsToUpdate.length === 0) return;

    const items = itemsToUpdate.map((r) => ({
      finger: String(r.pin),
      nama: r.nama,
      tanggal: todayStr,
      kategori: r.kategori || targetCat || selectedCategory,
      tindakan: newAksi,
      status: newStatus,
    }));

    setEksekusiRows((prev) =>
      prev.map((r) =>
        (!targetSet || targetSet.has(String(r.pin))) && (!targetCat || r.kategori === targetCat)
          ? { ...r, aksi: newAksi, status: newStatus }
          : r
      )
    );

    setSavedHrActions((prev) => {
      const itemKeys = new Set(items.map((it) => `${it.finger}_${it.kategori}`));
      const filtered = prev.filter(
        (a) => !itemKeys.has(`${a.finger}_${a.kategori}`)
      );
      return [...filtered, ...items];
    });

    try {
      const res = await api.post('/api/admin/employee-hr-actions/batch', { items });
      if (res.data && res.data.all_actions) {
        setSavedHrActions(res.data.all_actions);
      }
      setChartRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Gagal menyimpan batch tindakan pegawai:', err);
    }
  };

  const handleCloseEksekusiModal = () => {
    setIsEksekusiOpen(false);
    loadDashboardData();
    setChartRefreshKey((prev) => prev + 1);
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

  const barChartOptions = useMemo(() => ({
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
  }), [drillLevel, activeChart.categories, handleChartClick, chartRefreshKey]);

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
          <h1 className="text-2xl font-bold text-slate-900">Dasbor Utama</h1>
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

      {/* <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
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
      </div> */}

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
                        <ArrowLeft className="w-3.5 h-3.5" /> Kembali
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
              <Chart
                key={`drill-bar-${drillLevel}-${selectedStatus}-${selectedCategory}-${chartRefreshKey}`}
                options={barChartOptions}
                series={activeChart.series}
                type="bar"
                height={280}
              />
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
                        <div>
                          <div className="font-semibold text-sm">{row.nama || (row.finger ? `Karyawan PIN #${row.finger}` : <span className="text-slate-400 italic font-normal">Belum ada nama</span>)}</div>
                          <div className="text-xs text-slate-400">PIN: {row.finger} • {row.deptDisplay || 'Umum'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 font-mono text-slate-700">{row.in || '-'}</td>
                      <td className="px-6 py-3.5">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${(row.status === 'late' || row.status === 'terlambat')
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
                      Belum ada log absensi hari ini. Klik tombol "Sync Log Absensi" untuk menyinkronkan data dari cloud.
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
        onClose={handleCloseEksekusiModal}
        statusTitle={selectedStatus || 'Tepat Waktu'}
        kategoriTitle={selectedCategory}
        tindakanTitle={selectedTindakanNama}
        dataKaryawan={eksekusiRows}
        listKategori={[selectedCategory]}
        defaultKategori={selectedCategory}
        getOpsiTindakanForCategory={getOpsiTindakanForCategory}
        opsiTindakan={opsiTindakanUntukModal}
        onChangeAction={handleChangeTindakanAksi}
        onBatchApply={handleBatchApply}
      />
    </div>
  );
};

export default Dashboard;