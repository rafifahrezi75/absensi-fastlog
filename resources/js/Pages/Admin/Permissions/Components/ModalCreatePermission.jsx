import React, { useState } from 'react';
import { X, Calendar, Clock, FileText, Upload, Loader2, CheckCircle2, UserCheck } from 'lucide-react';
import api from '../../../../lib/api';

const ModalCreatePermission = ({ isOpen, onClose, onSuccess, employees = [] }) => {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    employee_id: '',
    category: 'izin',
    start_date: today,
    end_date: today,
    start_time: '17:30',
    end_time: '20:30',
    duration: '',
    description: '',
    status: 'pending',
  });

  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee_id) {
      setError('Silakan pilih karyawan terlebih dahulu.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = new FormData();
      payload.append('employee_id', formData.employee_id);
      payload.append('category', formData.category);
      payload.append('tanggal_mulai', formData.start_date);
      payload.append('tanggal_selesai', formData.end_date || formData.start_date);

      if (formData.category === 'lembur' || formData.start_time) {
        payload.append('jam_mulai', formData.start_time);
        payload.append('jam_selesai', formData.end_time);
      }

      if (formData.duration) {
        payload.append('durasi', formData.duration);
      }

      if (formData.description) {
        payload.append('keterangan', formData.description);
      }

      const statusIndo = formData.status === 'pending' ? 'menunggu' : (formData.status === 'approved' ? 'disetujui' : formData.status);
      payload.append('status', statusIndo);

      if (attachment) {
        payload.append('lampiran', attachment);
      }

      const res = await api.post('/api/admin/permissions', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        onSuccess(res.data.message || 'Pengajuan berhasil disimpan ke database.');
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan pengajuan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
              <UserCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Tambah Pengajuan Izin & Lembur</h3>
              <p className="text-xs text-slate-500">Pencatatan izin, cuti, dinas, atau lembur karyawan ke database.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pilih Karyawan <span className="text-rose-500">*</span>
            </label>
            <select
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              required
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">-- Pilih Karyawan --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nama} ({emp.nik || `PIN: ${emp.pin}`}) - {emp.dept || 'Umum'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kategori <span className="text-rose-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="izin">Izin</option>
                <option value="sakit">Sakit</option>
                <option value="cuti">Cuti</option>
                <option value="dinas">Dinas Luar</option>
                <option value="lembur">Lembur</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Status Pengajuan
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="pending">Menunggu Persetujuan</option>
                <option value="approved">Disetujui Langsung</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tanggal Mulai <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tanggal Selesai
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {formData.category === 'lembur' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100">
              <div>
                <label className="block text-xs font-semibold text-indigo-900 mb-1">
                  Jam Mulai Lembur
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-indigo-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-indigo-900 mb-1">
                  Jam Selesai Lembur
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-indigo-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Durasi (Opsional, contoh: 1 Hari / 2 Hari)
              </label>
              <input
                type="text"
                name="duration"
                placeholder="Otomatis dihitung jika dikosongkan"
                value={formData.duration}
                onChange={handleChange}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Keterangan / Keperluan
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <textarea
                name="description"
                rows="3"
                placeholder="Contoh: Mengurus keperluan keluarga / Sakit flu dan istirahat dokter / Penugasan dinas..."
                value={formData.description}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Unggah Lampiran / Dokumen Bukti (Opsional)
            </label>
            <div className="relative">
              <input
                type="file"
                id="file-attachment-input"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-attachment-input"
                className="flex items-center justify-between border border-dashed border-slate-300 rounded-xl p-3 bg-slate-50 hover:bg-slate-100/80 transition cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2 text-slate-600 truncate">
                  <Upload className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {attachment ? attachment.name : 'Pilih file surat dokter / surat tugas (JPG, PNG, PDF maks 5MB)'}
                  </span>
                </div>
                <span className="shrink-0 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 shadow-2xs">
                  Pilih File
                </span>
              </label>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-60"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Simpan Pengajuan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCreatePermission;
