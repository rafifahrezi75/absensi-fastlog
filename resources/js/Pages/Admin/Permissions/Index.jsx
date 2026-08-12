import React, { useState, useCallback, useMemo } from 'react';
import { FileCheck2, Search, Clock, Check, X, Paperclip, Stethoscope, Briefcase, Calendar, MapPin } from 'lucide-react';
import ModalPreview from './Components/ModalPreview';

// Mock Data Awal
const INITIAL_PERMISSIONS = [
  {
    id: 1,
    name: 'Siti Aminah',
    department: 'Finance & Accounting',
    avatar: 'SA',
    category: 'sakit',
    date: '10 Agt 2026',
    duration: '1 Hari',
    description: 'Demam tinggi dan flu, disarankan istirahat oleh dokter.',
    attachment: 'Surat_Dokter_Siti.jpg',
    status: 'pending'
  },
  {
    id: 2,
    name: 'Budi Santoso',
    department: 'Software Engineer',
    avatar: 'BS',
    category: 'lembur',
    date: '10 Agt 2026',
    duration: '17:00 - 20:00 (3 Jam)',
    description: 'Penyelesaian modul payment gateway deadline minggu ini.',
    attachment: null,
    status: 'pending'
  },
  {
    id: 3,
    name: 'Ahmad Rizky',
    department: 'Digital Marketing',
    avatar: 'AR',
    category: 'dinas',
    date: '11 Agt 2026',
    duration: '2 Hari',
    description: 'Meeting dengan klien di Surabaya dan peninjauan lokasi event.',
    attachment: 'Surat_Tugas_Ahmad.pdf',
    status: 'approved'
  },
  {
    id: 4,
    name: 'Rina Melati',
    department: 'HR Admin',
    avatar: 'RM',
    category: 'cuti',
    date: '15 Agt 2026',
    duration: '3 Hari',
    description: 'Acara keluarga di luar kota.',
    attachment: null,
    status: 'rejected'
  }
];

const Permissions = () => {
  // State Data & Filter
  const [permissions, setPermissions] = useState(INITIAL_PERMISSIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // State Modal
  const [modalData, setModalData] = useState({ isOpen: false, title: '', filename: '' });

  const openModalPreview = useCallback((title, filename) => {
    setModalData({ isOpen: true, title, filename });
  }, []);

  const closeModalPreview = useCallback(() => {
    setModalData(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Handler Aksi Setujui / Tolak Status
  const handleUpdateStatus = (id, newStatus) => {
    setPermissions(prev =>
      prev.map(item => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  // Filter Data Dinamis
  const filteredPermissions = useMemo(() => {
    return permissions.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = categoryFilter === '' || item.category === categoryFilter;
      const matchStatus = statusFilter === '' || item.status === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [permissions, searchTerm, categoryFilter, statusFilter]);

  // Badge Kategori Helper
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
      case 'izin':
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {category.toUpperCase()}
          </span>
        );
      default:
        return null;
    }
  };

  // Badge Status Helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'approved':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
            <Check className="w-3 h-3" /> Disetujui
          </span>
        );
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

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Persetujuan Izin & Cuti</h1>
          <p className="text-sm text-slate-500">Tinjau dan proses pengajuan izin, sakit, cuti, dinas, atau lembur dari karyawan.</p>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Menunggu Diproses</span>
            <div className="p-1.5 bg-indigo-100 rounded-lg"><Clock className="w-4 h-4 text-indigo-700" /></div>
          </div>
          <div className="text-2xl font-bold text-indigo-900">
            {permissions.filter(p => p.status === 'pending').length}
          </div>
          <span className="text-[11px] text-indigo-600">Perlu tinjauan segera</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Izin / Cuti</span>
            <div className="p-1.5 bg-slate-50 rounded-lg"><FileCheck2 className="w-4 h-4 text-slate-500" /></div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {permissions.filter(p => p.category === 'cuti' || p.category === 'izin').length}
          </div>
          <span className="text-[11px] text-slate-500">Bulan ini</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sakit</span>
            <div className="p-1.5 bg-slate-50 rounded-lg"><Stethoscope className="w-4 h-4 text-slate-500" /></div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {permissions.filter(p => p.category === 'sakit').length}
          </div>
          <span className="text-[11px] text-slate-500">Bulan ini</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dinas & Lembur</span>
            <div className="p-1.5 bg-slate-50 rounded-lg"><Briefcase className="w-4 h-4 text-slate-500" /></div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {permissions.filter(p => p.category === 'dinas' || p.category === 'lembur').length}
          </div>
          <span className="text-[11px] text-slate-500">Bulan ini</span>
        </div>
      </div>

      {/* SEARCH & FILTER CONTROLS */}
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
          <option value="izin">Izin</option>
          <option value="sakit">Sakit</option>
          <option value="cuti">Cuti</option>
          <option value="dinas">Dinas Luar</option>
          <option value="lembur">Lembur</option>
        </select>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-600 cursor-pointer"
        >
          <option value="">Semua Status</option>
          <option value="pending">Menunggu (Pending)</option>
          <option value="approved">Disetujui</option>
          <option value="rejected">Ditolak</option>
        </select>
      </div>

      {/* TABEL PERSETUJUAN */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th scope="col" className="px-6 py-3.5 font-semibold">Karyawan</th>
                <th scope="col" className="px-6 py-3.5 font-semibold">Kategori</th>
                <th scope="col" className="px-6 py-3.5 font-semibold">Waktu / Tanggal</th>
                <th scope="col" className="px-6 py-3.5 font-semibold">Keterangan</th>
                <th scope="col" className="px-6 py-3.5 font-semibold">Lampiran</th>
                <th scope="col" className="px-6 py-3.5 font-semibold">Status</th>
                <th scope="col" className="px-6 py-3.5 font-semibold text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPermissions.length > 0 ? (
                filteredPermissions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          {item.avatar}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{item.name}</div>
                          <div className="text-xs text-slate-400">{item.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderCategoryBadge(item.category)}
                    </td>
                    <td className="px-6 py-4 text-xs whitespace-nowrap">
                      <div className="font-medium text-slate-800">{item.date}</div>
                      <div className="text-slate-400">{item.duration}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate" title={item.description}>
                      {item.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.attachment ? (
                        <button 
                          onClick={() => openModalPreview(`Lampiran - ${item.name}`, item.attachment)} 
                          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                        >
                          <Paperclip className="w-3.5 h-3.5" /> {item.attachment}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleUpdateStatus(item.id, 'approved')}
                          disabled={item.status === 'approved'}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm flex items-center gap-1 cursor-pointer ${
                            item.status === 'approved' 
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" /> Setujui
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(item.id, 'rejected')}
                          disabled={item.status === 'rejected'}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
                            item.status === 'rejected' 
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" /> Tolak
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-sm text-slate-400">
                    Tidak ada data pengajuan yang sesuai dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PREVIEW */}
      <ModalPreview isOpen={modalData.isOpen} onClose={closeModalPreview} data={modalData} />
    </div>
  );
};

export default Permissions;