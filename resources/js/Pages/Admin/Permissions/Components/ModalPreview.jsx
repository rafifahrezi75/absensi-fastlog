import React from 'react';
import { X, Image as ImageIcon, ExternalLink, FileText } from 'lucide-react';

const ModalPreview = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  const filename = data?.filename || '';
  const isImage = /\.(jpe?g|png|webp|gif|svg)$/i.test(filename);
  const fileUrl = filename.startsWith('http')
    ? filename
    : `/uploads/permissions/${filename}`;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-white/10">
              {isImage ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </span>
            <h3 className="font-bold text-sm truncate max-w-xs">{data?.title || 'Lampiran Dokumen'}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center justify-center bg-slate-50 min-h-[260px] max-h-[70vh] overflow-y-auto">
          {isImage ? (
            <div className="w-full flex flex-col items-center">
              <img
                src={fileUrl}
                alt={filename}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = e.target.parentElement.querySelector('.image-fallback');
                  if (fallback) fallback.style.display = 'flex';
                }}
                className="max-h-80 max-w-full rounded-xl object-contain border border-slate-200 shadow-xs"
              />
              <div className="image-fallback hidden w-full h-48 bg-slate-200 rounded-xl flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-300">
                <ImageIcon className="w-12 h-12 mb-2" />
                <span className="text-xs font-mono font-medium text-slate-600">{filename}</span>
                <span className="text-[10px] text-slate-400 mt-1">Pratinjau berkas simulasi</span>
              </div>
            </div>
          ) : (
            <div className="w-full h-48 bg-slate-200/60 rounded-xl flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-300 p-4">
              <FileText className="w-12 h-12 text-indigo-500 mb-2" />
              <span className="text-xs font-mono font-semibold text-slate-800 break-all text-center">{filename}</span>
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
              >
                <span>Buka Dokumen</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400 truncate max-w-xs">{filename}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-medium hover:bg-slate-900 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPreview;
