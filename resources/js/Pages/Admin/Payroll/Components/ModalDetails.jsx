import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, AlertTriangle, Calendar, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../../../../lib/api';

const ModalDetails = ({ isOpen, onClose, employee, periode, onDataChanged }) => {
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [updatingDate, setUpdatingDate] = useState(null);

    useEffect(() => {
        if (isOpen && employee?.id) {
            fetchDetails();
        }
    }, [isOpen, employee, periode]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/admin/payroll/details?employee_id=${employee.id}&periode=${periode}`);
            setDetails(res.data || []);
        } catch (err) {
            console.error('Failed to load payroll details', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleDispensation = async (item) => {
        setUpdatingDate(item.date);
        try {
            await api.post('/api/admin/payroll/dispense', {
                employee_id: employee.id,
                date: item.date,
                is_dispensed: !item.is_dispensed
            });
            await fetchDetails();
            if (onDataChanged) {
                onDataChanged();
            }
        } catch (err) {
            console.error('Failed to toggle dispensation', err);
        } finally {
            setUpdatingDate(null);
        }
    };

    const formatIDR = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    if (!isOpen || !employee) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
                <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-sm">Rincian Kehadiran & Dispensasi Denda</h3>
                        <p className="text-xs text-slate-300 mt-0.5">{employee.nama} ({employee.jabatan || 'Staff'}) &bull; Periode: {periode}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                    <span>Admin dapat memberikan dispensasi denda untuk keterlambatan atau alpa tertentu secara langsung di bawah ini.</span>
                </div>

                <div className="p-4 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="py-16 flex flex-col items-center justify-center gap-2">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                            <p className="text-xs font-medium text-slate-500">Memuat rincian absensi harian...</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {details.map((item) => {
                                const isUpdating = updatingDate === item.date;
                                const isActionable = (item.type === 'Terlambat' || item.type === 'Alpa / Tidak Hadir');

                                return (
                                    <div
                                        key={item.date}
                                        className={`p-3 rounded-lg border text-xs flex items-center justify-between transition ${
                                            item.is_dispensed
                                                ? 'bg-emerald-50/60 border-emerald-200'
                                                : item.type === 'Terlambat'
                                                ? 'bg-amber-50/50 border-amber-200'
                                                : item.type === 'Alpa / Tidak Hadir'
                                                ? 'bg-rose-50/50 border-rose-200'
                                                : 'bg-white border-slate-200'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-medium">
                                                <Calendar className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900">
                                                    {item.date} <span className="font-normal text-slate-500 text-[11px]">({item.day_name || '-'})</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                                        item.type === 'Tepat Waktu'
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : item.type === 'Terlambat'
                                                            ? 'bg-amber-100 text-amber-800'
                                                            : item.type === 'Alpa / Tidak Hadir'
                                                            ? 'bg-rose-100 text-rose-800'
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {item.type}
                                                    </span>
                                                    {item.first_scan && (
                                                        <span className="text-[10px] text-slate-500">
                                                            Masuk: {item.first_scan} {item.minutes > 0 ? `(+${item.minutes}m)` : ''}
                                                        </span>
                                                    )}
                                                    {item.is_dispensed && (
                                                        <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 font-semibold">
                                                            <ShieldCheck className="w-3 h-3" /> Bebas Denda
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <div className={`font-mono font-medium ${item.deduction > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                                                    {item.deduction > 0 ? `- ${formatIDR(item.deduction)}` : 'Rp 0'}
                                                </div>
                                                {item.is_dispensed && (
                                                    <span className="text-[10px] text-emerald-600 font-medium line-through">Dibatalkan</span>
                                                )}
                                            </div>

                                            {isActionable && (
                                                <button
                                                    onClick={() => handleToggleDispensation(item)}
                                                    disabled={isUpdating}
                                                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition border ${
                                                        item.is_dispensed
                                                            ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                                                            : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-sm'
                                                    }`}
                                                >
                                                    {isUpdating ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    ) : item.is_dispensed ? (
                                                        'Cabut'
                                                    ) : (
                                                        'Dispensasi'
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition"
                    >
                        Selesai
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalDetails;
