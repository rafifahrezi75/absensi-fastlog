import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

const DeductionPopover = ({ item, lateTiers, formatIDR }) => {
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

        const popoverWidth = 320;
        const estimatedHeight = 280;
        const showOnTop = spaceBelow < estimatedHeight && spaceAbove > 180;

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

    return (
        <div className="relative inline-block mt-1">
            <button
                type="button"
                ref={triggerRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={toggleOpen}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200 cursor-pointer hover:bg-amber-200/80 transition"
            >
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
            </button>

            {isOpen && createPortal(
                <div
                    style={style}
                    onMouseEnter={handlePopoverMouseEnter}
                    onMouseLeave={handlePopoverMouseLeave}
                    className="p-3 bg-slate-900/95 backdrop-blur-xs text-white rounded-xl shadow-2xl text-xs pointer-events-auto whitespace-normal transition animate-in fade-in zoom-in-95"
                >
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-700 mb-2">
                        <span className="font-bold text-amber-400 text-[11px] uppercase tracking-wider">Detail Potongan</span>
                        <span className="text-[10px] text-slate-400 font-sans">{item.deptLabel || item.dept || item.periode || 'Karyawan'}</span>
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

export default DeductionPopover;
