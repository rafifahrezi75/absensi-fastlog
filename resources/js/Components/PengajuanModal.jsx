import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, MapPin, UploadCloud, Send, RefreshCw, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import api from '../lib/api';

const PengajuanModal = ({ isOpen, onClose, type, onSuccess, employee, overtimeRules, todayAttendance }) => {
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
    const [mediaStream, setMediaStream] = useState(null);
    const [photoData, setPhotoData] = useState(null);
    const [photoTime, setPhotoTime] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const [izinSakitType, setIzinSakitType] = useState('izin');
    const [tapType, setTapType] = useState('out');
    const [tipeLembur, setTipeLembur] = useState('DAILY');
    const [jamMulaiLembur, setJamMulaiLembur] = useState('');

    const isLapangan = employee?.kategori_staf === 'LAPANGAN' || overtimeRules?.staff_category === 'LAPANGAN';
    const dailyRate = overtimeRules?.daily_rate ?? 50000;
    const weekendRate = overtimeRules?.weekend_rate ?? 75000;
    const holidayRate = overtimeRules?.holiday_rate ?? 300000;
    const dailyStart = overtimeRules?.daily_start ?? (isLapangan ? '16:31' : '17:00');
    const weekendStart = overtimeRules?.weekend_start ?? (isLapangan ? '12:01' : '13:00');

    const needsCamera = type === 'Dinas' || type === 'Absensi';

    useEffect(() => {
        if (!isOpen) {
            stopCamera();
            setPhotoData(null);
            setPhotoTime(null);
            setAddress('');
            setLocation(null);
            setFileName('');
            setSelectedFile(null);
            setKeterangan('');
            setStartDate(new Date().toISOString().split('T')[0]);
            setEndDate(new Date().toISOString().split('T')[0]);
            setErrorMsg(null);
            setIzinSakitType('izin');
            setTapType('out');
            setTipeLembur('DAILY');
            setJamMulaiLembur('');
        } else if (isOpen && type === 'Dinas') {
            getLocation();
            setKeterangan(prev => prev ? prev : "Instansi / Tempat Tujuan: \nKeperluan / Agenda: \nEstimasi Jam: \nKendaraan: ");
        } else if (isOpen && type === 'Lembur') {
            // Dikosongkan sesuai permintaan agar tidak ada format bawaan di dalam text box
            setKeterangan('');
        } else if (isOpen && type === 'Absensi') {
            getLocation();
            if (todayAttendance?.has_tap_in) {
                setTapType('out');
            } else {
                setTapType('in');
            }
            setKeterangan(prev => prev ? prev : "Alasan tidak bisa tap di kantor:\nLokasi Kerja: ");
        }
    }, [isOpen, type, todayAttendance]);

    useEffect(() => {
        if (type === 'Lembur' && startDate) {
            const d = new Date(startDate + 'T00:00:00');
            const day = d.getDay();
            if (day === 0 || day === 6) {
                setTipeLembur('WEEKENDS');
            } else {
                setTipeLembur('DAILY');
            }
        }
    }, [startDate, type]);

    useEffect(() => {
        if (cameraActive && videoRef.current && mediaStream) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.play().catch(() => { });
        }
    }, [cameraActive, mediaStream]);

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
                () => { setIsLocating(false); },
                { enableHighAccuracy: true }
            );
        } else {
            setIsLocating(false);
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setMediaStream(stream);
            setCameraActive(true);
        } catch (err) {
            alert("Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.");
        }
    };

    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            const w = video.videoWidth || 640;
            const h = video.videoHeight || 480;
            canvas.width = w;
            canvas.height = h;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, w, h);

            const bannerHeight = Math.max(90, Math.floor(h * 0.24));
            const yStart = h - bannerHeight;

            const gradient = ctx.createLinearGradient(0, yStart, 0, h);
            gradient.addColorStop(0, 'rgba(15, 23, 42, 0.45)');
            gradient.addColorStop(0.35, 'rgba(15, 23, 42, 0.88)');
            gradient.addColorStop(1, 'rgba(15, 23, 42, 0.96)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, yStart, w, bannerHeight);

            const pinX = 22;
            const pinY = yStart + 22;
            ctx.fillStyle = '#EA4335';
            ctx.beginPath();
            ctx.arc(pinX, pinY, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(pinX, pinY, 2.5, 0, Math.PI * 2);
            ctx.fill();

            const now = new Date();
            const timeStr = now.toLocaleDateString('id-ID', {
                weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'
            }) + ', ' + now.toLocaleTimeString('id-ID') + ' WIB';

            const coordStr = location
                ? `GPS: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
                : 'GPS: Memindai koordinat...';

            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';

            ctx.fillStyle = '#FF7A3D';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText('PT FASTLOG ERA MANDIRI', 36, yStart + 16);

            ctx.fillStyle = '#38BDF8';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText('• Google Maps Location', 195, yStart + 16);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 11px sans-serif';
            let displayAddr = address || (type === 'Absensi' ? 'Lokasi Absensi Lapangan' : 'Lokasi Dinas Luar Kantor');
            if (displayAddr.length > 55) {
                displayAddr = displayAddr.substring(0, 52) + '...';
            }
            ctx.fillText(displayAddr, 22, yStart + 36);

            ctx.fillStyle = '#CBD5E1';
            ctx.font = '10px sans-serif';
            ctx.fillText(timeStr, 22, yStart + 54);

            ctx.fillStyle = '#FBBF24';
            ctx.font = '10px sans-serif';
            ctx.fillText(coordStr, 22, yStart + 70);

            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            const timeFormatted = now.toTimeString().substring(0, 8);
            setPhotoData(dataUrl);
            setPhotoTime(timeFormatted);
            stopCamera();
        }
    };

    const stopCamera = () => {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            setMediaStream(null);
        }
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
    };

    const retakePhoto = () => {
        setPhotoData(null);
        setPhotoTime(null);
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
        if (needsCamera && !photoData) {
            setErrorMsg('Foto bukti dengan watermark GPS wajib diambil untuk pengajuan ini.');
            return;
        }

        try {
            setSubmitting(true);
            setErrorMsg(null);

            const formData = new FormData();

            let category;
            if (type === 'IzinSakit') {
                category = izinSakitType;
            } else {
                category = type.toLowerCase();
            }
            formData.append('category', category);
            formData.append('tanggal_mulai', startDate);
            formData.append('tanggal_selesai', endDate);

            let finalKeterangan = keterangan;
            if (type === 'Absensi') {
                formData.append('tap_type', tapType);
                const chosenTime = photoTime || new Date().toTimeString().substring(0, 8);
                formData.append('tap_time', `${today} ${chosenTime}`);
            }
            formData.append('keterangan', finalKeterangan);

            if (type === 'Lembur') {
                formData.append('tipe_lembur', tipeLembur);
                if (jamMulaiLembur) {
                    formData.append('jam_mulai', jamMulaiLembur);
                }
            }

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
                onSuccess(res.data.message || 'Pengajuan berhasil dikirimkan.');
            }
            onClose();
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Gagal mengirimkan pengajuan.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const getModalTitle = () => {
        if (type === 'IzinSakit') return 'Form Izin / Sakit';
        if (type === 'Absensi') return 'Form Absensi Luar';
        return `Form ${type}`;
    };

    const getModalDesc = () => {
        if (type === 'Dinas') return 'Wajib foto real-time dan lokasi GPS dinas';
        if (type === 'Lembur') return 'Pengajuan kerja lembur di luar jam kerja normal';
        if (type === 'IzinSakit') return 'Pilih jenis pengajuan: izin pribadi atau sakit';
        if (type === 'Absensi') return 'Tap in/out untuk karyawan lapangan — wajib foto GPS';
        return 'Keperluan Pribadi atau Izin Khusus';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose}></div>

            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{getModalTitle()}</h2>
                        <p className="text-xs text-gray-500">{getModalDesc()}</p>
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

                        {type === 'IzinSakit' && (
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5">
                                <label className="block text-xs font-semibold text-gray-700 mb-2.5">Jenis Pengajuan</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIzinSakitType('izin')}
                                        className={`py-2.5 px-4 rounded-lg text-xs font-semibold border-2 transition cursor-pointer ${izinSakitType === 'izin'
                                            ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                                            }`}
                                    >
                                        Izin Pribadi
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIzinSakitType('sakit')}
                                        className={`py-2.5 px-4 rounded-lg text-xs font-semibold border-2 transition cursor-pointer ${izinSakitType === 'sakit'
                                            ? 'bg-rose-500 border-rose-500 text-white shadow-sm'
                                            : 'bg-white border-rose-200 text-rose-500 hover:border-rose-400'
                                            }`}
                                    >
                                        Sakit
                                    </button>
                                </div>
                                {izinSakitType === 'sakit' && (
                                    <p className="text-[11px] text-rose-600 mt-2 font-medium flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3 shrink-0" />
                                        Sertakan surat keterangan dokter jika lebih dari 1 hari
                                    </p>
                                )}
                            </div>
                        )}

                        {type === 'Absensi' && (
                            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-semibold text-gray-700">Jenis Absensi Luar</label>
                                    <span className="text-[10px] text-teal-800 bg-teal-100 font-semibold px-2 py-0.5 rounded-full border border-teal-200">
                                        1x Tap In & 1x Tap Out / hari
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        disabled={Boolean(todayAttendance?.has_tap_in && todayAttendance?.tap_in_source === 'machine')}
                                        onClick={() => {
                                            if (!(todayAttendance?.has_tap_in && todayAttendance?.tap_in_source === 'machine')) {
                                                setTapType('in');
                                            }
                                        }}
                                        className={`py-2.5 px-3 rounded-lg text-xs font-semibold border-2 transition flex flex-col items-center justify-center gap-0.5 ${
                                            todayAttendance?.has_tap_in && todayAttendance?.tap_in_source === 'machine'
                                                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-75'
                                                : tapType === 'in'
                                                    ? 'bg-teal-600 border-teal-600 text-white shadow-sm cursor-pointer'
                                                    : 'bg-white border-teal-200 text-teal-700 hover:border-teal-400 cursor-pointer'
                                        }`}
                                    >
                                        <span>Tap In (Masuk)</span>
                                        {todayAttendance?.has_tap_in && (
                                            <span className={`text-[10px] ${
                                                todayAttendance?.tap_in_source === 'machine'
                                                    ? 'text-slate-500 font-medium'
                                                    : tapType === 'in' ? 'text-teal-100' : 'text-teal-600'
                                            } font-normal`}>
                                                {todayAttendance?.tap_in_source === 'machine'
                                                    ? `Sudah di mesin (${todayAttendance.tap_in?.time})`
                                                    : `Sudah tercatat (${todayAttendance.tap_in?.time})`}
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTapType('out')}
                                        className={`py-2.5 px-3 rounded-lg text-xs font-semibold border-2 transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${tapType === 'out'
                                            ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                                            : 'bg-white border-teal-200 text-teal-700 hover:border-teal-400'
                                            }`}
                                    >
                                        <span>Tap Out (Pulang)</span>
                                        {todayAttendance?.has_tap_out && (
                                            <span className={`text-[10px] ${tapType === 'out' ? 'text-teal-100' : 'text-teal-600'} font-normal`}>
                                                Sudah tercatat ({todayAttendance.tap_out?.time})
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {todayAttendance?.has_rejected && (
                                    <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200 text-rose-800 text-[11px] leading-relaxed flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-bold block text-rose-900 mb-0.5">Absensi Dihapus / Ditolak:</span>
                                            {todayAttendance.rejected_message || 'Absensi Anda sebelumnya telah dihapus atau ditolak oleh admin. Mohon lakukan absensi ulang dengan foto GPS terbaru.'}
                                        </div>
                                    </div>
                                )}

                                {((tapType === 'in' && todayAttendance?.has_tap_in && todayAttendance?.tap_in_source !== 'machine') || (tapType === 'out' && todayAttendance?.has_tap_out)) && (
                                    <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
                                        <span className="font-bold block text-amber-900 mb-0.5">Mode Koreksi / Edit:</span>
                                        Anda telah mengirim {tapType === 'in' ? 'Tap In' : 'Tap Out'} hari ini. Ambil foto GPS baru dan tuliskan keterangan jika Anda ingin memperbaiki data yang keliru.
                                    </div>
                                )}

                                <p className="text-[11px] text-teal-700 font-medium">
                                    Data absensi luar langsung dicatat ke Log Absensi tanpa masuk lembur. Foto selfie GPS wajib disertakan.
                                </p>
                            </div>
                        )}

                        {type === 'Lembur' && (
                            <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl p-3.5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="block text-xs font-bold text-purple-900">Pilih Kategori Lembur</label>
                                        <p className="text-[11px] text-purple-700">
                                            Sistem Lembur Flat/Ritase ({isLapangan ? 'Staf Lapangan / Operasional' : 'Staf Kantor'})
                                        </p>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200/70 text-purple-800">
                                        {isLapangan ? 'Operasional' : 'Kantor'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setTipeLembur('DAILY')}
                                        className={`p-2.5 rounded-xl text-left border-2 transition cursor-pointer flex flex-col justify-between ${tipeLembur === 'DAILY'
                                            ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                                            : 'bg-white border-purple-100 hover:border-purple-300 text-slate-800'
                                            }`}
                                    >
                                        <div>
                                            <p className="text-xs font-bold">Standby Daily</p>
                                            <p className={`text-[10px] mt-0.5 ${tipeLembur === 'DAILY' ? 'text-purple-100' : 'text-slate-500'}`}>
                                                Senin – Jumat
                                            </p>
                                            <p className={`text-[10px] mt-0.5 font-medium ${tipeLembur === 'DAILY' ? 'text-purple-200' : 'text-purple-600'}`}>
                                                Mulai {dailyStart} WIB
                                            </p>
                                        </div>
                                        <p className={`text-xs font-bold mt-2 ${tipeLembur === 'DAILY' ? 'text-amber-300' : 'text-purple-700'}`}>
                                            Rp {Number(dailyRate).toLocaleString('id-ID')}
                                        </p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setTipeLembur('WEEKENDS')}
                                        className={`p-2.5 rounded-xl text-left border-2 transition cursor-pointer flex flex-col justify-between ${tipeLembur === 'WEEKENDS'
                                            ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                                            : 'bg-white border-purple-100 hover:border-purple-300 text-slate-800'
                                            }`}
                                    >
                                        <div>
                                            <p className="text-xs font-bold">Standby Weekends</p>
                                            <p className={`text-[10px] mt-0.5 ${tipeLembur === 'WEEKENDS' ? 'text-purple-100' : 'text-slate-500'}`}>
                                                Sabtu / Minggu
                                            </p>
                                            <p className={`text-[10px] mt-0.5 font-medium ${tipeLembur === 'WEEKENDS' ? 'text-purple-200' : 'text-purple-600'}`}>
                                                Mulai {weekendStart} WIB
                                            </p>
                                        </div>
                                        <p className={`text-xs font-bold mt-2 ${tipeLembur === 'WEEKENDS' ? 'text-amber-300' : 'text-purple-700'}`}>
                                            Rp {Number(weekendRate).toLocaleString('id-ID')}
                                        </p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setTipeLembur('HARI_BESAR')}
                                        className={`p-2.5 rounded-xl text-left border-2 transition cursor-pointer flex flex-col justify-between ${tipeLembur === 'HARI_BESAR'
                                            ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                                            : 'bg-white border-purple-100 hover:border-purple-300 text-slate-800'
                                            }`}
                                    >
                                        <div>
                                            <p className="text-xs font-bold">Hari Besar</p>
                                            <p className={`text-[10px] mt-0.5 ${tipeLembur === 'HARI_BESAR' ? 'text-purple-100' : 'text-slate-500'}`}>
                                                Libur Nasional
                                            </p>
                                            <p className={`text-[10px] mt-0.5 font-medium ${tipeLembur === 'HARI_BESAR' ? 'text-purple-200' : 'text-purple-600'}`}>
                                                Tarif Flat Harian
                                            </p>
                                        </div>
                                        <p className={`text-xs font-bold mt-2 ${tipeLembur === 'HARI_BESAR' ? 'text-amber-300' : 'text-purple-700'}`}>
                                            Rp {Number(holidayRate).toLocaleString('id-ID')}
                                        </p>
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-1">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-purple-900 mb-1">Jam Mulai Lembur</label>
                                        <input
                                            type="time"
                                            value={jamMulaiLembur}
                                            onChange={(e) => setJamMulaiLembur(e.target.value)}
                                            placeholder={tipeLembur === 'DAILY' ? dailyStart : tipeLembur === 'WEEKENDS' ? weekendStart : '08:00'}
                                            className="w-full bg-white border border-purple-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div className="flex flex-col justify-end text-[10px] text-purple-700 pb-1">
                                        <span>Minimal mulai: <strong className="text-purple-900">{tipeLembur === 'DAILY' ? dailyStart : tipeLembur === 'WEEKENDS' ? weekendStart : 'Fleksibel'}</strong> WIB</span>
                                        <span>Tarif: <strong className="text-purple-900 font-bold">Rp {Number(tipeLembur === 'DAILY' ? dailyRate : tipeLembur === 'WEEKENDS' ? weekendRate : holidayRate).toLocaleString('id-ID')} / hari</strong></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {type === 'Absensi' ? (
                            <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-teal-700 font-semibold uppercase tracking-wider">Tanggal &amp; Waktu Scan</p>
                                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                                        {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[11px] px-2.5 py-1 rounded-md bg-teal-600 text-white font-bold inline-block">
                                        {photoTime ? `Waktu Foto: ${photoTime} WIB` : `Waktu Saat Ini: ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`}
                                    </span>
                                    <p className="text-[10px] text-teal-600 mt-0.5">Default jam otomatis saat difoto</p>
                                </div>
                            </div>
                        ) : (
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
                        )}

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-semibold text-gray-700">Keterangan / Alasan</label>
                                {type === 'Dinas' && <span className="text-[10px] text-orange-600 font-medium">Format Dinas Luar Kantor</span>}
                                {/* Tulisan "Format Pengajuan Lembur" di sebelah kanan sudah dihapus */}
                                {type === 'Absensi' && <span className="text-[10px] text-teal-600 font-medium">Alasan Absensi Lapangan</span>}
                            </div>
                            <textarea
                                required
                                rows={type === 'Dinas' || type === 'Lembur' || type === 'Absensi' ? 4 : 3}
                                value={keterangan}
                                onChange={(e) => setKeterangan(e.target.value)}
                                placeholder={
                                    type === 'Dinas'
                                        ? "Instansi / Tempat Tujuan: \nKeperluan / Agenda: \nEstimasi Jam: \nKendaraan: "
                                        : type === 'Lembur'
                                            ? "Isi dengan pekerjaan yang akan dilakukan."
                                            : type === 'Absensi'
                                                ? "Alasan tidak bisa tap di kantor:\nLokasi Kerja: "
                                                : `Jelaskan alasan pengajuan ${type === 'IzinSakit' ? (izinSakitType === 'izin' ? 'izin' : 'sakit') : type.toLowerCase()}...`
                                }
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition resize-none font-mono text-xs"
                            ></textarea>
                            {type === 'Dinas' && (
                                <p className="text-[11px] text-gray-500 mt-1">Lengkapi instansi tujuan, agenda, perkiraan jam pelaksanaan, dan kendaraan yang digunakan.</p>
                            )}
                            {/* {type === 'Lembur' && (
                                <p className="text-[11px] text-gray-500 mt-1">Isi dengan pekerjaan yang akan dilakukan.</p>
                            )} */}
                            {type === 'Absensi' && (
                                <p className="text-[11px] text-gray-500 mt-1">Jelaskan mengapa tidak memungkinkan tap di kantor dan sebutkan lokasi kerja Anda saat ini.</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                {type === 'Dinas' ? 'Foto Bukti Kamera (Watermark Google Maps)' :
                                    type === 'Absensi' ? 'Foto Bukti Lokasi — Wajib (Watermark GPS)' :
                                        'Lampiran Dokumen / Foto Bukti'}
                            </label>

                            <div className="relative">
                                {needsCamera ? (
                                    <div className="w-full border-2 border-orange-200 border-dashed rounded-lg bg-orange-50/50 p-2">
                                        {photoData ? (
                                            <div>
                                                <div className="relative rounded overflow-hidden">
                                                    <img src={photoData} alt="Captured" className="w-full h-auto rounded" />
                                                    <button type="button" onClick={retakePhoto} className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-xs flex items-center gap-1.5 hover:bg-black/80 transition cursor-pointer">
                                                        <RefreshCw className="w-3.5 h-3.5" /> Ulangi
                                                    </button>
                                                </div>
                                                {location && (
                                                    <div className="mt-2 p-2 rounded-lg bg-white border border-orange-200 flex items-center justify-between text-xs">
                                                        <div className="flex items-center gap-1.5 truncate text-gray-700">
                                                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                                            <span className="truncate text-[11px]">{address || `GPS: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`}</span>
                                                        </div>
                                                        <a
                                                            href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold shrink-0 ml-2"
                                                        >
                                                            <span>Google Maps</span>
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        ) : cameraActive ? (
                                            <div className="relative rounded overflow-hidden bg-black flex flex-col items-center">
                                                <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
                                                <canvas ref={canvasRef} className="hidden" />
                                                <button type="button" onClick={takePhoto} className="absolute bottom-4 bg-orange-500 text-white font-semibold text-xs px-4 py-2 rounded-full shadow-lg hover:bg-orange-600 transition flex items-center gap-1.5 cursor-pointer">
                                                    <Camera className="w-4 h-4" /> Ambil Foto + Lokasi GPS
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

                        {needsCamera && (
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
                        <span>
                            {submitting
                                ? 'Mengirim...'
                                : (type === 'Absensi' && ((tapType === 'in' && todayAttendance?.has_tap_in) || (tapType === 'out' && todayAttendance?.has_tap_out)))
                                    ? `Perbarui ${tapType === 'in' ? 'Tap In' : 'Tap Out'}`
                                    : 'Kirim Pengajuan'
                            }
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PengajuanModal;