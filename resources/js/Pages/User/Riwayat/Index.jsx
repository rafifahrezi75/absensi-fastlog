import React from 'react';
import { Clock, Filter } from 'lucide-react';

const Riwayat = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Riwayat Pengajuan</h2>
                    <p className="text-sm text-gray-500">Daftar semua pengajuan izin, sakit, dan dinas Anda</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700 text-sm">Semua Riwayat</h3>
                    <button className="text-gray-400 hover:text-gray-600">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-8 text-center text-gray-400">
                    <Clock className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                    <p className="text-sm">Riwayat Anda akan muncul di sini (React Migration).</p>
                </div>
            </div>
        </div>
    );
};

export default Riwayat;
