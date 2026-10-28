<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Rekap Presensi Karyawan ({{ $start_date }} s.d {{ $end_date }})</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 8px;
            color: #0f172a;
            background-color: #ffffff;
            padding: 16px 20px;
            line-height: 1.3;
        }
        .header {
            border-bottom: 2px solid #4338ca;
            padding-bottom: 8px;
            margin-bottom: 10px;
        }
        .company-title {
            font-size: 13px;
            font-weight: bold;
            color: #1e1b4b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .doc-title {
            font-size: 11px;
            font-weight: bold;
            color: #4338ca;
            margin-top: 1px;
        }
        .period-subtitle {
            font-size: 8.5px;
            color: #64748b;
            margin-top: 1px;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 7.5px;
            text-align: center;
            margin-bottom: 10px;
        }
        .data-table th {
            background-color: #0f172a;
            color: #ffffff;
            font-weight: bold;
            padding: 3px 2px;
            border: 1px solid #1e293b;
            font-size: 7.5px;
        }
        .data-table td {
            padding: 2.5px 1.5px;
            border: 1px solid #cbd5e1;
            vertical-align: middle;
        }
        .text-left {
            text-align: left;
        }
        .emp-name {
            font-weight: bold;
            color: #0f172a;
            font-size: 8px;
            white-space: nowrap;
        }
        .emp-dept {
            font-size: 6.5px;
            color: #64748b;
        }
        .badge-h {
            font-weight: bold;
            color: #0f172a;
        }
        .badge-t {
            background-color: #fef3c7;
            color: #92400e;
            font-weight: bold;
            display: inline-block;
            width: 14px;
            height: 14px;
            line-height: 14px;
            border-radius: 2px;
            border: 0.5px solid #fde68a;
        }
        .badge-ot {
            background-color: #ffe4e6;
            color: #9f1239;
            font-weight: bold;
            display: inline-block;
            padding: 0 2px;
            height: 14px;
            line-height: 14px;
            border-radius: 2px;
            border: 0.5px solid #fecdd3;
            font-size: 6.5px;
        }
        .badge-i {
            background-color: #dbeafe;
            color: #1e40af;
            font-weight: bold;
            display: inline-block;
            width: 14px;
            height: 14px;
            line-height: 14px;
            border-radius: 2px;
            border: 0.5px solid #bfdbfe;
        }
        .badge-s {
            background-color: #f3e8ff;
            color: #6b21a8;
            font-weight: bold;
            display: inline-block;
            width: 14px;
            height: 14px;
            line-height: 14px;
            border-radius: 2px;
            border: 0.5px solid #e9d5ff;
        }
        .badge-a {
            background-color: #fee2e2;
            color: #991b1b;
            font-weight: bold;
            display: inline-block;
            width: 14px;
            height: 14px;
            line-height: 14px;
            border-radius: 2px;
            border: 0.5px solid #fca5a5;
        }
        .badge-l {
            background-color: #f1f5f9;
            color: #64748b;
            display: inline-block;
            width: 14px;
            height: 14px;
            line-height: 14px;
            border-radius: 2px;
        }
        .badge-ln {
            background-color: #ffe4e6;
            color: #be123c;
            font-weight: bold;
            display: inline-block;
            padding: 0 1px;
            height: 14px;
            line-height: 14px;
            border-radius: 2px;
            border: 0.5px solid #fecdd3;
            font-size: 6.5px;
        }
        .col-summary {
            font-weight: bold;
            font-size: 8px;
        }
        .sum-h {
            background-color: #ecfdf5;
            color: #065f46;
        }
        .sum-t {
            background-color: #fffbeb;
            color: #92400e;
        }
        .sum-ot {
            background-color: #fff1f2;
            color: #9f1239;
        }
        .sum-is {
            background-color: #eff6ff;
            color: #1e40af;
        }
        .sum-a {
            background-color: #fef2f2;
            color: #991b1b;
        }
        .legend-table {
            width: 100%;
            border: 1px solid #e2e8f0;
            background-color: #f8fafc;
            padding: 4px 6px;
            font-size: 7px;
            margin-top: 6px;
        }
        .footer-table {
            width: 100%;
            margin-top: 14px;
            border-collapse: collapse;
        }
        .footer-table td {
            width: 50%;
            text-align: center;
            font-size: 8.5px;
            vertical-align: top;
        }
        .sign-space {
            height: 38px;
        }
        .sign-name {
            font-weight: bold;
            text-decoration: underline;
        }
    </style>
</head>
<body>
    @php
        $start = \Carbon\Carbon::parse($start_date)->startOfDay();
        $end = \Carbon\Carbon::parse($end_date)->endOfDay();
        $days = [];
        $dayNamesShort = [0 => 'Min', 1 => 'Sen', 2 => 'Sel', 3 => 'Rab', 4 => 'Kam', 5 => 'Jum', 6 => 'Sab'];
        $curr = $start->copy();
        while ($curr->lte($end)) {
            $dStr = $curr->format('Y-m-d');
            $days[] = [
                'date' => $dStr,
                'num' => (int)$curr->format('j'),
                'day' => $dayNamesShort[$curr->dayOfWeek] ?? '',
                'isSun' => $curr->isSunday(),
                'isHol' => isset($holidays[$dStr]),
            ];
            $curr->addDay();
        }
    @endphp

    <div class="header">
        <table style="width: 100%;">
            <tr>
                <td style="vertical-align: middle;">
                    <div class="company-title">PT. FASTLOG INTERNASIONAL</div>
                    <div class="doc-title">REKAPITULASI LAPORAN PRESENSI &amp; OVERTIME KARYAWAN</div>
                    <div class="period-subtitle">Periode: {{ \Carbon\Carbon::parse($start_date)->translatedFormat('d F Y') }} s.d {{ \Carbon\Carbon::parse($end_date)->translatedFormat('d F Y') }}</div>
                </td>
                <td style="vertical-align: middle; text-align: right;">
                    <div style="font-size: 8px; color: #64748b;">Dicetak pada: {{ \Carbon\Carbon::now()->translatedFormat('d F Y H:i') }}</div>
                    <div style="font-size: 8px; color: #64748b; margin-top: 2px;">Total Karyawan: {{ count($employees ?? []) }} Orang</div>
                </td>
            </tr>
        </table>
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th rowspan="2" style="width: 18px;">No</th>
                <th rowspan="2" style="width: 110px;" class="text-left">Karyawan</th>
                <th colspan="{{ count($days) }}">Tanggal &amp; Hari</th>
                <th colspan="5">Rekapitulasi</th>
            </tr>
            <tr>
                @foreach($days as $d)
                    <th style="width: 16px; {{ $d['isSun'] ? 'background-color: #475569;' : ($d['isHol'] ? 'background-color: #be123c;' : '') }}">
                        {{ $d['num'] }}<br><span style="font-size: 6px;">{{ $d['day'] }}</span>
                    </th>
                @endforeach
                <th style="width: 18px; background-color: #065f46;">H</th>
                <th style="width: 18px; background-color: #92400e;">T</th>
                <th style="width: 18px; background-color: #9f1239;">OT</th>
                <th style="width: 18px; background-color: #1e40af;">I/S</th>
                <th style="width: 18px; background-color: #991b1b;">A</th>
            </tr>
        </thead>
        <tbody>
            @foreach($employees as $idx => $emp)
                @php
                    $cH = 0; $cT = 0; $cOT = 0; $cIS = 0; $cA = 0;
                @endphp
                <tr>
                    <td>{{ $idx + 1 }}</td>
                    <td class="text-left" style="padding-left: 3px;">
                        <div class="emp-name">{{ $emp['nama'] }}</div>
                        <div class="emp-dept">{{ $emp['deptLabel'] ?? ($emp['dept'] ?? 'Umum') }}</div>
                    </td>
                    @foreach($days as $d)
                        @php
                            $defaultSt = $d['isHol'] ? 'LN' : ($d['isSun'] ? 'L' : '-');
                            $st = $emp['attendance'][$d['date']] ?? ($emp['attendance'][$d['num']] ?? $defaultSt);
                            if ($st === 'H') $cH++;
                            elseif ($st === 'T') $cT++;
                            elseif ($st === 'OT') $cOT++;
                            elseif ($st === 'I' || $st === 'S') $cIS++;
                            elseif ($st === 'A') $cA++;
                        @endphp
                        <td style="{{ $d['isHol'] ? 'background-color: #fff1f2;' : ($d['isSun'] ? 'background-color: #f8fafc;' : '') }}">
                            @if($st === 'H')
                                <span class="badge-h">H</span>
                            @elseif($st === 'T')
                                <span class="badge-t">T</span>
                            @elseif($st === 'OT')
                                <span class="badge-ot">OT</span>
                            @elseif($st === 'I')
                                <span class="badge-i">I</span>
                            @elseif($st === 'S')
                                <span class="badge-s">S</span>
                            @elseif($st === 'A')
                                <span class="badge-a">A</span>
                            @elseif($st === 'LN')
                                <span class="badge-ln">LN</span>
                            @elseif($st === 'L')
                                <span class="badge-l">L</span>
                            @else
                                <span style="color: #cbd5e1;">-</span>
                            @endif
                        </td>
                    @endforeach
                    <td class="col-summary sum-h">{{ $cH }}</td>
                    <td class="col-summary sum-t">{{ $cT }}</td>
                    <td class="col-summary sum-ot">{{ $cOT }}</td>
                    <td class="col-summary sum-is">{{ $cIS }}</td>
                    <td class="col-summary sum-a">{{ $cA }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="legend-table">
        <tr>
            <td style="font-weight: bold; width: 85px;">Keterangan Status:</td>
            <td><strong>H</strong>: Hadir Tepat</td>
            <td><strong>T</strong>: Terlambat</td>
            <td><strong>OT</strong>: Lembur (Overtime)</td>
            <td><strong>I</strong>: Izin</td>
            <td><strong>S</strong>: Sakit</td>
            <td><strong>A</strong>: Alpha (Tanpa Keterangan)</td>
            <td><strong>L</strong>: Libur Minggu</td>
            <td><strong>LN</strong>: Libur Nasional</td>
        </tr>
    </table>

    <table class="footer-table">
        <tr>
            <td>
                <div>Mengetahui,</div>
                <div><strong>Kepala Divisi / Operasional</strong></div>
                <div class="sign-space"></div>
                <div class="sign-name">Manager Operasional</div>
            </td>
            <td>
                <div>Dibuat oleh,</div>
                <div><strong>HRD &amp; Personalia</strong></div>
                <div class="sign-space"></div>
                <div class="sign-name">Staff HRD</div>
            </td>
        </tr>
    </table>
</body>
</html>
