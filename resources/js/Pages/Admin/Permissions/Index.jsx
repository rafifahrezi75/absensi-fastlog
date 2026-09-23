import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  FileCheck2,
  Search,
  Clock,
  Check,
  X,
  Paperclip,
  Stethoscope,
  Briefcase,
  Calendar,
  Inbox,
  CheckCircle2,
  AlertCircle,
  Play,
  RefreshCw,
  Loader2,
  Plus,
  Trash2
} from 'lucide-react';
import ModalPreview from './Components/ModalPreview';
import ModalCreatePermission from './Components/ModalCreatePermission';
import api from '../../../lib/api';

const Permissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    di_luar_jadwal: 0,
    izin_cuti: 0,
    lembur_dinas: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [notif, setNotif] = useState(null);

  const [modalData, setModalData] = useState({ isOpen: false, title: '', filename: '' });
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [actionModal, setActionModal] = useState({
    isOpen: false,
    item: null,
    type: 'approve',
    as: 'permission',
    note: '',
    loading: false
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    item: null,
    loading: false
  });

  const [simulatorModal, setSimulatorModal] = useState({
    isOpen: false,
    employeeId: '',
    tapTime: '',
    reason: '',
    result: null,
    loading: false
  });

  const [employees, setEmployees] = useState([]);

  const getInitials = (name) => {
    if (!name) return '??';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    if (typeof dateStr === 'string' && (dateStr.includes(' ') || dateStr.includes('T'))) {
      const dPart = dateStr.split(/[ T]/)[0];
      const parts = dPart.split('-');
      if (parts.length === 3) {
        const [y, m, d] = parts;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
      }
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    if (typeof dateStr === 'string' && (dateStr.includes(' ') || dateStr.includes('T'))) {
      const parts = dateStr.split(/[ T]/);
      if (parts[1]) {
        const [h, m] = parts[1].split(':');
        return `${h}:${m} WIB`;
      }
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/permissions', {
        params: { status: 'all' }
      });

      const dbPermissions = (res.data.permissions || []).map(item => {
        const startDate = item.tanggal_mulai || item.start_date;
        const endDate = item.tanggal_selesai || item.end_date;
        let displayDate = formatDate(startDate);
        if (endDate && endDate !== startDate) {
          displayDate = `${formatDate(startDate)} - ${formatDate(endDate)}`;
        }
        const stTime = item.jam_mulai || item.start_time;
        const enTime = item.jam_selesai || item.end_time;
        const durationStr = item.durasi || item.duration || (stTime && enTime ? `${stTime} - ${enTime}` : '1 Hari');
        const rawStatus = (item.status || 'menunggu').toLowerCase();
        const normStatus = rawStatus === 'pending' ? 'menunggu' : (rawStatus === 'approved' ? 'disetujui' : (rawStatus === 'rejected' ? 'ditolak' : rawStatus));

        return {
          id: `db_perm_${item.id}`,
          rawId: item.id,
          source: 'permission',
          name: item.employee?.nama || 'Karyawan',
          department: item.employee?.dept || 'Umum',
          avatar: getInitials(item.employee?.nama),
          category: item.category,
          date: displayDate,
          duration: durationStr,
          description: item.keterangan || item.description || '',
          attachment: item.lampiran || item.attachment || null,
          status: normStatus,
          sortTime: item.created_at || startDate
        };
      });

      const dbDiLuarJadwal = (res.data.anomalies || []).map(item => {
        const tapTime = item.waktu_tap || item.tap_time;
        const rawStatus = (item.status || 'MENUNGGU').toLowerCase();
        const normStatus = rawStatus === 'pending' ? 'menunggu' : (rawStatus === 'approved' ? 'disetujui' : (rawStatus === 'rejected' ? 'ditolak' : rawStatus));

        return {
          id: `db_dl_${item.id}`,
          rawId: item.id,
          source: 'anomaly',
          name: item.employee?.nama || 'Karyawan',
          department: item.employee?.dept || 'Umum',
          avatar: getInitials(item.employee?.nama),
          category: 'di_luar_jadwal',
          date: formatDate(tapTime),
          duration: `Tap Mesin (${formatTime(tapTime)})`,
          description: item.alasan || item.reason || '',
          attachment: null,
          status: normStatus,
          sortTime: tapTime
        };
      });

      const dbLembur = (res.data.overtime || []).map(item => {
        const tapTime = item.waktu_tap || item.tap_time;
        const durationMin = item.durasi_menit ?? item.duration_minutes ?? 0;
        const rawStatus = (item.status || 'MENUNGGU').toLowerCase();
        const normStatus = rawStatus === 'pending' ? 'menunggu' : (rawStatus === 'approved' ? 'disetujui' : (rawStatus === 'rejected' ? 'ditolak' : rawStatus));

        return {
          id: `db_lembur_${item.id}`,
          rawId: item.id,
          source: 'overtime',
          name: item.employee?.nama || 'Karyawan',
          department: item.employee?.dept || 'Umum',
          avatar: getInitials(item.employee?.nama),
          category: 'lembur',
          date: formatDate(tapTime),
          duration: `${durationMin} Menit (dari 17:30)`,
          description: item.catatan_admin || item.admin_note || `Tap lembur mesin (${formatTime(tapTime)})`,
          attachment: null,
          status: normStatus,
          sortTime: tapTime
        };
      });

      const unified = [...dbPermissions, ...dbDiLuarJadwal, ...dbLembur].sort((a, b) => {
        return new Date(b.sortTime) - new Date(a.sortTime);
      });

      setPermissions(unified);

      if (res.data.stats) {
        setStats(res.data.stats);
      } else {
        setStats({
          pending: unified.filter(p => p.status === 'menunggu' || p.status === 'pending').length,
          di_luar_jadwal: dbDiLuarJadwal.length,
          izin_cuti: dbPermissions.filter(p => ['izin', 'cuti'].includes(p.category)).length,
          lembur_dinas: dbLembur.length + dbPermissions.filter(p => ['lembur', 'dinas'].includes(p.category)).length
        });
      }
    } catch (err) {
      setNotif({
        type: 'error',
        message: err.response?.data?.message || 'Gagal memuat data izin dan lembur.'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadEmployees = useCallback(async () => {
    try {
      const res = await api.get('/api/admin/employees');
      setEmployees(res.data.employees || []);
    } catch (err) {
      setEmployees([]);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadEmployees();
  }, [loadData, loadEmployees]);

  useEffect(() => {
    if (notif) {
      const timer = setTimeout(() => setNotif(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notif]);

  const openModalPreview = useCallback((title, filename) => {
    setModalData({ isOpen: true, title, filename });
  }, []);

  const closeModalPreview = useCallback(() => {
    setModalData(prev => ({ ...prev, isOpen: false }));
  }, []);

  const openActionModal = (item, type) => {
    setActionModal({
      isOpen: true,
      item,
      type,
      as: 'permission',
      note: '',
      loading: false
    });
  };

  const closeActionModal = () => {
    if (actionModal.loading) return;
    setActionModal({
      isOpen: false,
      item: null,
      type: 'approve',
      as: 'permission',
      note: '',
      loading: false
    });
  };

  const executeStatusUpdate = async (item, type, extra = {}) => {
    const newStatus = type === 'approve' ? 'approved' : 'rejected';
    try {
      if (item.source === 'anomaly') {
        const endpoint = type === 'approve'
          ? `/api/admin/anomalies/${item.rawId}/approve`
          : `/api/admin/anomalies/${item.rawId}/reject`;
        await api.post(endpoint, {
          type: 'anomaly',
          as: extra.as || 'permission',
          catatan_admin: extra.note || undefined,
          admin_note: extra.note || undefined
        });
      } else if (item.source === 'overtime') {
        const endpoint = type === 'approve'
          ? `/api/admin/anomalies/${item.rawId}/approve`
          : `/api/admin/anomalies/${item.rawId}/reject`;
        await api.post(endpoint, {
          type: 'overtime',
          catatan_admin: extra.note || undefined,
          admin_note: extra.note || undefined
        });
      } else if (item.source === 'permission') {
        const endpoint = type === 'approve'
          ? `/api/admin/permissions/${item.rawId}/approve`
          : `/api/admin/permissions/${item.rawId}/reject`;
        await api.post(endpoint, {
          catatan_admin: extra.note || undefined,
          admin_note: extra.note || undefined
        });
      }

      await loadData();

      setNotif({
        type: 'success',
        message: newStatus === 'approved' ? 'Pengajuan berhasil disetujui.' : 'Pengajuan telah ditolak.'
      });
    } catch (err) {
      setNotif({
        type: 'error',
        message: err.response?.data?.message || 'Gagal memproses aksi.'
      });
    }
  };

  const handleSubmitActionModal = async (e) => {
    e.preventDefault();
    if (!actionModal.item) return;

    setActionModal(prev => ({ ...prev, loading: true }));
    await executeStatusUpdate(actionModal.item, actionModal.type, {
      as: actionModal.as,
      note: actionModal.note
    });
    setActionModal({
      isOpen: false,
      item: null,
      type: 'approve',
      as: 'permission',
      note: '',
      loading: false
    });
  };

  const openDeleteModal = (item) => {
    setDeleteModal({
      isOpen: true,
      item,
      loading: false
    });
  };

  const closeDeleteModal = () => {
    if (deleteModal.loading) return;
    setDeleteModal({
      isOpen: false,
      item: null,
      loading: false
    });
  };

  const executeDeletePermission = async () => {
    if (!deleteModal.item) return;
    try {
      setDeleteModal(p => ({ ...p, loading: true }));
      await api.delete(`/api/admin/permissions/${deleteModal.item.rawId}`);
      await loadData();
      setNotif({
        type: 'success',
        message: 'Data pengajuan berhasil dihapus.'
      });
      closeDeleteModal();
    } catch (err) {
      setNotif({
        type: 'error',
        message: err.response?.data?.message || 'Gagal menghapus pengajuan.'
      });
      setDeleteModal(p => ({ ...p, loading: false }));
    }
  };

  const handleOpenSimulator = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const defaultTime = `${year}-${month}-${day}T${hours}:${minutes}`;

    setSimulatorModal({
      isOpen: true,
      employeeId: employees.length > 0 ? String(employees[0].id) : '',
      tapTime: defaultTime,
      reason: '',
      result: null,
      loading: false
    });
  };

  const setQuickTime = (timeStr) => {
    const today = new Date().toISOString().split('T')[0];
    setSimulatorModal(prev => ({
      ...prev,
      tapTime: `${today}T${timeStr}`
    }));
  };

  const handleSendSimulatedTap = async (e) => {
    e.preventDefault();
    try {
      setSimulatorModal(prev => ({ ...prev, loading: true, result: null }));
      const payload = {
        employee_id: simulatorModal.employeeId,
        tap_time: simulatorModal.tapTime.replace('T', ' ') + ':00',
        reason: simulatorModal.reason || undefined
      };

      const res = await api.post('/api/attendance/tap', payload);
      setSimulatorModal(prev => ({
        ...prev,
        result: { success: true, data: res.data },
        loading: false
      }));
      await loadData();
    } catch (err) {
      setSimulatorModal(prev => ({
        ...prev,
        result: {
          success: false,
          message: err.response?.data?.message || 'Gagal mengirim tap.'
        },
        loading: false
      }));
    }
  };

  const filteredPermissions = useMemo(() => {
    return permissions.filter(item => {
      const searchLower = searchTerm.toLowerCase().trim();

      let matchSearch = true;
      if (searchLower) {
        const nameWords = item.name.toLowerCase().split(' ');
        const descWords = item.description ? item.description.toLowerCase().split(' ') : [];
        const allWords = [...nameWords, ...descWords];
        matchSearch = allWords.some(word => word.startsWith(searchLower));
      }

      const matchCategory = categoryFilter === '' || item.category === categoryFilter;
      const matchStatus = statusFilter === '' || item.status === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [permissions, searchTerm, categoryFilter, statusFilter]);

  const renderCategoryBadge = (category) => {
    switch (category) {
      case 'di_luar_jadwal':
        return (
          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Di Luar Jadwal
          </span>
        );
      case 'sakit':
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
            <Stethoscope className="w-3.5 h-3.5" /> Sakit
          </span>
        );
      case 'lembur':
        return (
          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Lembur
          </span>
        );
      case 'dinas':
        return (
          <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5" /> Dinas Luar
          </span>
        );
      case 'cuti':
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Cuti
          </span>
        );
      case 'izin':
      default:
        return (
          <span className="bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
            <FileCheck2 className="w-3.5 h-3.5" /> Izin
          </span>
        );
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'menunggu':
      case 'pending':
        return (
          <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> Menunggu
          </span>
        );
      case 'disetujui':
      case 'approved':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
            <Check className="w-3 h-3" /> Disetujui
          </span>
        );
      case 'ditolak':
      case 'rejected':
        return (
          <span className="bg-rose-100 text-rose-800 text-xs font-medium px-2.5 py-1 rounded-full border border-rose-200 inline-flex items-center gap-1">
            <X className="w-3 h-3" /> Ditolak
          </span>
        );
      default:
        return null;
    }
  };

  const pendingCount = stats.pending || permissions.filter(p => p.status === 'pending').length;

  return (
    <div className="space-y-6">
      {notif && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm transition shadow-sm ${
          notif.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <div className="flex items-center gap-3">
            {notif.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{notif.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotif(null)}
            className="p-1 hover:bg-black/5 rounded-lg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">Kelola Izin &amp; Lembur</h1>
            {pendingCount > 0 && (
              <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">
                {pendingCount} Menunggu
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">Tinjau dan kelola seluruh pencatatan tap di luar jadwal, lembur mesin, serta pengajuan izin, cuti, dan sakit karyawan.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Pengajuan</span>
          </button>
          <button
            type="button"
            onClick={handleOpenSimulator}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 rounded-xl transition cursor-pointer shadow-sm"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulasi Tap Mesin</span>
          </button>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition cursor-pointer shadow-sm disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Menunggu Diproses</span>
            <div className="p-1.5 bg-amber-50 rounded-lg"><Clock className="w-4 h-4 text-amber-600" /></div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats.pending}
          </div>
          <span className="text-[11px] text-slate-400">Perlu tinjauan admin</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Di Luar Jadwal</span>
            <div className="p-1.5 bg-amber-50 rounded-lg"><Clock className="w-4 h-4 text-amber-700" /></div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats.di_luar_jadwal}
          </div>
          <span className="text-[11px] text-slate-400">Tap jam kerja mesin</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Total Izin &amp; Cuti</span>
            <div className="p-1.5 bg-emerald-50 rounded-lg"><FileCheck2 className="w-4 h-4 text-emerald-600" /></div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats.izin_cuti}
          </div>
          <span className="text-[11px] text-slate-400">Total data tercatat</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Dinas &amp; Lembur</span>
            <div className="p-1.5 bg-indigo-50 rounded-lg"><Briefcase className="w-4 h-4 text-indigo-600" /></div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats.lembur_dinas}
          </div>
          <span className="text-[11px] text-slate-400">Total data tercatat</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari nama karyawan atau keterangan..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
          />
        </div>
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-600 cursor-pointer"
        >
          <option value="">Semua Kategori</option>
          <option value="di_luar_jadwal">Di Luar Jadwal</option>
          <option value="lembur">Lembur</option>
          <option value="izin">Izin</option>
          <option value="sakit">Sakit</option>
          <option value="cuti">Cuti</option>
          <option value="dinas">Dinas Luar</option>
        </select>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-600 cursor-pointer"
        >
          <option value="">Semua Status</option>
          <option value="menunggu">Menunggu</option>
          <option value="disetujui">Disetujui</option>
          <option value="ditolak">Ditolak</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th scope="col" className="px-6 py-3.5 font-semibold">Profil Karyawan</th>
                <th scope="col" className="px-6 py-3.5 font-semibold">Kategori</th>
                <th scope="col" className="px-6 py-3.5 font-semibold">Tanggal</th>
                <th scope="col" className="px-6 py-3.5 font-semibold">Waktu / Durasi</th>
                <th scope="col" className="px-6 py-3.5 font-semibold">Keterangan</th>
                <th scope="col" className="px-6 py-3.5 font-semibold text-center">Status</th>
                <th scope="col" className="px-6 py-3.5 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                      <p className="text-sm font-medium text-slate-600">Memuat data izin dan lembur...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPermissions.length > 0 ? (
                filteredPermissions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          {item.avatar}
                        </div>
                        <div>
                          <div className="font-semibold">{item.name}</div>
                          <div className="text-xs text-slate-400">{item.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderCategoryBadge(item.category)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap font-medium">
                      {item.duration}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      {item.description ? (
                        <div className="truncate text-slate-700" title={item.description}>
                          {item.description}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">
                          Belum ada keterangan
                        </span>
                      )}
                      {item.attachment && (
                        <div>
                          <button
                            type="button"
                            onClick={() => openModalPreview(item.category.toUpperCase(), item.attachment)}
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline mt-1 font-medium cursor-pointer"
                          >
                            <Paperclip className="w-3 h-3" />
                            <span>Lihat Lampiran</span>
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {renderStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openActionModal(item, 'approve')}
                          disabled={item.status === 'approved'}
                          className={`p-1.5 rounded-lg border transition ${
                            item.status === 'approved'
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 cursor-pointer'
                          }`}
                          title="Setujui"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openActionModal(item, 'reject')}
                          disabled={item.status === 'rejected'}
                          className={`p-1.5 rounded-lg border transition ${
                            item.status === 'rejected'
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                              : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 cursor-pointer'
                          }`}
                          title="Tolak"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {item.source === 'permission' && (
                          <button
                            type="button"
                            onClick={() => openDeleteModal(item)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition cursor-pointer"
                            title="Hapus Pengajuan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                        <Inbox className="w-7 h-7 text-slate-300" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-500">
                          {searchTerm || categoryFilter || statusFilter ? 'Data tidak ditemukan' : 'Belum ada data izin dan lembur'}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {searchTerm || categoryFilter || statusFilter
                            ? 'Coba ubah filter atau kata kunci pencarian.'
                            : 'Data izin dan lembur karyawan akan muncul di sini.'}
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

      {actionModal.isOpen && actionModal.item && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`p-1.5 rounded-lg ${
                  actionModal.type === 'approve'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-rose-50 text-rose-600'
                }`}>
                  {actionModal.type === 'approve' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  {actionModal.type === 'approve' ? 'Konfirmasi Persetujuan' : 'Konfirmasi Penolakan'}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeActionModal}
                disabled={actionModal.loading}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitActionModal} className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1">
                <div className="font-semibold text-slate-900">
                  {actionModal.item.name}
                </div>
                <div className="text-slate-500">
                  Waktu: <span className="font-medium text-slate-800">{actionModal.item.date} • {actionModal.item.duration}</span>
                </div>
                <div className="text-slate-500">
                  Kategori: <span className="font-medium text-slate-800 capitalize">{actionModal.item.category.replace('_', ' ')}</span>
                </div>
              </div>

              {actionModal.type === 'approve' && actionModal.item.source === 'anomaly' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Setujui &amp; Perlakukan Sebagai:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setActionModal(p => ({ ...p, as: 'permission' }))}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-center transition cursor-pointer ${
                        actionModal.as === 'permission'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Izin Keluar
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionModal(p => ({ ...p, as: 'check_in' }))}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-center transition cursor-pointer ${
                        actionModal.as === 'check_in'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Jam Masuk
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionModal(p => ({ ...p, as: 'check_out' }))}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-center transition cursor-pointer ${
                        actionModal.as === 'check_out'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Jam Pulang
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan / Keterangan (Opsional):
                </label>
                <textarea
                  rows="2"
                  placeholder="Masukkan keterangan tindak lanjut..."
                  value={actionModal.note}
                  onChange={(e) => setActionModal(p => ({ ...p, note: e.target.value }))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeActionModal}
                  disabled={actionModal.loading}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionModal.loading}
                  className={`px-4 py-2 text-xs font-medium text-white rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm ${
                    actionModal.type === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {actionModal.loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{actionModal.type === 'approve' ? 'Konfirmasi Setujui' : 'Konfirmasi Tolak'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal.isOpen && deleteModal.item && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-3 border border-rose-200">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Hapus Pengajuan?</h3>
              <p className="text-xs text-slate-500">
                Pengajuan untuk <span className="font-semibold text-slate-800">{deleteModal.item.name}</span> ({deleteModal.item.category.toUpperCase()}) akan dihapus permanen dari database.
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleteModal.loading}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDeletePermission}
                disabled={deleteModal.loading}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                {deleteModal.loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Hapus Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {simulatorModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
                  <Play className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Simulator Tap Mesin Absensi
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Uji coba tap di luar jadwal atau lembur langsung ke sistem.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSimulatorModal(p => ({ ...p, isOpen: false }))}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendSimulatedTap} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Karyawan:
                </label>
                <select
                  value={simulatorModal.employeeId}
                  onChange={(e) => setSimulatorModal(p => ({ ...p, employeeId: e.target.value }))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  required
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nama} ({emp.nik || `PIN: ${emp.pin}`}) - {emp.dept || 'Umum'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Waktu Tap:
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setQuickTime('08:10')}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    >
                      08:10 (Masuk)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickTime('10:30')}
                      className="text-[10px] px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 transition border border-amber-200 cursor-pointer"
                    >
                      10:30 (Di Luar Jadwal)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickTime('16:45')}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    >
                      16:45 (Pulang)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickTime('19:15')}
                      className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition border border-indigo-200 cursor-pointer"
                    >
                      19:15 (Lembur)
                    </button>
                  </div>
                </div>
                <input
                  type="datetime-local"
                  value={simulatorModal.tapTime}
                  onChange={(e) => setSimulatorModal(p => ({ ...p, tapTime: e.target.value }))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan / Alasan (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Kosongkan jika log otomatis mesin..."
                  value={simulatorModal.reason}
                  onChange={(e) => setSimulatorModal(p => ({ ...p, reason: e.target.value }))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {simulatorModal.result && (
                <div className={`p-3 rounded-xl border text-xs ${
                  simulatorModal.result.success
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  <div className="font-semibold mb-0.5">
                    {simulatorModal.result.success ? 'Hasil Simulasi Tap:' : 'Gagal:'}
                  </div>
                  <p className="text-[11px]">
                    {simulatorModal.result.success
                      ? simulatorModal.result.data?.message
                      : simulatorModal.result.message}
                  </p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSimulatorModal(p => ({ ...p, isOpen: false }))}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={simulatorModal.loading}
                  className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  {simulatorModal.loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Kirim Tap Simulasi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ModalCreatePermission
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        employees={employees}
        onSuccess={(msg) => {
          setNotif({ type: 'success', message: msg });
          loadData();
        }}
      />

      <ModalPreview isOpen={modalData.isOpen} onClose={closeModalPreview} data={modalData} />
    </div>
  );
};

export default Permissions;