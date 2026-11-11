import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  RefreshCw,
  Loader2,
  Plus,
  Trash2,
  Pencil
} from 'lucide-react';
import ModalPreview from './Components/ModalPreview';
import ModalCreatePermission from './Components/ModalCreatePermission';
import api from '../../../lib/api';
import { useAuth } from '../../../Contexts/AuthContext';
import { showSuccess, showError, showConfirm } from '../../../lib/swal';

const Permissions = () => {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('permissions.create');
  const canUpdate = hasPermission('permissions.update');
  const canApprove = hasPermission('permissions.approve');
  const canReject = hasPermission('permissions.reject');
  const canDelete = hasPermission('permissions.delete');
  const canPreview = hasPermission('permissions.preview');
  const hasRowActions = canApprove || canReject || canUpdate || canDelete;
  const [permissions, setPermissions] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    di_luar_jadwal: 0,
    izin_sakit: 0,
    izin_cuti: 0,
    lembur_dinas: 0
  });
  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialFilter = (key, fallback) => {
    const fromUrl = searchParams.get(key);
    if (fromUrl !== null && fromUrl !== '') return fromUrl;
    try {
      const saved = JSON.parse(sessionStorage.getItem('admin_permissions_filters') || '{}');
      if (saved[key] !== undefined && saved[key] !== '') return saved[key];
    } catch (e) {}
    return fallback;
  };

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(() => getInitialFilter('search', ''));
  const [categoryFilter, setCategoryFilter] = useState(() => getInitialFilter('category', ''));
  const [statusFilter, setStatusFilter] = useState(() => getInitialFilter('status', ''));

  useEffect(() => {
    const filters = {
      search: searchTerm,
      category: categoryFilter,
      status: statusFilter,
    };
    try {
      sessionStorage.setItem('admin_permissions_filters', JSON.stringify(filters));
    } catch (e) {}

    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (categoryFilter) params.set('category', categoryFilter);
    if (statusFilter) params.set('status', statusFilter);
    setSearchParams(params, { replace: true });
  }, [searchTerm, categoryFilter, statusFilter, setSearchParams]);
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

  const [editModal, setEditModal] = useState({
    isOpen: false,
    item: null,
    status: 'disetujui',
    note: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    jam_mulai: '',
    jam_selesai: '',
    tipe_lembur: 'DAILY',
    durasi: '',
    keterangan: '',
    loading: false
  });

  const calculateDurationHours = (start, end) => {
    if (!start || !end) return '';
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return '';
    let min1 = h1 * 60 + m1;
    let min2 = h2 * 60 + m2;
    if (min2 < min1) min2 += 24 * 60;
    const diff = min2 - min1;
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    if (mins > 0) {
      return `${hrs} Jam ${mins} Menit`;
    }
    return `${hrs} Jam`;
  };

  const handleJamChange = (field, val) => {
    setEditModal(prev => {
      const updated = { ...prev, [field]: val };
      const start = field === 'jam_mulai' ? val : prev.jam_mulai;
      const end = field === 'jam_selesai' ? val : prev.jam_selesai;
      if (start && end) {
        updated.durasi = calculateDurationHours(start, end);
      }
      return updated;
    });
  };

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
        let durationStr = item.durasi || item.duration || (stTime && enTime ? `${stTime} - ${enTime}` : '1 Hari');
        if ((item.category || '').toLowerCase() === 'lembur' && item.tipe_lembur) {
          const tipeLabel = item.tipe_lembur === 'HARI_BESAR' 
            ? 'Lembur Hari Besar' 
            : (item.tipe_lembur === 'WEEKENDS' ? 'Standby Weekends' : 'Standby Daily');
          durationStr = `${tipeLabel} (${durationStr})`;
        } else if ((item.category || '').toLowerCase() === 'absensi') {
          durationStr = stTime ? `Absensi Luar (${stTime})` : 'Absensi Luar (GPS)';
        }
        const rawStatus = (item.status || 'menunggu').toLowerCase();
        const normStatus = rawStatus === 'pending' ? 'menunggu' : (rawStatus === 'approved' ? 'disetujui' : (rawStatus === 'rejected' ? 'ditolak' : rawStatus));
        const jamMulaiClean = stTime ? (stTime.length > 5 ? stTime.substring(0, 5) : stTime) : '';
        const jamSelesaiClean = enTime ? (enTime.length > 5 ? enTime.substring(0, 5) : enTime) : '';
        const tglMulaiClean = startDate ? (startDate.length > 10 ? startDate.substring(0, 10) : startDate) : '';
        const tglSelesaiClean = endDate ? (endDate.length > 10 ? endDate.substring(0, 10) : endDate) : tglMulaiClean;

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
          adminNote: item.catatan_admin || item.admin_note || '',
          sortTime: item.created_at || startDate,
          jam_mulai: jamMulaiClean,
          jam_selesai: jamSelesaiClean,
          tanggal_mulai: tglMulaiClean,
          tanggal_selesai: tglSelesaiClean,
          tipe_lembur: item.tipe_lembur || '',
          durasi: item.durasi || '',
          rawItem: item
        };
      });

      const unified = [...dbPermissions].sort((a, b) => {
        return new Date(b.sortTime) - new Date(a.sortTime);
      });

      setPermissions(unified);

      if (res.data.stats) {
        setStats(res.data.stats);
      } else {
        setStats({
          pending: unified.filter(p => p.status === 'menunggu' || p.status === 'pending').length,
          izin_sakit: dbPermissions.filter(p => ['izin', 'sakit', 'cuti', 'dispensasi_payroll'].includes((p.category || '').toLowerCase())).length,
          dinas: dbPermissions.filter(p => (p.category || '').toLowerCase() === 'dinas').length,
          lembur_disetujui: '0 Hari'
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
    if (canCreate) {
      loadEmployees();
    }
  }, [loadData, loadEmployees, canCreate]);

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
      if (item.source === 'overtime') {
        const endpoint = type === 'approve'
          ? `/api/admin/overtime-logs/${item.rawId}/approve`
          : `/api/admin/overtime-logs/${item.rawId}/reject`;
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

      showSuccess(newStatus === 'approved' ? 'Pengajuan berhasil disetujui.' : 'Pengajuan telah ditolak.');
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
    if ((item.category || '').toLowerCase() === 'lembur' || item.source === 'overtime') {
      showError('Data lembur tidak dapat dihapus demi kepatuhan audit dan payroll.');
      return;
    }
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
    if ((deleteModal.item.category || '').toLowerCase() === 'lembur' || deleteModal.item.source === 'overtime') {
      showError('Data lembur tidak dapat dihapus demi kepatuhan audit dan payroll.');
      closeDeleteModal();
      return;
    }
    try {
      setDeleteModal(p => ({ ...p, loading: true }));
      const { rawId, source } = deleteModal.item;
      if (source === 'overtime') {
        await api.delete(`/api/admin/overtime-logs/${rawId}`, {
          params: { type: source, source: source }
        });
      } else {
        await api.delete(`/api/admin/permissions/${rawId}`, {
          params: { source: source }
        });
      }
      await loadData();
      showSuccess('Data berhasil dihapus.');
      closeDeleteModal();
    } catch (err) {
      setNotif({
        type: 'error',
        message: err.response?.data?.message || 'Gagal menghapus data.'
      });
      setDeleteModal(p => ({ ...p, loading: false }));
    }
  };

  const openEditModal = (item) => {
    const raw = item.rawItem || {};
    const normStatus = item.status === 'approved' ? 'disetujui' : (item.status === 'rejected' ? 'ditolak' : (item.status === 'pending' ? 'menunggu' : item.status));

    let jMulai = item.jam_mulai || raw.jam_mulai || '';
    if (jMulai && jMulai.length > 5) jMulai = jMulai.substring(0, 5);

    let jSelesai = item.jam_selesai || raw.jam_selesai || '';
    if (jSelesai && jSelesai.length > 5) jSelesai = jSelesai.substring(0, 5);

    let tMulai = item.tanggal_mulai || raw.tanggal_mulai || '';
    if (tMulai && tMulai.length > 10) tMulai = tMulai.substring(0, 10);

    let tSelesai = item.tanggal_selesai || raw.tanggal_selesai || tMulai || '';
    if (tSelesai && tSelesai.length > 10) tSelesai = tSelesai.substring(0, 10);

    let dur = item.durasi || raw.durasi || '';
    if (!dur && jMulai && jSelesai) {
      dur = calculateDurationHours(jMulai, jSelesai);
    }

    setEditModal({
      isOpen: true,
      item,
      status: normStatus,
      note: item.adminNote || raw.catatan_admin || '',
      tanggal_mulai: tMulai,
      tanggal_selesai: tSelesai,
      jam_mulai: jMulai,
      jam_selesai: jSelesai,
      tipe_lembur: (item.tipe_lembur || raw.tipe_lembur || 'DAILY').toUpperCase(),
      durasi: dur,
      keterangan: item.description || raw.keterangan || '',
      loading: false
    });
  };

  const closeEditModal = () => {
    if (editModal.loading) return;
    setEditModal({
      isOpen: false,
      item: null,
      status: 'disetujui',
      note: '',
      tanggal_mulai: '',
      tanggal_selesai: '',
      jam_mulai: '',
      jam_selesai: '',
      tipe_lembur: 'DAILY',
      durasi: '',
      keterangan: '',
      loading: false
    });
  };

  const handleUpdatePermission = async (e) => {
    e.preventDefault();
    if (!editModal.item) return;

    setEditModal(p => ({ ...p, loading: true }));
    try {
      const { rawId, source, category } = editModal.item;
      const isLembur = (category || '').toLowerCase() === 'lembur';

      const payload = {
        source,
        type: source,
        status: editModal.status,
        catatan_admin: editModal.note,
        keterangan: editModal.keterangan,
      };

      if (isLembur) {
        payload.tanggal_mulai = editModal.tanggal_mulai;
        payload.tanggal_selesai = editModal.tanggal_selesai || editModal.tanggal_mulai;
        payload.jam_mulai = editModal.jam_mulai;
        payload.jam_selesai = editModal.jam_selesai;
        payload.tipe_lembur = editModal.tipe_lembur;
        payload.durasi = editModal.durasi;
      }

      if (source === 'overtime') {
        await api.put(`/api/admin/overtime-logs/${rawId}`, payload);
      } else {
        await api.put(`/api/admin/permissions/${rawId}`, payload);
      }

      await loadData();
      showSuccess('Perubahan data berhasil disimpan.');
      closeEditModal();
    } catch (err) {
      setNotif({
        type: 'error',
        message: err.response?.data?.message || 'Gagal memperbarui data.'
      });
      setEditModal(p => ({ ...p, loading: false }));
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
      {notif && notif.type === 'error' && (
        <div className="p-4 rounded-xl flex items-center justify-between text-sm transition shadow-sm bg-rose-50 text-rose-800 border border-rose-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
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
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">Kelola Izin &amp; Lembur</h1>
            {pendingCount > 0 && (
              <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-200 whitespace-nowrap">
                {pendingCount} Menunggu
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">Tinjau dan kelola seluruh pengajuan izin, sakit, cuti, dinas luar, serta kerja lembur karyawan.</p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition cursor-pointer shadow-sm disabled:opacity-60 whitespace-nowrap"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>
          {canCreate && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition cursor-pointer shadow-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pengajuan</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Menunggu Diproses</span>
            <div className="p-1.5 bg-amber-50 rounded-lg"><Clock className="w-4 h-4 text-amber-600" /></div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats.pending ?? 0}
          </div>
          <span className="text-[11px] text-slate-400">Perlu tinjauan admin</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Izin, Sakit &amp; Cuti</span>
            <div className="p-1.5 bg-emerald-50 rounded-lg"><FileCheck2 className="w-4 h-4 text-emerald-600" /></div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats.izin_sakit ?? 0}
          </div>
          <span className="text-[11px] text-slate-400">Total data tercatat</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Dinas Luar</span>
            <div className="p-1.5 bg-orange-50 rounded-lg"><Briefcase className="w-4 h-4 text-orange-600" /></div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats.dinas ?? 0}
          </div>
          <span className="text-[11px] text-slate-400">Total penugasan dinas</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Total Lembur Disetujui</span>
            <div className="p-1.5 bg-indigo-50 rounded-lg"><Clock className="w-4 h-4 text-indigo-600" /></div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats.lembur_disetujui ?? '0 Hari'}
          </div>
          <span className="text-[11px] text-slate-400">Durasi lembur di-approve</span>
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
                {hasRowActions && (
                  <th scope="col" className="px-6 py-3.5 font-semibold text-center">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={hasRowActions ? 7 : 6} className="py-16 text-center">
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{item.date}</div>
                      {(item.category || '').toLowerCase() === 'lembur' && (item.jam_mulai || item.jam_selesai) && (
                        <div className="text-xs font-mono font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md inline-flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3 text-indigo-600 shrink-0" />
                          <span>{item.jam_mulai || '-'} s/d {item.jam_selesai || '-'}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap font-medium">
                      <div>{item.duration}</div>
                      {(item.category || '').toLowerCase() === 'lembur' && item.tipe_lembur && (
                        <div className="text-[11px] text-slate-400 capitalize mt-0.5 font-normal">
                          {item.tipe_lembur === 'HARI_BESAR' ? 'Hari Besar' : (item.tipe_lembur === 'WEEKENDS' ? 'Standby Weekends' : 'Standby Daily')}
                        </div>
                      )}
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
                      {item.attachment && canPreview && (
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
                    {hasRowActions && (
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {['menunggu', 'pending'].includes(item.status) && canApprove && (
                            <button
                              type="button"
                              onClick={() => openActionModal(item, 'approve')}
                              className="p-1.5 rounded-lg border bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                              title="Setujui"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {['menunggu', 'pending'].includes(item.status) && canReject && (
                            <button
                              type="button"
                              onClick={() => openActionModal(item, 'reject')}
                              className="p-1.5 rounded-lg border bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 transition cursor-pointer"
                              title="Tolak"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                          {canUpdate && (
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition cursor-pointer"
                              title="Edit Detail"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          {canDelete && (item.category || '').toLowerCase() !== 'lembur' && item.source !== 'overtime' && (
                            <button
                              type="button"
                              onClick={() => openDeleteModal(item)}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition cursor-pointer"
                              title="Hapus Data"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={hasRowActions ? 7 : 6} className="py-16 text-center">
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

      {editModal.isOpen && editModal.item && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`bg-white rounded-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            (editModal.item.category || '').toLowerCase() === 'lembur' ? 'max-w-lg' : 'max-w-md'
          }`}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <span className={`p-2 rounded-xl border ${
                  (editModal.item.category || '').toLowerCase() === 'lembur'
                    ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                  <Pencil className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {(editModal.item.category || '').toLowerCase() === 'lembur' ? 'Edit Rincian Lembur' : 'Edit Data Perizinan'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {(editModal.item.category || '').toLowerCase() === 'lembur'
                      ? 'Sesuaikan jam kerja, tanggal, tipe hari, dan status lembur'
                      : 'Perbarui status keputusan atau catatan admin'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                disabled={editModal.loading}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdatePermission} className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Karyawan:</span>
                  <span className="font-bold text-slate-800">{editModal.item.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Departemen:</span>
                  <span className="font-medium text-slate-700">{editModal.item.department}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Kategori:</span>
                  <span className="font-semibold text-indigo-600">{(editModal.item.category || '').toUpperCase()}</span>
                </div>
              </div>

              {(editModal.item.category || '').toLowerCase() === 'lembur' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tanggal Mulai
                      </label>
                      <input
                        type="date"
                        value={editModal.tanggal_mulai}
                        onChange={(e) => setEditModal(p => ({ ...p, tanggal_mulai: e.target.value }))}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tanggal Selesai
                      </label>
                      <input
                        type="date"
                        value={editModal.tanggal_selesai}
                        onChange={(e) => setEditModal(p => ({ ...p, tanggal_selesai: e.target.value }))}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" /> Jam Mulai
                      </label>
                      <input
                        type="time"
                        value={editModal.jam_mulai}
                        onChange={(e) => handleJamChange('jam_mulai', e.target.value)}
                        className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" /> Jam Selesai
                      </label>
                      <input
                        type="time"
                        value={editModal.jam_selesai}
                        onChange={(e) => handleJamChange('jam_selesai', e.target.value)}
                        className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tipe Lembur
                      </label>
                      <select
                        value={editModal.tipe_lembur}
                        onChange={(e) => setEditModal(p => ({ ...p, tipe_lembur: e.target.value }))}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="DAILY">Standby Daily (Hari Kerja)</option>
                        <option value="WEEKENDS">Standby Weekends (Sabtu/Minggu)</option>
                        <option value="HARI_BESAR">Lembur Hari Besar (Libur Nasional)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Durasi Terhitung
                      </label>
                      <input
                        type="text"
                        value={editModal.durasi}
                        onChange={(e) => setEditModal(p => ({ ...p, durasi: e.target.value }))}
                        placeholder="Contoh: 4 Jam"
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Deskripsi / Pekerjaan Lembur:
                    </label>
                    <textarea
                      rows="2"
                      placeholder="Uraian pekerjaan lembur..."
                      value={editModal.keterangan}
                      onChange={(e) => setEditModal(p => ({ ...p, keterangan: e.target.value }))}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Keterangan:
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Keterangan perizinan..."
                    value={editModal.keterangan}
                    onChange={(e) => setEditModal(p => ({ ...p, keterangan: e.target.value }))}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Ubah Keputusan / Status:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditModal(p => ({ ...p, status: 'disetujui' }))}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-medium border transition cursor-pointer ${
                      editModal.status === 'disetujui' || editModal.status === 'approved'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Disetujui
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditModal(p => ({ ...p, status: 'ditolak' }))}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-medium border transition cursor-pointer ${
                      editModal.status === 'ditolak' || editModal.status === 'rejected'
                        ? 'border-rose-600 bg-rose-50 text-rose-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Ditolak
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditModal(p => ({ ...p, status: 'menunggu' }))}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-medium border transition cursor-pointer ${
                      editModal.status === 'menunggu' || editModal.status === 'pending'
                        ? 'border-amber-600 bg-amber-50 text-amber-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Menunggu
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Admin / Alasan Perubahan:
                </label>
                <textarea
                  rows="2"
                  placeholder="Masukkan catatan admin terkait keputusan ini..."
                  value={editModal.note}
                  onChange={(e) => setEditModal(p => ({ ...p, note: e.target.value }))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={editModal.loading}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editModal.loading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  {editModal.loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan Perubahan</span>
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
                Pengajuan untuk <span className="font-semibold text-slate-800">{deleteModal.item.name}</span> ({(deleteModal.item.category || '').toUpperCase()}) akan dihapus permanen dari database.
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

      <ModalCreatePermission
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        employees={employees}
        onSuccess={(msg) => {
          showSuccess(msg || 'Pengajuan izin berhasil dibuat.');
          loadData();
        }}
      />

      {canPreview && (
        <ModalPreview isOpen={modalData.isOpen} onClose={closeModalPreview} data={modalData} />
      )}
    </div>
  );
};

export default Permissions;