import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

const ModalPreview = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full mx-4 overflow-hidden">
                <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                    <h3 className="font-bold text-sm">{data?.title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 flex flex-col items-center justify-center bg-slate-100 min-h-[250px]">
                    <div className="w-full h-48 bg-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-300">
                        <ImageIcon className="w-12 h-12 mb-2" />
                        <span className="text-xs font-mono font-medium text-slate-600">{data?.filename}</span>
                        <span className="text-[10px] text-slate-400 mt-1">(Tampilan Gambar/Dokumen Bukti User)</span>
                    </div>
                </div>
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition">Tutup</button>
                </div>
            </div>
        </div>
    );
};

export default ModalPreview;
