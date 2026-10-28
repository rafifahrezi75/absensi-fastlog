<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Presensi - {{ $employee['nama'] ?? 'Karyawan' }} ({{ $start_date }} s.d {{ $end_date }})</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 10px;
            color: #1e293b;
            background-color: #ffffff;
            padding: 24px 28px;
            line-height: 1.4;
        }
        .header {
            border-bottom: 2px solid #4338ca;
            padding-bottom: 10px;
            margin-bottom: 14px;
        }
        .company-title {
            font-size: 15px;
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
            font-size: 10px;
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
        .summary-box {
            width: 100%;
            margin-bottom: 14px;
            border: 1px solid #cbd5e1;
            background-color: #f8fafc;
            border-collapse: collapse;
        }
        .summary-box td {
            padding: 6px 8px;
            text-align: center;
            border-right: 1px solid #cbd5e1;
            width: 16.66%;
        }
        .summary-box td:last-child {
            border-right: none;
        }
        .sum-label {
            font-size: 8.5px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: bold;
            display: block;
            margin-bottom: 2px;
        }
        .sum-val {
            font-size: 12px;
            font-weight: bold;
            color: #0f172a;
        }
        .sum-val-green {
            color: #15803d;
        }
        .sum-val-amber {
            color: #b45309;
        }
        .sum-val-rose {
            color: #be123c;
        }
        .sum-val-blue {
            color: #1d4ed8;
        }
        .sum-val-red {
            color: #b91c1c;
        }
        .sum-sub {
            font-size: 8px;
            color: #64748b;
            margin-top: 1px;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9px;
            margin-bottom: 16px;
        }
        .data-table th {
            background-color: #0f172a;
            color: #ffffff;
            font-weight: bold;
            padding: 5px 6px;
            text-align: left;
            border: 1px solid #0f172a;
        }
        .data-table td {
            padding: 4px 6px;
            border: 1px solid #e2e8f0;
            vertical-align: middle;
        }
        .data-table tr:nth-child(even) td {
            background-color: #f8fafc;
        }
        .badge {
            display: inline-block;
            padding: 1.5px 5px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: bold;
            text-align: center;
        }
        .badge-h {
            background-color: #f1f5f9;
            color: #1e293b;
            border: 1px solid #cbd5e1;
        }
        .badge-t {
            background-color: #fef3c7;
            color: #92400e;
            border: 1px solid #fde68a;
        }
        .badge-ot {
            background-color: #ffe4e6;
            color: #9f1239;
            border: 1px solid #fecdd3;
        }
        .badge-i {
            background-color: #dbeafe;
            color: #1e40af;
            border: 1px solid #bfdbfe;
        }
        .badge-s {
            background-color: #f3e8ff;
            color: #6b21a8;
            border: 1px solid #e9d5ff;
        }
        .badge-a {
            background-color: #fee2e2;
            color: #991b1b;
            border: 1px solid #fca5a5;
        }
        .badge-l {
            background-color: #f1f5f9;
            color: #64748b;
            border: 1px solid #cbd5e1;
        }
        .badge-ln {
            background-color: #ffe4e6;
            color: #be123c;
            border: 1px solid #fecdd3;
        }
        .footer-table {
            width: 100%;
            margin-top: 24px;
            border-collapse: collapse;
        }
        .footer-table td {
            width: 50%;
            text-align: center;
            font-size: 9.5px;
            vertical-align: top;
        }
        .sign-space {
            height: 50px;
        }
        .sign-name {
            font-weight: bold;
            text-decoration: underline;
        }
        .text-center {
            text-align: center;
        }
        .text-right {
            text-align: right;
        }
        .cell-sub {
            font-size: 7.5px;
            margin-top: 2px;
            display: block;
        }
        .tag-amber {
            display: inline-block;
            padding: 1px 4px;
            border-radius: 2px;
            font-size: 7px;
            font-weight: bold;
            background-color: #fef3c7;
            color: #92400e;
            border: 1px solid #fde68a;
        }
        .tag-green {
            display: inline-block;
            padding: 1px 4px;
            border-radius: 2px;
            font-size: 7px;
            font-weight: bold;
            background-color: #dcfce7;
            color: #166534;
            border: 1px solid #bbf7d0;
        }
        .tag-rose {
            display: inline-block;
            padding: 1px 4px;
            border-radius: 2px;
            font-size: 7px;
            font-weight: bold;
            background-color: #ffe4e6;
            color: #9f1239;
            border: 1px solid #fecdd3;
        }
        .tag-blue {
            display: inline-block;
            padding: 1px 4px;
            border-radius: 2px;
            font-size: 7px;
            font-weight: bold;
            background-color: #dbeafe;
            color: #1e40af;
            border: 1px solid #bfdbfe;
        }
    </style>
</head>
<body>
    <div class="header">
        <table style="width: 100%;">
            <tr>
                <td style="width: 60px; vertical-align: middle;">
                    @php
                        $logoPath = public_path('images/front-end/logo-fastlog.png');
                        $logoExists = file_exists($logoPath);
                        $logoSrc = '';
                        if ($logoExists) {
                            $logoData = base64_encode(file_get_contents($logoPath));
                            $logoSrc = 'data:image/png;base64,' . $logoData;
                        }
                    @endphp
                    @if($logoExists)
                        <img src="{{ $logoSrc }}" style="width: 55px; height: auto;" alt="Fastlog Logo">
                    @endif
                </td>
                <td style="vertical-align: middle; text-align: center;">
                    <div class="company-title">PT. FASTLOG ERA MANDIRI</div>
                    <div class="doc-title">REKAPITULASI DETAIL PRESENSI &amp; LEMBUR KARYAWAN</div>
                    <div class="period-subtitle">Periode: {{ \Carbon\Carbon::parse($start_date)->translatedFormat('d F Y') }} s.d {{ \Carbon\Carbon::parse($end_date)->translatedFormat('d F Y') }}</div>
                </td>
                <td style="width: 120px; vertical-align: middle; text-align: right;">
                    <div style="font-size: 9px; color: #64748b;">Dicetak pada:<br>{{ \Carbon\Carbon::now()->translatedFormat('d F Y H:i') }}</div>
                    @if(!empty($employee['is_exempt']))
                        <div style="margin-top: 4px; display: inline-block; background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 8.5px;">KARYAWAN KHUSUS</div>
                    @endif
                </td>
            </tr>
        </table>
    </div>

    <table class="info-table">
        <tr>
            <td class="info-label">Nama Karyawan</td>
            <td class="info-value">: {{ $employee['nama'] ?? '-' }}</td>
            <td class="info-label">Departemen</td>
            <td class="info-value">: {{ $employee['dept'] ?? 'Umum' }}</td>
        </tr>
        <tr>
            <td class="info-label">ID Karyawan</td>
            <td class="info-value">: {{ !empty($employee['pin']) ? $employee['pin'] : ($employee['id'] ?? '-') }}</td>
            <td class="info-label">Jabatan</td>
            <td class="info-value">: {{ $employee['jabatan'] ?? 'Staff' }}</td>
        </tr>
        <tr>
            <td class="info-label">Status Aturan</td>
            <td class="info-value">: {{ !empty($employee['is_exempt']) ? 'Bebas Denda & Lembur' : 'Standar Sesuai Aturan' }}</td>
            <td class="info-label">Kategori Terlambat</td>
            <td class="info-value">: {{ $late_breakdown['category_name'] ?? 'Umum' }}</td>
        </tr>
    </table>

    <table class="summary-box">
        <tr>
            <td>
                <span class="sum-label">Hadir Tepat</span>
                <span class="sum-val sum-val-green">{{ $summary['total_tepat_waktu'] ?? 0 }}</span>
                <div class="sum-sub">Hari</div>
            </td>
            <td>
                <span class="sum-label">Terlambat</span>
                <span class="sum-val sum-val-amber">{{ $summary['total_telat_kali'] ?? 0 }}x</span>
                <div class="sum-sub">{{ $summary['total_telat_menit'] ?? 0 }} Menit</div>
            </td>
            <td>
                <span class="sum-label">Lembur (OT)</span>
                <span class="sum-val sum-val-rose">{{ $summary['total_lembur_kali'] ?? 0 }}x</span>
                <div class="sum-sub">{{ $summary['total_lembur_menit'] ?? 0 }} Menit ({{ round(($summary['total_lembur_menit'] ?? 0) / 60, 1) }} Jam)</div>
            </td>
            <td>
                <span class="sum-label">Izin / Sakit</span>
                <span class="sum-val sum-val-blue">{{ ($summary['total_izin'] ?? 0) + ($summary['total_sakit'] ?? 0) }}</span>
                <div class="sum-sub">I: {{ $summary['total_izin'] ?? 0 }} | S: {{ $summary['total_sakit'] ?? 0 }}</div>
            </td>
            <td>
                <span class="sum-label">Alpha</span>
                <span class="sum-val sum-val-red">{{ $summary['total_alpha'] ?? 0 }}</span>
                <div class="sum-sub">Hari</div>
            </td>
            <td>
                <span class="sum-label">Hari Kerja</span>
                <span class="sum-val">{{ $summary['total_hari_kerja'] ?? 0 }}</span>
                <div class="sum-sub">Hari Efektif</div>
            </td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 22px; text-align: center;">No</th>
                <th style="width: 78px;">Tanggal &amp; Hari</th>
                <th style="width: 40px; text-align: center;">Status</th>
                <th style="width: 52px; text-align: center;">Scan Masuk</th>
                <th style="width: 52px; text-align: center;">Scan Pulang</th>
                <th style="width: 65px; text-align: center;">Terlambat</th>
                <th style="width: 65px; text-align: center;">Lembur</th>
                <th>Keterangan</th>
            </tr>
        </thead>
        <tbody>
            @foreach($records as $idx => $r)
                @php
                    $badgeClass = 'badge-h';
                    if ($r['status'] === 'T') $badgeClass = 'badge-t';
                    elseif ($r['status'] === 'OT') $badgeClass = 'badge-ot';
                    elseif ($r['status'] === 'I') $badgeClass = 'badge-i';
                    elseif ($r['status'] === 'S') $badgeClass = 'badge-s';
                    elseif ($r['status'] === 'A') $badgeClass = 'badge-a';
                    elseif ($r['status'] === 'L') $badgeClass = 'badge-l';
                    elseif ($r['status'] === 'LN') $badgeClass = 'badge-ln';

                    $lateMnt = $r['late_minutes'] ?? 0;
                    $otMnt = $r['overtime_minutes'] ?? 0;
                    $tierName = $r['late_tier_name'] ?? null;
                    $tierOrder = $r['late_tier'] ?? null;
                    $otTypeName = $r['overtime_type_name'] ?? null;

                    $otTag = 'tag-amber';
                    $otLabel = '';
                    if ($otTypeName) {
                        if (str_contains($otTypeName, 'Weekend') || str_contains($otTypeName, 'Akhir Pekan')) {
                            $otTag = 'tag-blue';
                            $otLabel = 'Akhir Pekan';
                        } elseif (str_contains($otTypeName, 'Besar') || str_contains($otTypeName, 'Nasional')) {
                            $otTag = 'tag-rose';
                            $otLabel = 'Hari Libur';
                        } else {
                            $otTag = 'tag-amber';
                            $otLabel = 'Hari Kerja';
                        }
                    }
                @endphp
                <tr>
                    <td class="text-center">{{ $idx + 1 }}</td>
                    <td>
                        <strong>{{ \Carbon\Carbon::parse($r['date'])->format('d/m/Y') }}</strong>
                        <div style="font-size: 8px; color: #64748b;">{{ $r['day_name'] }}</div>
                    </td>
                    <td class="text-center">
                        <span class="badge {{ $badgeClass }}">{{ $r['status'] }}</span>
                    </td>
                    <td class="text-center">{{ $r['first_scan'] ?? '-' }}</td>
                    <td class="text-center">{{ $r['last_scan'] ?? '-' }}</td>
                    <td class="text-center" style="{{ $lateMnt > 0 ? 'color: #b45309; font-weight: bold;' : '' }}">
                        {{ $lateMnt > 0 ? $lateMnt . ' mnt' : '-' }}
                    </td>
                    <td class="text-center" style="{{ $otMnt > 0 ? 'color: #be123c; font-weight: bold;' : '' }}">
                        {{ $otMnt > 0 ? $otMnt . ' mnt' : '-' }}
                    </td>
                    <td>
                        {{ $r['note'] }}
                        @if($lateMnt > 0 && ($tierName || $tierOrder))
                            <span class="cell-sub">
                                <span class="tag-amber">{{ $tierName ?: 'Tier ' . $tierOrder }}</span>
                            </span>
                        @endif
                        @if($otMnt > 0 && $otLabel)
                            <span class="cell-sub">
                                <span class="{{ $otTag }}">{{ $otLabel }}</span>
                            </span>
                        @endif
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="footer-table">
        <tr>
            <td>
                <div>Mengetahui,</div>
                <div><strong>Kepala Divisi / HRD</strong></div>
                <div class="sign-space"></div>
                <div class="sign-name">HRD &amp; Personalia</div>
            </td>
            <td>
                <div>Diterima oleh,</div>
                <div><strong>Karyawan Bersangkutan</strong></div>
                <div class="sign-space"></div>
                <div class="sign-name">{{ $employee['nama'] ?? 'Karyawan' }}</div>
            </td>
        </tr>
    </table>
</body>
</html>
