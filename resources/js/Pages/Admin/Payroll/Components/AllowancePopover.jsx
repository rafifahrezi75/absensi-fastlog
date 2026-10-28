import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

const AllowancePopover = ({ item, formatIDR }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [style, setStyle] = useState({});
    const [isTop, setIsTop] = useState(false);
    const [arrowLeft, setArrowLeft] = useState(24);
    const triggerRef = useRef(null);
    const timeoutRef = useRef(null);

    const updatePosition = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        const popoverWidth = 330;
        const estimatedHeight = 300;
        // Flip to top if insufficient space below
        const showOnTop = spaceBelow < estimatedHeight && spaceAbove > 200;

        let left = rect.left;
        if (left + popoverWidth > window.innerWidth - 16) {
            left = window.innerWidth - popoverWidth - 16;
        }
        if (left < 16) {
            left = 16;
        }

        const calculatedArrowLeft = Math.max(16, Math.min(rect.left + 24 - left, popoverWidth - 24));

        setIsTop(showOnTop);
        setArrowLeft(calculatedArrowLeft);

        if (showOnTop) {
            setStyle({
                position: 'fixed',
                bottom: `${window.innerHeight - rect.top + 8}px`,
                left: `${left}px`,
                width: `${popoverWidth}px`,
                zIndex: 99999,
            });
        } else {
            setStyle({
                position: 'fixed',
                top: `${rect.bottom + 8}px`,
                left: `${left}px`,
                width: `${popoverWidth}px`,
                zIndex: 99999,
            });
        }
    };

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        updatePosition();
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 180);
    };

    const handlePopoverMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(true);
    };

    const handlePopoverMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 180);
    };

    const toggleOpen = () => {
        if (!isOpen) {
            updatePosition();
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        const onScrollOrResize = () => {
            updatePosition();
        };
        window.addEventListener('scroll', onScrollOrResize, true);
        window.addEventListener('resize', onScrollOrResize);
        return () => {
            window.removeEventListener('scroll', onScrollOrResize, true);
            window.removeEventListener('resize', onScrollOrResize);
        };
    }, [isOpen]);

    const tunjanganList = item.tunjangan_details || [];
    const otBreakdown = item.overtime_breakdown || {};
    const isExempt = item.is_exempt || otBreakdown.is_exempt;

    const totalTunjangan = tunjanganList.reduce((acc, t) => acc + (Number(t.nominal) || 0), 0);
    const totalLembur = isExempt ? 0 : (Number(otBreakdown.total_pay) || Number(item.lembur) || 0);
    const totalBonus = Number(item.bonus) || (totalTunjangan + totalLembur);

    return (
        <div className="relative inline-block mt-1">
            <button
                type="button"
                ref={triggerRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={toggleOpen}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-200 cursor-pointer hover:bg-emerald-200/80 transition"
            >
                <span>Detail Tunjangan</span>
                <Info className="w-3.5 h-3.5 text-emerald-700" />
            </button>

            {isOpen && createPortal(
                <div
                    style={style}
                    onMouseEnter={handlePopoverMouseEnter}
                    onMouseLeave={handlePopoverMouseLeave}
                    className="p-3 bg-slate-900/95 backdrop-blur-xs text-white rounded-xl shadow-2xl text-xs pointer-events-auto whitespace-normal transition animate-in fade-in zoom-in-95"
                >
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-700 mb-2">
                        <span className="font-bold text-emerald-400 text-[11px] uppercase tracking-wider">Detail Tunjangan &amp; Lembur</span>
                        <span className="text-[10px] text-slate-400 font-sans">{item.deptLabel || item.dept || item.periode || 'Karyawan'}</span>
                    </div>

                    {otBreakdown.category_name && !isExempt && (
                        <div className="text-[10px] text-emerald-200/90 font-sans mb-1 pb-1 border-b border-slate-800">
                            Aturan Lembur: <span className="font-semibold text-white">{otBreakdown.category_name}</span>
                        </div>
                    )}

                    <div className="space-y-2 text-[11px] font-sans">
                        {/* Bagian Tunjangan */}
                        <div>
                            <div className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                Komponen Tunjangan:
                            </div>
                            {tunjanganList.length > 0 ? (
                                <div className="space-y-1 pl-1">
                                    {tunjanganList.map((t, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-slate-300">
                                            <span>
                                                {t.nama}
                                                {t.persen ? ` (${t.persen}%)` : ''}:
                                            </span>
                                            <span className="font-mono text-emerald-300">
                                                + {formatIDR(t.nominal || 0)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-[10px] text-slate-400 italic pl-1">
                                    Tidak ada tunjangan tetap
                                </div>
                            )}
                        </div>

                        {/* Bagian Lembur */}
                        <div className="pt-1.5 border-t border-slate-800">
                            <div className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                                Rincian Lembur:
                            </div>
                            {isExempt ? (
                                <div className="text-[10px] text-emerald-300 italic pl-1">
                                    Bebas Lembur (Karyawan Khusus)
                                </div>
                            ) : (
                                <div className="space-y-1.5 pl-1">
                                    {/* Lembur Hari Kerja (Daily) */}
                                    <div className="flex justify-between items-start text-slate-300">
                                        <div>
                                            <div>Hari Kerja (Daily):</div>
                                            <div className="text-[10px] text-slate-400">
                                                {otBreakdown.daily_days || 0} hari (@ {formatIDR(otBreakdown.daily_rate || 50000)})
                                            </div>
                                        </div>
                                        <span className="font-mono text-emerald-300 pt-0.5">
                                            + {formatIDR(otBreakdown.daily_total || 0)}
                                        </span>
                                    </div>

                                    {/* Lembur Akhir Pekan (Weekend) */}
                                    <div className="flex justify-between items-start text-slate-300">
                                        <div>
                                            <div>Akhir Pekan (Weekend):</div>
                                            <div className="text-[10px] text-slate-400">
                                                {otBreakdown.weekend_days || 0} hari (@ {formatIDR(otBreakdown.weekend_rate || 75000)})
                                            </div>
                                        </div>
                                        <span className="font-mono text-emerald-300 pt-0.5">
                                            + {formatIDR(otBreakdown.weekend_total || 0)}
                                        </span>
                                    </div>

                                    {/* Lembur Hari Libur Nasional (Hari Besar) */}
                                    <div className="flex justify-between items-start text-slate-300">
                                        <div>
                                            <div>Hari Libur Nasional (Hari Besar):</div>
                                            <div className="text-[10px] text-slate-400">
                                                {otBreakdown.holiday_days || 0} hari (@ {formatIDR(otBreakdown.holiday_rate || 300000)})
                                            </div>
                                        </div>
                                        <span className="font-mono text-emerald-300 pt-0.5">
                                            + {formatIDR(otBreakdown.holiday_total || 0)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Baris paling bawah: Total Tunjangan & Lembur */}
                        <div className="pt-2 border-t border-slate-700 flex justify-between items-center font-bold">
                            <span className="text-slate-200">Total Tunjangan &amp; Lembur:</span>
                            <span className="font-mono text-emerald-400 text-xs">+ {formatIDR(totalBonus)}</span>
                        </div>
                    </div>

                    {/* Arrow */}
                    <div
                        className={`absolute w-2.5 h-2.5 bg-slate-900/95 rotate-45 ${
                            isTop ? '-bottom-1' : '-top-1'
                        }`}
                        style={{ left: `${arrowLeft}px` }}
                    ></div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default AllowancePopover;
