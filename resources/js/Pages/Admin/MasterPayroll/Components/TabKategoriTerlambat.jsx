import React, { useState } from 'react';
import {
    Clock,
    Plus,
    Edit3,
    Trash2,
    CheckCircle2,
    ShieldCheck,
    ShieldAlert,
    Search,
    AlertCircle,
    UserCheck,
    UserX,
    Sparkles
} from 'lucide-react';

const TabKategoriTerlambat = ({
    categories = [],
    exemptEmployees = [],
    allEmployees = [],
    onOpenModal,
    onDeleteCategory,
    onToggleExemption
}) => {
    const [searchExempt, setSearchExempt] = useState('');
    const [quickSearchEmp, setQuickSearchEmp] = useState('');

    const formatIDR = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    const filteredExempt = exemptEmployees.filter(emp => {
        const q = searchExempt.toLowerCase();
        return (
            (emp.nama && emp.nama.toLowerCase().includes(q)) ||
            (emp.dept && emp.dept.toLowerCase().includes(q)) ||
            (emp.jabatan && emp.jabatan.toLowerCase().includes(q)) ||
            (emp.pin && String(emp.pin).includes(q))
        );
    });

    const candidatesForExemption = allEmployees.filter(emp => {
        if (!quickSearchEmp) return false;
        const q = quickSearchEmp.toLowerCase();
        return (
            (emp.nama && emp.nama.toLowerCase().includes(q)) ||
            (emp.pin && String(emp.pin).includes(q))
        );
    });

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-xl border border-indigo-100 shadow-sm flex items-start justify-between">
                    <div>
                        <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider block mb-1">
                            Total Kategori Terlambat
                        </span>
                        <div className="text-2xl font-bold text-slate-800">
                            {categories.length} <span className="text-sm font-normal text-slate-500">Kategori</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                            Staf Kantor, Lapangan, dan kategori khusus lainnya
                        </p>
                    </div>
                    <div className="p-3 bg-indigo-600 text-white rounded-lg shadow-sm">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-xl border border-emerald-100 shadow-sm flex items-start justify-between">
                    <div>
                        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
                            Standar Toleransi
                        </span>
                        <div className="text-2xl font-bold text-slate-800">
                            3x <span className="text-sm font-normal text-slate-500">/ Bulan</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                            Berlaku khusus untuk keterlambatan tingkat Tier 1
                        </p>
                    </div>
                    <div className="p-3 bg-emerald-600 text-white rounded-lg shadow-sm">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-xl border border-amber-100 shadow-sm flex items-start justify-between">
                    <div>
                        <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block mb-1">
                            Karyawan Khusus Bebas Aturan
                        </span>
                        <div className="text-2xl font-bold text-slate-800">
                            {exemptEmployees.length} <span className="text-sm font-normal text-slate-500">Pegawai</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                            Bebas dari sanksi keterlambatan & lembur
                        </p>
                    </div>
                    <div className="p-3 bg-amber-500 text-white rounded-lg shadow-sm">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h3 className="text-base font-bold text-slate-900">Kategori & Aturan Sanksi Keterlambatan</h3>
                    <p className="text-xs text-slate-500">
                        Aturan penalti per kejadian berdasarkan kelompok jabatan dan durasi menit terlambat.
                    </p>
                </div>
                <button
                    onClick={() => onOpenModal(null)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition shadow-sm cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Kategori Baru
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition"
                    >
                        <div>
                            <div className="p-5 border-b border-slate-100 bg-slate-50/60">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                                            {cat.kode?.substring(0, 3) || 'KAT'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-sm text-slate-900">{cat.nama}</h4>
                                                {cat.is_default && (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-slate-400 font-mono text-[11px]">Kode: {cat.kode}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => onOpenModal(cat)}
                                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition"
                                            title="Edit Kategori & Tiers"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        {!cat.is_default && (
                                            <button
                                                onClick={() => onDeleteCategory(cat.id, cat.nama)}
                                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition"
                                                title="Hapus Kategori"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {cat.deskripsi && (
                                    <p className="text-xs text-slate-600 mb-3 bg-white/80 p-2 rounded border border-slate-200/60">
                                        {cat.deskripsi}
                                    </p>
                                )}

                                <div className="space-y-1.5 text-[11px]">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-600 shrink-0">Toleransi Bulanan:</span>
                                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                                            {cat.toleransi_bulanan}x per bulan (Khusus Tier 1)
                                        </span>
                                    </div>

                                    {Array.isArray(cat.departemen_list) && cat.departemen_list.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-1 pt-1">
                                            <span className="font-semibold text-slate-600 shrink-0">Departemen:</span>
                                            {cat.departemen_list.map((dept, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                                                >
                                                    {dept}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {Array.isArray(cat.jabatan_keywords) && cat.jabatan_keywords.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-1 pt-1">
                                            <span className="font-semibold text-slate-600 shrink-0">Kata Kunci Jabatan:</span>
                                            {cat.jabatan_keywords.map((kw, i) => (
                                                <span
                                                    key={i}
                                                    className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono text-[10px]"
                                                >
                                                    {kw}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4">
                                <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                                    Skema Tingkatan Terlambat (Tiers)
                                </h5>
                                <div className="overflow-x-auto rounded-lg border border-slate-200">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                                            <tr>
                                                <th className="px-3 py-2">Tingkat</th>
                                                <th className="px-3 py-2">Rentang Durasi</th>
                                                <th className="px-3 py-2">Ketentuan Toleransi</th>
                                                <th className="px-3 py-2 text-right">Potongan / Denda</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {cat.tiers && cat.tiers.length > 0 ? (
                                                cat.tiers.map((tier) => (
                                                    <tr key={tier.id} className="hover:bg-slate-50">
                                                        <td className="px-3 py-2 font-bold text-slate-700">
                                                            Tier {tier.tier_order}
                                                        </td>
                                                        <td className="px-3 py-2 font-semibold text-slate-900">
                                                            {tier.nama_tier || `${tier.min_menit} – ${tier.max_menit || '∞'} Menit`}
                                                        </td>
                                                        <td className="px-3 py-2 text-slate-600">
                                                            {tier.ada_toleransi ? (
                                                                <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Toleransi {cat.toleransi_bulanan}x/bln
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-400 italic">
                                                                    Tanpa toleransi
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2 text-right font-mono font-bold text-rose-600">
                                                            {tier.ada_toleransi ? (
                                                                <div className="text-[11px]">
                                                                    <span className="text-slate-400 font-normal line-through mr-1">Rp 0</span>
                                                                    <span>{formatIDR(tier.nominal_denda)}</span>
                                                                    <div className="text-[10px] text-slate-400 font-sans font-normal">
                                                                        ke-4 dst.
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                formatIDR(tier.nominal_denda)
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-4 text-slate-400 italic">
                                                        Belum ada tingkatan denda.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <span>Karyawan terhubung langsung: <strong className="text-slate-700">{cat.employees_count || 0}</strong></span>
                            <button
                                onClick={() => onOpenModal(cat)}
                                className="font-semibold text-indigo-600 hover:text-indigo-800 transition"
                            >
                                Kelola Aturan &rarr;
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-8">
                <div className="p-5 bg-gradient-to-r from-amber-50/80 to-white border-b border-amber-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-slate-900">
                                Daftar Karyawan Khusus (Bebas Denda & Lembur)
                            </h4>
                            <p className="text-xs text-slate-500">
                                Karyawan yang terdaftar tidak akan dikenakan sanksi denda keterlambatan (Rp 0) dan tidak diperhitungkan dalam pembayaran lembur.
                            </p>
                        </div>
                    </div>

                    <div className="w-full md:w-72">
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Cari karyawan bebas sanksi..."
                                value={searchExempt}
                                onChange={(e) => setSearchExempt(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-5 border-b border-slate-100 bg-slate-50/40">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                            Cepat Tambah Pengecualian Karyawan:
                        </span>
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Ketik nama karyawan untuk menambahkan..."
                                value={quickSearchEmp}
                                onChange={(e) => setQuickSearchEmp(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            />
                            {candidatesForExemption.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto divide-y divide-slate-100">
                                    {candidatesForExemption.slice(0, 6).map(candidate => (
                                        <div
                                            key={candidate.id}
                                            className="p-2.5 hover:bg-slate-50 flex items-center justify-between text-xs transition"
                                        >
                                            <div>
                                                <div className="font-semibold text-slate-800">{candidate.nama}</div>
                                                <div className="text-[10px] text-slate-400">
                                                    PIN: #{candidate.idFinger || candidate.pin || '-'} | Dept: {candidate.dept || '-'}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onToggleExemption(candidate.id);
                                                    setQuickSearchEmp('');
                                                }}
                                                className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                                                    candidate.is_exempt
                                                        ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                                }`}
                                            >
                                                {candidate.is_exempt ? 'Batalkan Pengecualian' : '+ Beri Bebas Aturan'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-5 py-3">Nama Karyawan</th>
                                <th className="px-5 py-3">PIN Fingerprint</th>
                                <th className="px-5 py-3">Departemen</th>
                                <th className="px-5 py-3">Jabatan</th>
                                <th className="px-5 py-3">Status Pengkhususan</th>
                                <th className="px-5 py-3 text-center">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredExempt.length > 0 ? (
                                filteredExempt.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-slate-50">
                                        <td className="px-5 py-3 font-semibold text-slate-900">
                                            {emp.nama}
                                        </td>
                                        <td className="px-5 py-3 font-mono text-slate-600">
                                            #{emp.pin || emp.idFinger || '-'}
                                        </td>
                                        <td className="px-5 py-3 text-slate-700">
                                            {emp.dept || '-'}
                                        </td>
                                        <td className="px-5 py-3 text-slate-600">
                                            {emp.jabatan || '-'}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                                                <ShieldCheck className="w-3 h-3 text-amber-600" /> Bebas Denda & Lembur
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <button
                                                type="button"
                                                onClick={() => onToggleExemption(emp.id)}
                                                className="px-2.5 py-1 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 font-medium transition cursor-pointer text-xs"
                                                title="Hapus status pengkhususan karyawan"
                                            >
                                                Hapus Pengkhususan
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-slate-400 italic">
                                        {searchExempt
                                            ? 'Tidak ada karyawan khusus yang cocok dengan pencarian.'
                                            : 'Belum ada karyawan yang diberi pengkhususan (semua karyawan mengikuti aturan keterlambatan dan lembur reguler).'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TabKategoriTerlambat;
