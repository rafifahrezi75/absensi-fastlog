<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Slip Gaji - {{ $employee->nama ?? 'Karyawan' }} - {{ $periodeLabel ?? $payroll->periode }}</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 11px;
            color: #1e293b;
            background-color: #ffffff;
            padding: 24px;
            line-height: 1.4;
        }
        .header {
            border-bottom: 2px solid #4338ca;
            padding-bottom: 12px;
            margin-bottom: 16px;
        }
        .company-title {
            font-size: 16px;
            font-weight: bold;
            color: #1e1b4b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .doc-title {
            font-size: 13px;
            font-weight: bold;
            color: #4338ca;
            margin-top: 2px;
        }
        .period-subtitle {
            font-size: 10px;
            color: #64748b;
            margin-top: 2px;
        }
        .info-table {
            width: 100%;
            margin-bottom: 14px;
            border-collapse: collapse;
        }
        .info-table td {
            padding: 3px 0;
            vertical-align: top;
            font-size: 10.5px;
        }
        .info-label {
            color: #64748b;
            width: 18%;
        }
        .info-value {
            color: #0f172a;
            font-weight: 600;
            width: 32%;
        }
        .badge {
            display: inline-block;
            padding: 2px 7px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .badge-paid {
            background-color: #dcfce7;
            color: #166534;
            border: 1px solid #bbf7d0;
        }
        .badge-draft {
            background-color: #fef3c7;
            color: #92400e;
            border: 1px solid #fde68a;
        }
        .attendance-box {
            width: 100%;
            margin-bottom: 16px;
            border: 1px solid #e2e8f0;
            background-color: #f8fafc;
            border-radius: 6px;
            border-collapse: collapse;
        }
        .attendance-box td {
            padding: 8px 10px;
            text-align: center;
            border-right: 1px solid #e2e8f0;
            width: 25%;
        }
        .attendance-box td:last-child {
            border-right: none;
        }
        .att-label {
            font-size: 9.5px;
            color: #64748b;
            display: block;
            margin-bottom: 2px;
        }
        .att-value {
            font-size: 12px;
            font-weight: bold;
            color: #0f172a;
        }
        .att-danger {
            color: #e11d48;
        }
        .main-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
        }
        .main-table > tbody > tr > td {
            vertical-align: top;
            width: 50%;
            padding: 0 6px;
        }
        .main-table > tbody > tr > td:first-child {
            padding-left: 0;
            padding-right: 8px;
        }
        .main-table > tbody > tr > td:last-child {
            padding-left: 8px;
            padding-right: 0;
        }
        .section-box {
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            overflow: hidden;
        }
        .section-header {
            background-color: #f1f5f9;
            padding: 6px 10px;
            font-weight: bold;
            font-size: 10.5px;
            color: #334155;
            border-bottom: 1px solid #e2e8f0;
        }
        .comp-table {
            width: 100%;
            border-collapse: collapse;
        }
        .comp-table td {
            padding: 6px 10px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 10.5px;
        }
        .comp-table tr:last-child td {
            border-bottom: none;
        }
        .comp-name {
            color: #334155;
        }
        .comp-val {
            text-align: right;
            font-family: 'Courier New', Courier, monospace;
            font-weight: 600;
        }
        .val-plus {
            color: #059669;
        }
        .val-minus {
            color: #e11d48;
        }
        .total-row td {
            background-color: #f8fafc;
            font-weight: bold;
            border-top: 1px solid #cbd5e1;
        }
        .thp-card {
            background-color: #eef2ff;
            border: 1.5px solid #c7d2fe;
            border-radius: 6px;
            padding: 10px 14px;
            margin-bottom: 18px;
        }
        .thp-table {
            width: 100%;
            border-collapse: collapse;
        }
        .thp-label {
            font-size: 12px;
            font-weight: bold;
            color: #312e81;
        }
        .thp-amount {
            font-size: 16px;
            font-weight: bold;
            color: #4338ca;
            text-align: right;
            font-family: 'Courier New', Courier, monospace;
        }
        .footer-note {
            font-size: 9px;
            color: #94a3b8;
            text-align: center;
            font-style: italic;
            border-top: 1px dashed #cbd5e1;
            padding-top: 10px;
        }
    </style>
</head>
<body>

@php
    $hasGd = extension_loaded('gd');
    $logoBase64 = '';
    if ($hasGd) {
        $logoPath = public_path('images/front-end/logo3.webp');
        if (file_exists($logoPath)) {
            $logoBase64 = 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath));
        }
    }
@endphp

    <div class="header">
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="width: 85px; vertical-align: middle; text-align: left;">
                    @if($hasGd && !empty($logoBase64))
                        <img src="{{ $logoBase64 }}" style="height: 52px; width: auto;" alt="Logo FastLog">
                    @else
                        <div style="font-size: 16px; font-weight: bold; color: #047857; letter-spacing: -0.5px;">Fast<span style="color: #4338ca;">Log</span></div>
                    @endif
                </td>
                <td style="vertical-align: middle; text-align: center;">
                    <div class="company-title">PT. FASTLOG ERA MANDIRI</div>
                    <div class="doc-title">SLIP GAJI KARYAWAN</div>
                    <div class="period-subtitle">Periode: {{ $periodeLabel ?? $payroll->periode }}</div>
                </td>
                <td style="width: 85px; text-align: right; vertical-align: middle;">
                    @if(($payroll->status ?? 'draft') === 'paid')
                        <span class="badge badge-paid">Lunas (Paid)</span>
                    @else
                        <span class="badge badge-draft">Draft</span>
                    @endif
                </td>
            </tr>
        </table>
    </div>

    <table class="info-table">
        <tr>
            <td class="info-label">Nama Karyawan:</td>
            <td class="info-value">{{ $employee->nama ?? '-' }}</td>
            <td class="info-label">Departemen:</td>
            <td class="info-value">{{ $deptLabel ?? $employee->dept ?? 'Umum' }}</td>
        </tr>
        <tr>
            <td class="info-label">ID Karyawan:</td>
            <td class="info-value">{{ !empty($employee->pin) ? $employee->pin : ($employee->id ?? '-') }}</td>
            <td class="info-label">Jabatan:</td>
            <td class="info-value">{{ $employee->jabatan ?? 'Staff' }}</td>
        </tr>
        <tr>
            <td class="info-label">Golongan:</td>
            <td class="info-value">{{ $employee->salaryGrade->nama ?? 'Standard' }}</td>
            <td class="info-label">Tanggal Cetak:</td>
            <td class="info-value">{{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}</td>
        </tr>
    </table>

    <table class="attendance-box">
        <tr>
            <td>
                <span class="att-label">Hadir</span>
                <span class="att-value">{{ $payroll->hadir_hari ?? 0 }} Hari</span>
            </td>
            <td>
                <span class="att-label">Terlambat</span>
                <span class="att-value {{ ($payroll->terlambat_menit ?? 0) > 0 ? 'att-danger' : '' }}">{{ $payroll->terlambat_menit ?? 0 }} Menit</span>
            </td>
            <td>
                <span class="att-label">Alpa</span>
                <span class="att-value {{ ($payroll->alpa_hari ?? 0) > 0 ? 'att-danger' : '' }}">{{ $payroll->alpa_hari ?? 0 }} Hari</span>
            </td>
            <td>
                <span class="att-label">Lembur</span>
                <span class="att-value">{{ $payroll->lembur_menit ?? 0 }} Menit</span>
            </td>
        </tr>
    </table>

    <table class="main-table">
        <tr>
            <td>
                <div class="section-box">
                    <div class="section-header">Penerimaan (Earnings)</div>
                    <table class="comp-table">
                        <tr>
                            <td class="comp-name">Gaji Pokok</td>
                            <td class="comp-val val-plus">Rp {{ number_format($payroll->gaji_pokok ?? 0, 0, ',', '.') }}</td>
                        </tr>
                        @if(!empty($tunjanganDetails))
                            @foreach($tunjanganDetails as $tun)
                                <tr>
                                    <td class="comp-name">{{ $tun['nama'] }}</td>
                                    <td class="comp-val val-plus">+ Rp {{ number_format($tun['nominal'] ?? 0, 0, ',', '.') }}</td>
                                </tr>
                            @endforeach
                        @else
                            <tr>
                                <td class="comp-name">Tunjangan Tetap</td>
                                <td class="comp-val val-plus">+ Rp {{ number_format($payroll->tunjangan ?? 0, 0, ',', '.') }}</td>
                            </tr>
                        @endif
                        <tr>
                            <td class="comp-name">Upah Lembur ({{ $payroll->lembur_menit ?? 0 }} Menit)</td>
                            <td class="comp-val val-plus">+ Rp {{ number_format($payroll->lembur ?? 0, 0, ',', '.') }}</td>
                        </tr>
                        @php
                            $insentifLain = max(0, ($payroll->bonus ?? 0) - (($payroll->tunjangan ?? 0) + ($payroll->lembur ?? 0)));
                        @endphp
                        @if($insentifLain > 0)
                            <tr>
                                <td class="comp-name">Insentif Tambahan</td>
                                <td class="comp-val val-plus">+ Rp {{ number_format($insentifLain, 0, ',', '.') }}</td>
                            </tr>
                        @endif
                        <tr class="total-row">
                            <td class="comp-name">Total Penerimaan</td>
                            <td class="comp-val val-plus">Rp {{ number_format(($payroll->gaji_pokok ?? 0) + ($payroll->bonus ?? 0), 0, ',', '.') }}</td>
                        </tr>
                    </table>
                </div>
            </td>
            <td>
                <div class="section-box">
                    <div class="section-header">Potongan (Deductions)</div>
                    <table class="comp-table">
                        <tr>
                            <td class="comp-name">
                                Denda Terlambat ({{ $payroll->terlambat_menit ?? 0 }} Menit)
                                @if(!empty($isExempt))
                                    <br><small style="color: #059669; font-size: 8.5px;">Bebas Sanksi (Karyawan Khusus)</small>
                                @elseif(!empty($lateDetails['tiers_breakdown']))
                                    @foreach($lateDetails['tiers_breakdown'] as $tb)
                                        <br><small style="color: #64748b; font-size: 8px; padding-left: 4px;">
                                            • Kat {{ $tb['tier_order'] }} ({{ $tb['total_kejadian'] }}x): 
                                            @if($tb['ada_toleransi'] && ($tb['toleransi_count'] ?? 0) > 0)
                                                {{ $tb['toleransi_count'] }}x bebas denda
                                            @endif
                                            @if(($tb['penalized_count'] ?? 0) > 0)
                                                {{ $tb['penalized_count'] }}x denda (@ Rp {{ number_format($tb['nominal_denda'], 0, ',', '.') }})
                                            @endif
                                        </small>
                                    @endforeach
                                @endif
                            </td>
                            <td class="comp-val val-minus">
                                @if(($payroll->potongan_terlambat ?? 0) > 0)
                                    - Rp {{ number_format($payroll->potongan_terlambat, 0, ',', '.') }}
                                @else
                                    Rp 0
                                @endif
                            </td>
                        </tr>
                        <tr>
                            <td class="comp-name">
                                Potongan Alpa ({{ $payroll->alpa_hari ?? 0 }} Hari)
                                @if(!empty($isExempt))
                                    <br><small style="color: #059669; font-size: 8.5px;">Bebas Sanksi (Karyawan Khusus)</small>
                                @endif
                            </td>
                            <td class="comp-val val-minus">
                                @if(($payroll->potongan_alpa ?? 0) > 0)
                                    - Rp {{ number_format($payroll->potongan_alpa, 0, ',', '.') }}
                                @else
                                    Rp 0
                                @endif
                            </td>
                        </tr>
                        @if(!empty($bpjsDetails))
                            @foreach($bpjsDetails as $bpjs)
                                <tr>
                                    <td class="comp-name">{{ $bpjs['nama'] }}{{ !empty($bpjs['persen']) ? ' (' . $bpjs['persen'] . '%)' : '' }}</td>
                                    <td class="comp-val val-minus">- Rp {{ number_format($bpjs['nominal'] ?? 0, 0, ',', '.') }}</td>
                                </tr>
                            @endforeach
                        @elseif(($payroll->potongan_lainnya ?? 0) > 0)
                            <tr>
                                <td class="comp-name">Potongan BPJS & Lainnya</td>
                                <td class="comp-val val-minus">- Rp {{ number_format($payroll->potongan_lainnya ?? 0, 0, ',', '.') }}</td>
                            </tr>
                        @endif
                        <tr class="total-row">
                            <td class="comp-name">Total Potongan</td>
                            <td class="comp-val val-minus">- Rp {{ number_format($payroll->total_potongan ?? 0, 0, ',', '.') }}</td>
                        </tr>
                    </table>
                </div>
            </td>
        </tr>
    </table>

    <div class="thp-card">
        <table class="thp-table">
            <tr>
                <td class="thp-label">
                    <div>TOTAL BERSIH DITERIMA (TAKE HOME PAY)</div>
                    <div style="font-size: 9.5px; font-weight: normal; color: #4b5563; margin-top: 1px;">
                        Gaji Pokok + Total Penerimaan - Total Potongan
                    </div>
                </td>
                <td class="thp-amount">
                    Rp {{ number_format($payroll->thp ?? 0, 0, ',', '.') }}
                </td>
            </tr>
        </table>
    </div>

    <div class="footer-note">
        Dokumen ini diterbitkan secara otomatis oleh sistem payroll PT. FastLog Era Mandiri dan sah tanpa tanda tangan basah.
    </div>

</body>
</html>
