import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, MapPin, UploadCloud, Send, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import api from '../lib/api';

const PengajuanModal = ({ isOpen, onClose, type, onSuccess }) => {
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [keterangan, setKeterangan] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName] = useState('');

    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState('');
    const [isLocating, setIsLocating] = useState(false);

    const [cameraActive, setCameraActive] = useState(false);
    const [photoData, setPhotoData] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        if (!isOpen) {
            stopCamera();
            setPhotoData(null);
            setAddress('');
            setLocation(null);
            setFileName('');
            setSelectedFile(null);
            setKeterangan('');
            setStartDate(new Date().toISOString().split('T')[0]);
            setEndDate(new Date().toISOString().split('T')[0]);
            setErrorMsg(null);
        } else if (isOpen && type === 'Dinas') {
            getLocation();
        }
    }, [isOpen, type]);

    const getLocation = () => {
        setIsLocating(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setLocation({ lat, lng });

                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                        const data = await response.json();
                        if (data && data.display_name) {
                            setAddress(data.display_name);
                        }
                    } catch (error) {
                        setAddress('');
                    }
                    setIsLocating(false);
                },
                (error) => {
                    setIsLocating(false);
                },
                { enableHighAccuracy: true }
            );
        } else {
            setIsLocating(false);
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setCameraActive(true);
        } catch (err) {
            alert("Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.");
        }
    };

    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
            const dataUrl = canvasRef.current.toDataURL('image/jpeg');
            setPhotoData(dataUrl);
            stopCamera();
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            setCameraActive(false);
        }
    };

    const retakePhoto = () => {
        setPhotoData(null);
        startCamera();
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setFileName(file.name);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!keterangan.trim()) {
            setErrorMsg('Keterangan atau alasan pengajuan wajib diisi.');
            return;
        }

        try {
            setSubmitting(true);
            setErrorMsg(null);

            const formData = new FormData();
            formData.append('category', type.toLowerCase());
            formData.append('tanggal_mulai', startDate);
            formData.append('tanggal_selesai', endDate);
            formData.append('keterangan', keterangan);

            if (selectedFile) {
                formData.append('lampiran', selectedFile);
            }

            if (photoData) {
                formData.append('photo_base64', photoData);
            }

            if (location) {
                formData.append('latitude', location.lat);
                formData.append('longitude', location.lng);
            }

            if (address) {
                formData.append('location_address', address);
            }

            const res = await api.post('/api/user/permissions', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (onSuccess) {
                onSuccess(res.data.message || `Pengajuan ${type} berhasil dikirimkan.`);
            }

            onClose();
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Gagal mengirimkan pengajuan.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose}></div>

            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Form {type}</h2>
                        <p className="text-xs text-gray-500">
                            {type === 'Sakit' ? 'Sertakan surat dokter jika lebih dari 1 hari' : 
                             type === 'Dinas' ? 'Wajib foto real-time dan lokasi dinas' : 
                             'Keperluan Pribadi atau Izin Khusus'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto custom-scrollbar">
                    {errorMsg && (
                        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" id="pengajuan-modal-form">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Tanggal Mulai</label>
                                <input 
                                    type="date" 
                                    required 
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Tanggal Selesai</label>
                                <input 
                                    type="date" 
                                    required 
                                    value={endDate}
                                    min={startDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition" 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Keterangan / Alasan</label>
                            <textarea 
                                required 
                                rows="3" 
                                value={keterangan}
                                onChange={(e) => setKeterangan(e.target.value)}
                                placeholder={`Jelaskan alasan pengajuan ${type.toLowerCase()}...`} 
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition resize-none"
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                {type === 'Dinas' ? 'Foto Bukti (Kamera Langsung)' : 'Lampiran Dokumen / Foto Bukti'}
                            </label>

                            <div className="relative">
                                {type === 'Dinas' ? (
                                    <div className="w-full border-2 border-orange-200 border-dashed rounded-lg bg-orange-50/50 p-2">
                                        {photoData ? (
                                            <div className="relative rounded overflow-hidden">
                                                <img src={photoData} alt="Captured" className="w-full h-auto rounded" />
                                                <button type="button" onClick={retakePhoto} className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-xs flex items-center gap-1.5 hover:bg-black/80 transition cursor-pointer">
                                                    <RefreshCw className="w-3.5 h-3.5" /> Ulangi
                                                </button>
                                            </div>
                                        ) : cameraActive ? (
                                            <div className="relative rounded overflow-hidden bg-black flex flex-col items-center">
                                                <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
                                                <canvas ref={canvasRef} className="hidden" />
                                                <button type="button" onClick={takePhoto} className="absolute bottom-4 bg-orange-500 text-white font-semibold text-xs px-4 py-2 rounded-full shadow-lg hover:bg-orange-600 transition flex items-center gap-1.5 cursor-pointer">
                                                    <Camera className="w-4 h-4" /> Ambil Foto
                                                </button>
                                            </div>
                                        ) : (
                                            <button type="button" onClick={startCamera} className="w-full flex flex-col items-center justify-center py-6 hover:bg-orange-50 transition rounded-lg cursor-pointer">
                                                <Camera className="w-6 h-6 text-orange-500 mb-1" />
                                                <p className="text-xs text-orange-600 font-medium">Buka Kamera</p>
                                                <p className="text-[10px] text-gray-500 mt-1">Klik untuk mengaktifkan kamera perangkat</p>
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center w-full">
                                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-200 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <UploadCloud className="w-6 h-6 text-gray-400 mb-1" />
                                                <p className="text-xs text-gray-500">Klik untuk upload foto / PDF</p>
                                                {fileName && <p className="text-[10px] text-indigo-600 font-semibold mt-1 truncate max-w-[200px]">{fileName}</p>}
                                            </div>
                                            <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>

                        {type === 'Dinas' && (
                            <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                                    <div className="w-full">
                                        <h4 className="text-xs font-semibold text-gray-800">Lokasi Real-time</h4>
                                        {isLocating ? (
                                            <p className="text-[11px] text-gray-500">Mencari lokasi koordinat GPS...</p>
                                        ) : location ? (
                                            <div className="mt-1">
                                                <p className="text-[11px] text-gray-700 font-medium leading-relaxed mb-0.5">
                                                    {address || "Koordinat berhasil diperoleh"}
                                                </p>
                                                <p className="text-[10px] text-gray-500 font-mono">
                                                    Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                                                </p>
                                            </div>
                                        ) : (
                                            <button type="button" onClick={getLocation} className="text-[11px] text-orange-600 font-medium hover:underline mt-1 cursor-pointer">
                                                Dapatkan ulang lokasi
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 sticky bottom-0">
                    <button type="button" onClick={onClose} disabled={submitting} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 transition cursor-pointer">
                        Batal
                    </button>
                    <button 
                        type="submit" 
                        form="pengajuan-modal-form"
                        disabled={submitting}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm shadow-orange-500/20 cursor-pointer disabled:opacity-60"
                    >
                        {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>{submitting ? 'Mengirim...' : 'Kirim Pengajuan'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PengajuanModal;
