import React, { useState, useEffect } from 'react';
import { X, Save, Info } from 'lucide-react';

const ModalKomponen = ({ isOpen, onClose, onSave, data }) => {
    const [formData, setFormData] = useState({
        nama: '',
        tipe: 'tambahan', 
        metode: 'nominal',
        nilai: '',
        basis: '',
        batasDasar: '',
        kenaPajak: false,
        status: 'aktif'
    });

    useEffect(() => {
        if (data) {
            setFormData({
                nama: data.nama || '',
                tipe: data.tipe || 'tambahan',
                metode: data.metode || 'nominal',
                nilai: data.nilai !== undefined ? data.nilai : '',
                basis: data.basis || '',
                batasDasar: data.batasDasar || '',
                kenaPajak: data.kenaPajak || false,
                status: data.status || 'aktif'
            });
        } else {
            setFormData({
                nama: '',
                tipe: 'tambahan',
                metode: 'nominal',
                nilai: '',
                basis: '',
                batasDasar: '',
                kenaPajak: false,
                status: 'aktif'
            });
        }
    }, [data, isOpen]);

    useEffect(() => {
        if (formData.metode === 'harian') {
            setFormData(prev => ({ ...prev, basis: 'hari_alpha', nilai: 0 }));
        }
    }, [formData.metode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            id: data?.id,
            nilai: formData.metode === 'harian' ? 0 : Number(formData.nilai),
            batasDasar: formData.batasDasar ? Number(formData.batasDasar) : null,
            basis: (formData.metode === 'per_satuan' || formData.metode === 'harian') ? formData.basis : null
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">
                            {data ? 'Edit Komponen Gaji' : 'Tambah Komponen Gaji'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Atur detail komponen tambahan atau potongan.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
                    <form id="form-komponen" onSubmit={handleSubmit} className="space-y-4">
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Nama Komponen <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="nama"
                                value={formData.nama}
                                onChange={handleChange}
                                required
                                placeholder="Contoh: Tunjangan Makan, BPJS Kesehatan"
                                className="w-full text-sm bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipe</label>
                                <select name="tipe" value={formData.tipe} onChange={handleChange} className="w-full text-sm bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow">
                                    <option value="tambahan">Tambahan (Penambah Gaji)</option>
                                    <option value="potongan">Potongan (Pengurang Gaji)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Metode Hitung</label>
                                <select name="metode" value={formData.metode} onChange={handleChange} className="w-full text-sm bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow">
                                    <option value="nominal">Flat Nominal (Tetap)</option>
                                    <option value="persen">Persentase (%)</option>
                                    <option value="per_satuan">Per Satuan / Kejadian</option>
                                    <option value="harian">Harian (Prorata)</option>
                                </select>
                            </div>
                        </div>

                        {formData.metode === 'per_satuan' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Basis Hitung <span className="text-rose-500">*</span>
                                </label>
                                <select name="basis" value={formData.basis} onChange={handleChange} required className="w-full text-sm bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow">
                                    <option value="">Pilih basis hitung...</option>
                                    <option value="kejadian_telat">Per Kejadian Telat</option>
                                    <option value="menit_telat">Per Menit Telat</option>
                                    <option value="hari_hadir">Per Hari Hadir</option>
                                    <option value="hari_alpha">Per Hari Alpha</option>
                                </select>
                            </div>
                        )}

                        {formData.metode !== 'harian' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    {formData.metode === 'nominal' && 'Nilai Nominal (Rp)'}
                                    {formData.metode === 'persen' && 'Persentase (%)'}
                                    {formData.metode === 'per_satuan' && 'Tarif per Satuan (Rp)'}
                                    <span className="text-rose-500"> *</span>
                                </label>
                                <input
                                    type={formData.metode === 'persen' ? 'number' : 'number'}
                                    name="nilai"
                                    value={formData.nilai}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step={formData.metode === 'persen' ? '0.01' : '1'}
                                    max={formData.metode === 'persen' ? '100' : ''}
                                    placeholder={
                                        formData.metode === 'nominal' ? "Contoh: 150000" :
                                        formData.metode === 'persen' ? "Contoh: 1.5" :
                                        "Contoh: 25000"
                                    }
                                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
                                />
                            </div>
                        )}

                        {formData.metode === 'persen' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Batas Dasar Upah Maksimal (Rp) <span className="text-xs text-slate-400 font-normal ml-1">(Opsional)</span>
                                </label>
                                <input
                                    type="number"
                                    name="batasDasar"
                                    value={formData.batasDasar}
                                    onChange={handleChange}
                                    min="0"
                                    placeholder="Contoh: 12000000 (biarkan kosong jika tanpa batas)"
                                    className="w-full text-sm bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full text-sm bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow">
                                    <option value="aktif">Aktif</option>
                                    <option value="nonaktif">Nonaktif</option>
                                </select>
                            </div>
                            <div className="flex items-center h-full pt-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="kenaPajak" checked={formData.kenaPajak} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                                    <span className="text-sm font-medium text-slate-700">Diperhitungkan PPh 21</span>
                                </label>
                            </div>
                        </div>
                        
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 flex gap-2.5 mt-2">
                            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-xs text-blue-800 leading-relaxed">
                                {formData.metode === 'nominal' && 'Komponen bernilai tetap yang ditambahkan/dipotongkan setiap bulannya.'}
                                {formData.metode === 'persen' && 'Komponen dihitung dari persentase gaji pokok.'}
                                {formData.metode === 'per_satuan' && 'Tarif dikalikan dengan jumlah kejadian (dari data absensi).'}
                                {formData.metode === 'harian' && 'Dihitung secara prorata: (Gaji Pokok / Hari Kerja) × Jumlah Hari Alpha.'}
                                {(formData.basis === 'kejadian_telat' || formData.basis === 'menit_telat') && (
                                    <div className="mt-1 font-medium text-blue-900">Catatan: Toleransi keterlambatan diatur di modul absensi; payroll hanya membaca kejadian yang sudah melewati toleransi.</div>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm">
                        Batal
                    </button>
                    <button type="submit" form="form-komponen" className="px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Simpan Data
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ModalKomponen;
