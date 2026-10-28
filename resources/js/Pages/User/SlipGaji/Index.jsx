import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Printer, FileText, CheckCircle, Clock, Calendar, Download, Loader2, ReceiptText, Info } from 'lucide-react';
import ModalSlip from '../../Admin/Payroll/Components/ModalSlip';
import api from '../../../lib/api';

const getLateTiers = (item) => {
    if (item.late_details?.tiers_breakdown && item.late_details.tiers_breakdown.length > 0) {
        return item.late_details.tiers_breakdown;
    }
    const list = [];
    if (item.late_details?.tier1_count > 0) {
        const penalized = item.late_details.tier1_penalized || 0;
        list.push({
            tier_order: 1,
            nama_tier: 'Kategori 1',
            ada_toleransi: true,
            total_kejadian: item.late_details.tier1_count,
            toleransi_count: item.late_details.tier1_tolerated || 0,
            penalized_count: penalized,
            nominal_denda: penalized > 0 && item.potongan_terlambat > 0 ? Math.round(item.potongan_terlambat / penalized) : 10000,
            deduction: item.potongan_terlambat || 0,
        });
    }
    if (item.late_details?.tier2_count > 0) {
        list.push({
            tier_order: 2,
            nama_tier: 'Kategori 2',
            ada_toleransi: false,
            total_kejadian: item.late_details.tier2_count,
            toleransi_count: 0,
            penalized_count: item.late_details.tier2_count,
            nominal_denda: 0,
            deduction: 0,
        });
    }
    if (item.late_details?.tier3_count > 0) {
        list.push({
            tier_order: 3,
            nama_tier: 'Kategori 3',
            ada_toleransi: false,
            total_kejadian: item.late_details.tier3_count,
            toleransi_count: 0,
            penalized_count: item.late_details.tier3_count,
            nominal_denda: 0,
            deduction: 0,
        });
    }
    if (item.late_details?.tier4_count > 0) {
        list.push({
            tier_order: 4,
            nama_tier: 'Kategori 4',
            ada_toleransi: false,
            total_kejadian: item.late_details.tier4_count,
            toleransi_count: 0,
            penalized_count: item.late_details.tier4_count,
            nominal_denda: 0,
            deduction: 0,
        });
    }
    return list;
};

const SlipGaji = () => {
    const navigate = useNavigate();
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalData, setModalData] = useState({
        isOpen: false,
        nama: '',
        nik: '',
        dept: '',
        deptLabel: '',
        jabatan: '',
        golongan: '',
        gapok: 0,
        tunjangan: 0,
        lembur: 0,
        bonus: 0,
        potongan_terlambat: 0,
        potongan_alpa: 0,
        potongan_lainnya: 0,
        potongan: 0,
        thp: 0,
        hadir: 0,
        terlambat: 0,
        alpa: 0,
        lembur_menit: 0,
        periode: ''
    });

    const fetchPayrolls = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/user/payroll');
            setPayrolls(res.data.payrolls || []);
        } catch (err) {
            console.error('Failed to fetch user payrolls', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPayrolls();
    }, [fetchPayrolls]);

    const formatIDR = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    const openSlip = (item) => {
        const [year, month] = (item.periode || '').split('-');
        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        const formattedPeriode = month ? `${monthNames[parseInt(month, 10) - 1]} ${year}` : item.periode;

        setModalData({
            isOpen: true,
            nama: item.nama,
            idFinger: item.idFinger || item.pin,
            employee_id: item.employee_id,
            nik: item.nik,
            dept: item.dept,
            deptLabel: item.dept,
            jabatan: item.jabatan,
            golongan: item.golongan,
            gapok: item.gapok,
            tunjangan: item.tunjangan,
            lembur: item.lembur,
            bonus: item.bonus,
            potongan_terlambat: item.potongan_terlambat,
            potongan_alpa: item.potongan_alpa,
            potongan_lainnya: item.potongan_lainnya,
            potongan: item.potongan,
            thp: item.thp,
            hadir: item.hadir,
            terlambat: item.terlambat,
            alpa: item.alpa,
            lembur_menit: item.lembur_menit,
            periode: formattedPeriode,
            bpjs_details: item.bpjs_details,
            tunjangan_details: item.tunjangan_details
        });
    };

    const closeModal = () => {
        setModalData(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Slip Gaji Saya</h1>
                    <p className="text-sm text-slate-500">Lihat dan unduh rekap slip gaji bulanan Anda yang telah diterbitkan perusahaan.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 font-semibold text-slate-800 text-sm flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-orange-600" />
                    <span>Daftar Riwayat Slip Gaji</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3.5 font-semibold">Periode</th>
                                <th className="px-6 py-3.5 font-semibold">Gaji Pokok</th>
                                <th className="px-6 py-3.5 font-semibold">Tunjangan & Lembur</th>
                                <th className="px-6 py-3.5 font-semibold">Potongan</th>
                                <th className="px-6 py-3.5 font-semibold">Total Bersih (THP)</th>
                                <th className="px-6 py-3.5 font-semibold">Status</th>
                                <th className="px-6 py-3.5 font-semibold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                                            <p className="text-sm font-medium text-slate-600">Memuat riwayat slip gaji...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : payrolls.length > 0 ? (
                                payrolls.map((item) => {
                                    const lateTiers = getLateTiers(item);

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                    <span>{item.periode}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-700 whitespace-nowrap">
                                                {formatIDR(item.gapok ?? item.gaji_pokok)}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-emerald-600 whitespace-nowrap">
                                                + {formatIDR(item.bonus)}
                                            </td>
                                            <td className="px-6 py-4 text-xs whitespace-nowrap">
                                                {(item.potongan || 0) > 0 ? (
                                                    <div>
                                                        <div className="font-semibold font-mono text-rose-600">- {formatIDR(item.potongan || 0)}</div>
                                                        {(item.potongan_alpa > 0 || item.potongan_terlambat > 0 || item.potongan_lainnya > 0) && (
                                                            <div className="relative group inline-block mt-1">
                                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200 cursor-pointer hover:bg-amber-200/80 transition">
                                                                    <span>
                                                                        {lateTiers.length > 0 && !item.potongan_alpa && !item.potongan_lainnya
                                                                            ? `Telat ${lateTiers.map(t => `Kat ${t.tier_order} (${t.total_kejadian}x)`).join(', ')}`
                                                                            : item.potongan_alpa > 0 && !item.potongan_terlambat && !item.potongan_lainnya
                                                                            ? `Alpa ${item.alpa || 0} Hari`
                                                                            : 'Detail Potongan'}
                                                                    </span>
                                                                    {lateTiers.length > 0 && (item.potongan_alpa > 0 || item.potongan_lainnya > 0) && (
                                                                        lateTiers.map((t, idx) => (
                                                                            <span key={idx} className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-full font-bold">
                                                                                Kat {t.tier_order} ({t.total_kejadian}x)
                                                                            </span>
                                                                        ))
                                                                    )}
                                                                    {item.potongan_terlambat > 0 && lateTiers.length === 0 && (
                                                                        <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-full font-bold">
                                                                            Denda Telat
                                                                        </span>
                                                                    )}
                                                                    {item.alpa > 0 && (item.potongan_terlambat > 0 || item.potongan_lainnya > 0) && (
                                                                        <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded-full font-bold">
                                                                            {item.alpa}h
                                                                        </span>
                                                                    )}
                                                                    <Info className="w-3.5 h-3.5 text-amber-700" />
                                                                </div>

                                                                <div className="absolute left-0 top-full mt-1.5 hidden group-hover:flex flex-col w-80 p-3 bg-slate-900/95 backdrop-blur-xs text-white rounded-xl shadow-2xl z-50 text-xs pointer-events-none whitespace-normal transition animate-in fade-in zoom-in-95">
                                                                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-700 mb-2">
                                                                        <span className="font-bold text-amber-400 text-[11px] uppercase tracking-wider">Detail Potongan</span>
                                                                        <span className="text-[10px] text-slate-400 font-sans">{item.periode || 'Slip Gaji'}</span>
                                                                    </div>
                                                                    {item.late_category && (
                                                                        <div className="text-[10px] text-amber-200/90 font-sans mb-1 pb-1 border-b border-slate-800">
                                                                            Aturan Denda: <span className="font-semibold text-white">{item.late_category}</span>
                                                                        </div>
                                                                    )}
                                                                    <div className="space-y-2 text-[11px] font-sans">
                                                                        {lateTiers.length > 0 ? (
                                                                            <div className="space-y-1.5">
                                                                                {lateTiers.map((tier, idx) => (
                                                                                    <div key={idx} className="space-y-0.5">
                                                                                        <div className="flex justify-between items-center">
                                                                                            <span className="text-slate-300 font-medium">
                                                                                                Kategori {tier.tier_order} ({tier.total_kejadian}x kejadian):
                                                                                            </span>
                                                                                            <span className="font-medium text-amber-300 font-mono">
                                                                                                {tier.deduction > 0 ? `- ${formatIDR(tier.deduction)}` : (tier.penalized_count === 0 ? <span className="text-emerald-400 font-sans text-[10px]">Bebas Denda</span> : `- ${formatIDR(tier.nominal_denda * tier.penalized_count)}`)}
                                                                                            </span>
                                                                                        </div>
                                                                                        {tier.ada_toleransi ? (
                                                                                            <div className="text-[10px] text-slate-400 pl-2 border-l border-slate-700 space-y-0.5">
                                                                                                {tier.toleransi_count > 0 && (
                                                                                                    <div>Toleransi terpakai: <span className="text-emerald-300 font-medium">{tier.toleransi_count}x (Bebas Denda)</span></div>
                                                                                                )}
                                                                                                {tier.penalized_count > 0 ? (
                                                                                                    <div>Denda kejadian: <span className="text-amber-300 font-medium">{tier.penalized_count}x (@ {formatIDR(tier.nominal_denda)})</span></div>
                                                                                                ) : (
                                                                                                    <div className="text-emerald-400">Semua kejadian masih dalam batas toleransi</div>
                                                                                                )}
                                                                                            </div>
                                                                                        ) : (
                                                                                            <div className="text-[10px] text-slate-400 pl-2 border-l border-slate-700">
                                                                                                Denda per kejadian: <span className="text-amber-300 font-medium">{tier.penalized_count}x (@ {formatIDR(tier.nominal_denda)})</span>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        ) : item.potongan_terlambat > 0 ? (
                                                                            <div className="flex justify-between items-center">
                                                                                <span className="text-slate-400">Denda Keterlambatan:</span>
                                                                                <span className="font-medium text-slate-200 font-mono">- {formatIDR(item.potongan_terlambat)}</span>
                                                                            </div>
                                                                        ) : null}

                                                                        {item.potongan_alpa > 0 && (
                                                                            <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                                                                                <span className="text-slate-400">Alpa ({item.alpa || 0} hari):</span>
                                                                                <span className="font-medium text-slate-200 font-mono">- {formatIDR(item.potongan_alpa)}</span>
                                                                            </div>
                                                                        )}
                                                                        {item.potongan_lainnya > 0 && (
                                                                            <div className="pt-1 border-t border-slate-800">
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="text-slate-400">BPJS & Lainnya:</span>
                                                                                    <span className="font-medium text-slate-200 font-mono">- {formatIDR(item.potongan_lainnya)}</span>
                                                                                </div>
                                                                                {item.bpjs_details && item.bpjs_details.length > 0 && (
                                                                                    <div className="mt-1 pl-2 border-l border-slate-700 space-y-0.5 text-[10px] text-slate-400">
                                                                                        {item.bpjs_details.map((b, idx) => (
                                                                                            <div key={idx} className="flex justify-between items-center">
                                                                                                <span>{b.nama}:</span>
                                                                                                <span className="font-mono text-slate-300">- {formatIDR(b.nominal)}</span>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                        <div className="pt-1.5 border-t border-slate-800 flex justify-between items-center font-bold">
                                                                            <span className="text-slate-300">Total Potongan:</span>
                                                                            <span className="font-mono text-rose-400">- {formatIDR(item.potongan || 0)}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="absolute left-6 -top-1 w-2 h-2 bg-slate-900/95 rotate-45"></div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 font-mono">Rp 0</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                                                {formatIDR(item.thp)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {item.status === 'paid' ? (
                                                    <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3" /> Sudah Ditransfer
                                                    </span>
                                                ) : (
                                                    <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> Diproses (Draft)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                <button
                                                    onClick={() => navigate(`/user/slip-gaji/${item.id}`)}
                                                    className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 shadow-sm"
                                                    title="Buka Halaman Detail & Preview PDF"
                                                >
                                                    <FileText className="w-3.5 h-3.5" /> Lihat & Cetak Slip
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                                                <ReceiptText className="w-7 h-7 text-slate-300" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-500">Belum ada slip gaji yang diterbitkan</p>
                                                <p className="text-xs text-slate-400 mt-0.5">Slip gaji akan muncul di sini setelah bagian keuangan atau admin memproses penggajian bulanan.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ModalSlip isOpen={modalData.isOpen} onClose={closeModal} data={modalData} />
        </div>
    );
};

export default SlipGaji;
