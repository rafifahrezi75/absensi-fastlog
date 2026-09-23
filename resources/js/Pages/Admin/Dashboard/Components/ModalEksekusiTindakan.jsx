import React from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';

// Modal eksekusi tindakan HR (level-3 drill-down).
// - dataKaryawan: daftar pegawai nyata (dari data absensi hari ini) yang cocok dengan kategori yang diklik.
// - opsiTindakan: daftar nama tindakan AKTIF untuk kategori ini, diambil dari master "Kelola Tindakan HR"
//   (dinamis, bukan hardcode) sehingga opsi di dropdown selalu sesuai keputusan/kebijakan perusahaan terbaru.
const ModalEksekusiTindakan = ({
    isOpen,
    onClose,
    kategoriTitle,
    tindakanTitle,
    dataKaryawan,
    opsiTindakan,
    onExecute,
    onChangeAction,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200">

                <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                                Eksekusi Tindakan HR
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-600">
                                {kategoriTitle}
                            </span>
                        </div>
                        <h3 className="font-bold text-slate-800 text-base mt-1">{tindakanTitle}</h3>
                    </div>
                    <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 max-h-[420px] overflow-y-auto">
                    {dataKaryawan && dataKaryawan.length > 0 ? (
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="bg-slate-100/70 text-slate-600 text-xs font-semibold uppercase">
                                    <th className="p-3 rounded-l-lg">Pegawai</th>
                                    <th className="p-3">Departemen</th>
                                    <th className="p-3">Keterangan</th>
                                    <th className="p-3 text-center">Status</th>
                                    <th className="p-3 text-right rounded-r-lg">Aksi HR</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {dataKaryawan.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                                        <td className="p-3">
                                            <div className="font-semibold text-slate-800">{item.nama}</div>
                                            <div className="text-[11px] text-slate-400">PIN: {item.pin}</div>
                                        </td>
                                        <td className="p-3 text-xs text-slate-500">{item.dept}</td>
                                        <td className="p-3 text-xs font-semibold text-rose-600">{item.keterangan}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            {item.status === 'Selesai' ? (
                                                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                                                    <CheckCircle2 className="w-4 h-4" /> Diproses
                                                </span>
                                            ) : (
                                                <div className="flex items-center justify-end gap-2">
                                                    <select
                                                        value={item.aksi}
                                                        onChange={(e) => onChangeAction(item.id, e.target.value)}
                                                        className="text-xs border-slate-200 rounded-lg p-1 bg-slate-50 focus:ring-indigo-500"
                                                    >
                                                        {opsiTindakan.map((opt) => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={() => onExecute(item.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
                                                    >
                                                        <Send className="w-3 h-3" /> Eksekusi
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-8 text-slate-400 text-xs space-y-1">
                            <p>Belum ada data pegawai real-time untuk kategori "{kategoriTitle}".</p>
                            <p className="text-slate-300">
                                Kategori ini belum terhubung ke sumber data (mis. modul jadwal shift/izin) — hubungi tim IT
                                untuk mengaitkannya, atau gunakan tombol gear untuk sekadar mencatat jumlah kasus manual.
                            </p>
                        </div>
                    )}
                </div>

                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[11px] text-slate-400">
                        Opsi tindakan mengikuti master "Kelola Tindakan HR" — ubah lewat ikon gear jika kebijakan berubah.
                    </span>
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition">
                        Tutup
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ModalEksekusiTindakan;
