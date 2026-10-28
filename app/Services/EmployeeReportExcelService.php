<?php

namespace App\Services;

use Carbon\Carbon;
use ZipArchive;

class EmployeeReportExcelService
{
    /**
     * Generate an Excel file (.xlsx) matching the structure and style of Contoh_Laporan_Presensi_agus.xlsx.
     *
     * @param array $data The report data from ReportController::prepareEmployeeReportData
     * @return string Path to the generated temporary .xlsx file
     */
    public function generate(array $data): string
    {
        $employee = $data['employee'] ?? [];
        $records = $data['records'] ?? [];
        $startDate = $data['start_date'] ?? date('Y-m-01');
        $endDate = $data['end_date'] ?? date('Y-m-t');

        $tempPath = tempnam(sys_get_temp_dir(), 'rep_') . '.xlsx';
        $templatePath = dirname(__DIR__, 2) . '/resources/templates/Contoh_Laporan_Presensi_agus.xlsx';

        if (file_exists($templatePath)) {
            copy($templatePath, $tempPath);
            $zip = new ZipArchive();
            if ($zip->open($tempPath) === true) {
                $sheetXml = $this->buildSheetXml($employee, $records, $startDate, $endDate);
                $zip->addFromString('xl/worksheets/sheet1.xml', $sheetXml);
                $zip->close();
                return $tempPath;
            }
        }

        // Fallback: build entire XLSX package from scratch
        $this->buildEntirePackage($tempPath, $employee, $records, $startDate, $endDate);
        return $tempPath;
    }

    private function buildSheetXml(array $employee, array $records, string $startDate, string $endDate): string
    {
        $nama = htmlspecialchars($employee['nama'] ?? '-', ENT_XML1);
        $pin = htmlspecialchars((string)($employee['pin'] ?? '-'), ENT_XML1);
        $nik = htmlspecialchars((string)($employee['nik'] ?? '-'), ENT_XML1);
        $dept = htmlspecialchars((string)($employee['dept'] ?? 'Umum'), ENT_XML1);
        $jabatan = htmlspecialchars((string)($employee['jabatan'] ?? 'Staff Operasional'), ENT_XML1);

        $startFormatted = Carbon::parse($startDate)->format('d/m/Y');
        $endFormatted = Carbon::parse($endDate)->format('d/m/Y');
        $periodeStr = "{$startFormatted} s.d. {$endFormatted}";

        $totalRecords = count($records);
        $lastDataRow = 11 + $totalRecords;
        $footerRow = $lastDataRow + 2;
        $dimensionRef = "A1:J{$footerRow}";

        $xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n";
        $xml .= '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' . "\n";
        $xml .= '  <sheetPr><outlinePr summaryBelow="1" summaryRight="1"/><pageSetUpPr fitToPage="1"/></sheetPr>' . "\n";
        $xml .= '  <dimension ref="' . $dimensionRef . '"/>' . "\n";
        $xml .= '  <sheetViews><sheetView workbookViewId="0"><selection activeCell="A1" sqref="A1"/></sheetView></sheetViews>' . "\n";
        $xml .= '  <sheetFormatPr baseColWidth="8" defaultRowHeight="15"/>' . "\n";
        $xml .= '  <cols>' . "\n";
        $xml .= '    <col min="1" max="1" width="6" customWidth="1"/>' . "\n";
        $xml .= '    <col min="2" max="2" width="13" customWidth="1"/>' . "\n";
        $xml .= '    <col min="3" max="3" width="11" customWidth="1"/>' . "\n";
        $xml .= '    <col min="4" max="4" width="9" customWidth="1"/>' . "\n";
        $xml .= '    <col min="5" max="5" width="18" customWidth="1"/>' . "\n";
        $xml .= '    <col min="6" max="6" width="12" customWidth="1"/>' . "\n";
        $xml .= '    <col min="7" max="7" width="12" customWidth="1"/>' . "\n";
        $xml .= '    <col min="8" max="8" width="16" customWidth="1"/>' . "\n";
        $xml .= '    <col min="9" max="9" width="14" customWidth="1"/>' . "\n";
        $xml .= '    <col min="10" max="10" width="30" customWidth="1"/>' . "\n";
        $xml .= '  </cols>' . "\n";
        $xml .= '  <sheetData>' . "\n";

        // Row 1: Title
        $xml .= '    <row r="1"><c r="A1" s="1" t="inlineStr"><is><t>LAPORAN DETAIL PRESENSI, KETERLAMBATAN &amp; LEMBUR KARYAWAN</t></is></c></row>' . "\n";
        // Row 2: Company
        $xml .= '    <row r="2"><c r="A2" s="2" t="inlineStr"><is><t>PT FASTLOG ERA MANDIRI</t></is></c></row>' . "\n";

        // Row 4: Nama Karyawan
        $xml .= '    <row r="4">' . "\n";
        $xml .= '      <c r="A4" s="3" t="inlineStr"><is><t>Nama Karyawan</t></is></c>' . "\n";
        $xml .= '      <c r="C4" s="3" t="inlineStr"><is><t>:</t></is></c>' . "\n";
        $xml .= '      <c r="D4" s="4" t="inlineStr"><is><t>' . $nama . '</t></is></c>' . "\n";
        $xml .= '    </row>' . "\n";

        // Row 5: ID / PIN
        $xml .= '    <row r="5">' . "\n";
        $xml .= '      <c r="A5" s="3" t="inlineStr"><is><t>ID / PIN</t></is></c>' . "\n";
        $xml .= '      <c r="C5" s="3" t="inlineStr"><is><t>:</t></is></c>' . "\n";
        $xml .= '      <c r="D5" s="4" t="inlineStr"><is><t>' . $pin . '</t></is></c>' . "\n";
        $xml .= '    </row>' . "\n";

        // Row 6: NIK
        $xml .= '    <row r="6">' . "\n";
        $xml .= '      <c r="A6" s="3" t="inlineStr"><is><t>NIK</t></is></c>' . "\n";
        $xml .= '      <c r="C6" s="3" t="inlineStr"><is><t>:</t></is></c>' . "\n";
        $xml .= '      <c r="D6" s="4" t="inlineStr"><is><t>' . $nik . '</t></is></c>' . "\n";
        $xml .= '    </row>' . "\n";

        // Row 7: Departemen
        $xml .= '    <row r="7">' . "\n";
        $xml .= '      <c r="A7" s="3" t="inlineStr"><is><t>Departemen</t></is></c>' . "\n";
        $xml .= '      <c r="C7" s="3" t="inlineStr"><is><t>:</t></is></c>' . "\n";
        $xml .= '      <c r="D7" s="4" t="inlineStr"><is><t>' . $dept . '</t></is></c>' . "\n";
        $xml .= '    </row>' . "\n";

        // Row 8: Jabatan
        $xml .= '    <row r="8">' . "\n";
        $xml .= '      <c r="A8" s="3" t="inlineStr"><is><t>Jabatan</t></is></c>' . "\n";
        $xml .= '      <c r="C8" s="3" t="inlineStr"><is><t>:</t></is></c>' . "\n";
        $xml .= '      <c r="D8" s="4" t="inlineStr"><is><t>' . $jabatan . '</t></is></c>' . "\n";
        $xml .= '    </row>' . "\n";

        // Row 9: Periode
        $xml .= '    <row r="9">' . "\n";
        $xml .= '      <c r="A9" s="3" t="inlineStr"><is><t>Periode</t></is></c>' . "\n";
        $xml .= '      <c r="C9" s="3" t="inlineStr"><is><t>:</t></is></c>' . "\n";
        $xml .= '      <c r="D9" s="4" t="inlineStr"><is><t>' . $periodeStr . '</t></is></c>' . "\n";
        $xml .= '    </row>' . "\n";

        // Row 11: Header tabel
        $xml .= '    <row r="11" ht="24" customHeight="1">' . "\n";
        $xml .= '      <c r="A11" s="5" t="inlineStr"><is><t>No</t></is></c>' . "\n";
        $xml .= '      <c r="B11" s="5" t="inlineStr"><is><t>Tanggal</t></is></c>' . "\n";
        $xml .= '      <c r="C11" s="5" t="inlineStr"><is><t>Hari</t></is></c>' . "\n";
        $xml .= '      <c r="D11" s="5" t="inlineStr"><is><t>Status</t></is></c>' . "\n";
        $xml .= '      <c r="E11" s="5" t="inlineStr"><is><t>Keterangan Status</t></is></c>' . "\n";
        $xml .= '      <c r="F11" s="5" t="inlineStr"><is><t>Jam Masuk</t></is></c>' . "\n";
        $xml .= '      <c r="G11" s="5" t="inlineStr"><is><t>Jam Pulang</t></is></c>' . "\n";
        $xml .= '      <c r="H11" s="5" t="inlineStr"><is><t>Terlambat (Menit)</t></is></c>' . "\n";
        $xml .= '      <c r="I11" s="5" t="inlineStr"><is><t>Lembur (Menit)</t></is></c>' . "\n";
        $xml .= '      <c r="J11" s="5" t="inlineStr"><is><t>Catatan / Alasan</t></is></c>' . "\n";
        $xml .= '    </row>' . "\n";

        // Data rows starting from Row 12
        foreach ($records as $idx => $r) {
            $rowNum = 12 + $idx;
            $no = $idx + 1;

            // Date serial
            $ts = strtotime(($r['date'] ?? '2026-01-01') . ' 00:00:00 UTC');
            $dateSerial = 25569 + (int)floor($ts / 86400);

            $dayName = htmlspecialchars($r['day_name'] ?? '', ENT_XML1);
            $status = htmlspecialchars($r['status'] ?? '-', ENT_XML1);
            $statusLabel = htmlspecialchars($r['status_label'] ?? '-', ENT_XML1);
            $note = htmlspecialchars($r['note'] ?? '-', ENT_XML1);
            $lateMinutes = (int)($r['late_minutes'] ?? 0);
            $otMinutes = (int)($r['overtime_minutes'] ?? 0);

            $xml .= "    <row r=\"{$rowNum}\">\n";
            // A: No
            $xml .= "      <c r=\"A{$rowNum}\" s=\"6\" t=\"n\"><v>{$no}</v></c>\n";
            // B: Tanggal
            $xml .= "      <c r=\"B{$rowNum}\" s=\"7\" t=\"n\"><v>{$dateSerial}</v></c>\n";
            // C: Hari
            $xml .= "      <c r=\"C{$rowNum}\" s=\"6\" t=\"inlineStr\"><is><t>{$dayName}</t></is></c>\n";
            // D: Status
            $xml .= "      <c r=\"D{$rowNum}\" s=\"8\" t=\"inlineStr\"><is><t>{$status}</t></is></c>\n";
            // E: Keterangan Status
            $xml .= "      <c r=\"E{$rowNum}\" s=\"9\" t=\"inlineStr\"><is><t>{$statusLabel}</t></is></c>\n";

            // F: Jam Masuk
            if (!empty($r['first_scan']) && preg_match('/^(\d{1,2}):(\d{2}):(\d{2})$/', $r['first_scan'], $mIn)) {
                $timeFraction = ($mIn[1] * 3600 + $mIn[2] * 60 + $mIn[3]) / 86400;
                $xml .= "      <c r=\"F{$rowNum}\" s=\"10\" t=\"n\"><v>{$timeFraction}</v></c>\n";
            } else {
                $xml .= "      <c r=\"F{$rowNum}\" s=\"10\" t=\"inlineStr\"><is><t>-</t></is></c>\n";
            }

            // G: Jam Pulang
            if (!empty($r['last_scan']) && preg_match('/^(\d{1,2}):(\d{2}):(\d{2})$/', $r['last_scan'], $mOut)) {
                $timeFraction = ($mOut[1] * 3600 + $mOut[2] * 60 + $mOut[3]) / 86400;
                $xml .= "      <c r=\"G{$rowNum}\" s=\"10\" t=\"n\"><v>{$timeFraction}</v></c>\n";
            } else {
                $xml .= "      <c r=\"G{$rowNum}\" s=\"10\" t=\"inlineStr\"><is><t>-</t></is></c>\n";
            }

            // H: Terlambat (Menit)
            $xml .= "      <c r=\"H{$rowNum}\" s=\"6\" t=\"n\"><v>{$lateMinutes}</v></c>\n";
            // I: Lembur (Menit)
            $xml .= "      <c r=\"I{$rowNum}\" s=\"6\" t=\"n\"><v>{$otMinutes}</v></c>\n";
            // J: Catatan / Alasan
            $xml .= "      <c r=\"J{$rowNum}\" s=\"9\" t=\"inlineStr\"><is><t>{$note}</t></is></c>\n";
            $xml .= "    </row>\n";
        }

        // Legend row
        $xml .= "    <row r=\"{$footerRow}\">\n";
        $xml .= "      <c r=\"A{$footerRow}\" s=\"11\" t=\"inlineStr\"><is><t>Keterangan status: H = Hadir Tepat Waktu, T = Terlambat, A = Alpha, OT = Overtime, I = Izin/Cuti, S = Sakit, L = Libur, LN = Libur Nasional</t></is></c>\n";
        $xml .= "    </row>\n";

        $xml .= '  </sheetData>' . "\n";

        // Conditional Formatting on Status column (D12:D{lastDataRow})
        if ($totalRecords > 0) {
            $xml .= '  <conditionalFormatting sqref="D12:D' . $lastDataRow . '">' . "\n";
            $xml .= '    <cfRule type="cellIs" priority="1" operator="equal" dxfId="0"><formula>"H"</formula></cfRule>' . "\n";
            $xml .= '    <cfRule type="cellIs" priority="2" operator="equal" dxfId="1"><formula>"T"</formula></cfRule>' . "\n";
            $xml .= '    <cfRule type="cellIs" priority="3" operator="equal" dxfId="2"><formula>"A"</formula></cfRule>' . "\n";
            $xml .= '    <cfRule type="cellIs" priority="4" operator="equal" dxfId="3"><formula>"OT"</formula></cfRule>' . "\n";
            $xml .= '    <cfRule type="cellIs" priority="5" operator="equal" dxfId="4"><formula>"I"</formula></cfRule>' . "\n";
            $xml .= '    <cfRule type="cellIs" priority="6" operator="equal" dxfId="5"><formula>"S"</formula></cfRule>' . "\n";
            $xml .= '    <cfRule type="cellIs" priority="7" operator="equal" dxfId="6"><formula>"L"</formula></cfRule>' . "\n";
            $xml .= '    <cfRule type="cellIs" priority="8" operator="equal" dxfId="7"><formula>"LN"</formula></cfRule>' . "\n";
            $xml .= '  </conditionalFormatting>' . "\n";
        }

        $xml .= '  <pageMargins left="0.75" right="0.75" top="1" bottom="1" header="0.5" footer="0.5"/>' . "\n";
        $xml .= '  <pageSetup orientation="landscape" paperSize="9" fitToHeight="0" fitToWidth="1"/>' . "\n";
        $xml .= '</worksheet>' . "\n";

        return $xml;
    }

    private function buildEntirePackage(string $targetFile, array $employee, array $records, string $startDate, string $endDate): void
    {
        $zip = new ZipArchive();
        $zip->open($targetFile, ZipArchive::CREATE | ZipArchive::OVERWRITE);

        $zip->addFromString('[Content_Types].xml', $this->getContentTypesXml());
        $zip->addFromString('_rels/.rels', $this->getRelsXml());
        $zip->addFromString('docProps/app.xml', $this->getAppXml());
        $zip->addFromString('docProps/core.xml', $this->getCoreXml());
        $zip->addFromString('xl/_rels/workbook.xml.rels', $this->getWorkbookRelsXml());
        $zip->addFromString('xl/workbook.xml', $this->getWorkbookXml());
        $zip->addFromString('xl/styles.xml', $this->getStylesXml());
        $zip->addFromString('xl/theme/theme1.xml', $this->getThemeXml());

        $sheetXml = $this->buildSheetXml($employee, $records, $startDate, $endDate);
        $zip->addFromString('xl/worksheets/sheet1.xml', $sheetXml);

        $zip->close();
    }

    private function getContentTypesXml(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n" .
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' .
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' .
            '<Default Extension="xml" ContentType="application/xml"/>' .
            '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' .
            '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' .
            '<Override PartName="/xl/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>' .
            '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' .
            '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' .
            '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>' .
            '</Types>';
    }

    private function getRelsXml(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n" .
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' .
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' .
            '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>' .
            '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>' .
            '</Relationships>';
    }

    private function getAppXml(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n" .
            '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">' .
            '<Application>Microsoft Excel</Application>' .
            '</Properties>';
    }

    private function getCoreXml(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n" .
            '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' .
            '<dc:creator>PT FASTLOG ERA MANDIRI</dc:creator>' .
            '<cp:lastModifiedBy>PT FASTLOG ERA MANDIRI</cp:lastModifiedBy>' .
            '</cp:coreProperties>';
    }

    private function getWorkbookRelsXml(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n" .
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' .
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' .
            '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>' .
            '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' .
            '</Relationships>';
    }

    private function getWorkbookXml(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n" .
            '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' .
            '<workbookPr/><workbookProtection/>' .
            '<bookViews><workbookView visibility="visible" minimized="0" showHorizontalScroll="1" showVerticalScroll="1" showSheetTabs="1" tabRatio="600" firstSheet="0" activeTab="0" autoFilterDateGrouping="1"/></bookViews>' .
            '<sheets><sheet xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" name="Laporan Presensi" sheetId="1" state="visible" r:id="rId1"/></sheets>' .
            '<calcPr calcId="124519" fullCalcOnLoad="1"/>' .
            '</workbook>';
    }

    private function getStylesXml(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n" .
            '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' .
            '<numFmts count="3">' .
            '<numFmt numFmtId="164" formatCode="yyyy-mm-dd h:mm:ss"/>' .
            '<numFmt numFmtId="165" formatCode="dd/mm/yyyy"/>' .
            '<numFmt numFmtId="166" formatCode="hh:mm:ss"/>' .
            '</numFmts>' .
            '<fonts count="7">' .
            '<font><name val="Calibri"/><family val="2"/><color theme="1"/><sz val="11"/><scheme val="minor"/></font>' .
            '<font><name val="Arial"/><b val="1"/><sz val="13"/></font>' .
            '<font><name val="Arial"/><b val="1"/><sz val="11"/></font>' .
            '<font><name val="Arial"/><sz val="10"/></font>' .
            '<font><name val="Arial"/><b val="1"/><sz val="10"/></font>' .
            '<font><name val="Arial"/><b val="1"/><color rgb="00FFFFFF"/><sz val="10"/></font>' .
            '<font><name val="Arial"/><i val="1"/><sz val="9"/></font>' .
            '</fonts>' .
            '<fills count="3">' .
            '<fill><patternFill/></fill>' .
            '<fill><patternFill patternType="gray125"/></fill>' .
            '<fill><patternFill patternType="solid"><fgColor rgb="001F3864"/><bgColor rgb="001F3864"/></patternFill></fill>' .
            '</fills>' .
            '<borders count="2">' .
            '<border><left/><right/><top/><bottom/><diagonal/></border>' .
            '<border>' .
            '<left style="thin"><color rgb="00BFBFBF"/></left>' .
            '<right style="thin"><color rgb="00BFBFBF"/></right>' .
            '<top style="thin"><color rgb="00BFBFBF"/></top>' .
            '<bottom style="thin"><color rgb="00BFBFBF"/></bottom>' .
            '</border>' .
            '</borders>' .
            '<cellStyleXfs count="1">' .
            '<xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>' .
            '</cellStyleXfs>' .
            '<cellXfs count="12">' .
            '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" pivotButton="0" quotePrefix="0" xfId="0"/>' . // 0
            '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" pivotButton="0" quotePrefix="0" xfId="0"/>' . // 1
            '<xf numFmtId="0" fontId="2" fillId="0" borderId="0" pivotButton="0" quotePrefix="0" xfId="0"/>' . // 2
            '<xf numFmtId="0" fontId="3" fillId="0" borderId="0" pivotButton="0" quotePrefix="0" xfId="0"/>' . // 3
            '<xf numFmtId="0" fontId="4" fillId="0" borderId="0" applyAlignment="1" pivotButton="0" quotePrefix="0" xfId="0"><alignment horizontal="left"/></xf>' . // 4
            '<xf numFmtId="0" fontId="5" fillId="2" borderId="1" applyAlignment="1" pivotButton="0" quotePrefix="0" xfId="0"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>' . // 5 (Header table)
            '<xf numFmtId="0" fontId="3" fillId="0" borderId="1" applyAlignment="1" pivotButton="0" quotePrefix="0" xfId="0"><alignment horizontal="center" vertical="center"/></xf>' . // 6 (Center numbers)
            '<xf numFmtId="165" fontId="3" fillId="0" borderId="1" applyAlignment="1" pivotButton="0" quotePrefix="0" xfId="0"><alignment horizontal="center" vertical="center"/></xf>' . // 7 (Date dd/mm/yyyy)
            '<xf numFmtId="0" fontId="4" fillId="0" borderId="1" applyAlignment="1" pivotButton="0" quotePrefix="0" xfId="0"><alignment horizontal="center" vertical="center"/></xf>' . // 8 (Status code bold)
            '<xf numFmtId="0" fontId="3" fillId="0" borderId="1" applyAlignment="1" pivotButton="0" quotePrefix="0" xfId="0"><alignment horizontal="left" vertical="center"/></xf>' . // 9 (Left text)
            '<xf numFmtId="166" fontId="3" fillId="0" borderId="1" applyAlignment="1" pivotButton="0" quotePrefix="0" xfId="0"><alignment horizontal="center" vertical="center"/></xf>' . // 10 (Time hh:mm:ss)
            '<xf numFmtId="0" fontId="6" fillId="0" borderId="0" pivotButton="0" quotePrefix="0" xfId="0"/>' . // 11 (Legend italic)
            '</cellXfs>' .
            '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0" hidden="0"/></cellStyles>' .
            '<dxfs count="8">' .
            // dxf 0: H (bg: #DDEBF7, fg: #001F3864)
            '<dxf><font><name val="Arial"/><b val="1"/><color rgb="001F3864"/></font><fill><patternFill patternType="solid"><fgColor rgb="00DDEBF7"/><bgColor rgb="00DDEBF7"/></patternFill></fill></dxf>' .
            // dxf 1: T (bg: #FFF2CC, fg: #007F6000)
            '<dxf><font><name val="Arial"/><b val="1"/><color rgb="007F6000"/></font><fill><patternFill patternType="solid"><fgColor rgb="00FFF2CC"/><bgColor rgb="00FFF2CC"/></patternFill></fill></dxf>' .
            // dxf 2: A (bg: #F8CBAD, fg: #009C0006)
            '<dxf><font><name val="Arial"/><b val="1"/><color rgb="009C0006"/></font><fill><patternFill patternType="solid"><fgColor rgb="00F8CBAD"/><bgColor rgb="00F8CBAD"/></patternFill></fill></dxf>' .
            // dxf 3: OT (bg: #FCE4D6, fg: #00C65911)
            '<dxf><font><name val="Arial"/><b val="1"/><color rgb="00C65911"/></font><fill><patternFill patternType="solid"><fgColor rgb="00FCE4D6"/><bgColor rgb="00FCE4D6"/></patternFill></fill></dxf>' .
            // dxf 4: I (bg: #DDEBF7, fg: #001F4E79)
            '<dxf><font><name val="Arial"/><b val="1"/><color rgb="001F4E79"/></font><fill><patternFill patternType="solid"><fgColor rgb="00DDEBF7"/><bgColor rgb="00DDEBF7"/></patternFill></fill></dxf>' .
            // dxf 5: S (bg: #E4DFEC, fg: #005B2C83)
            '<dxf><font><name val="Arial"/><b val="1"/><color rgb="005B2C83"/></font><fill><patternFill patternType="solid"><fgColor rgb="00E4DFEC"/><bgColor rgb="00E4DFEC"/></patternFill></fill></dxf>' .
            // dxf 6: L (bg: #E7E6E6, fg: #00595959)
            '<dxf><font><name val="Arial"/><b val="1"/><color rgb="00595959"/></font><fill><patternFill patternType="solid"><fgColor rgb="00E7E6E6"/><bgColor rgb="00E7E6E6"/></patternFill></fill></dxf>' .
            // dxf 7: LN (bg: #F4CCCC, fg: #00990000)
            '<dxf><font><name val="Arial"/><b val="1"/><color rgb="00990000"/></font><fill><patternFill patternType="solid"><fgColor rgb="00F4CCCC"/><bgColor rgb="00F4CCCC"/></patternFill></fill></dxf>' .
            '</dxfs>' .
            '</styleSheet>';
    }

    private function getThemeXml(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n" .
            '<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme">' .
            '<a:themeElements><a:clrScheme name="Office"><a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1><a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="1F497D"/></a:dk2><a:lt2><a:srgbClr val="EEECE1"/></a:lt2><a:accent1><a:srgbClr val="4F81BD"/></a:accent1><a:accent2><a:srgbClr val="C0504D"/></a:accent2><a:accent3><a:srgbClr val="9BBB59"/></a:accent3><a:accent4><a:srgbClr val="8064A2"/></a:accent4><a:accent5><a:srgbClr val="4BACC6"/></a:accent5><a:accent6><a:srgbClr val="F79646"/></a:accent6><a:hlink><a:srgbClr val="0000FF"/></a:hlink><a:folHlink><a:srgbClr val="800080"/></a:folHlink></a:clrScheme>' .
            '<a:fontScheme name="Office"><a:majorFont><a:latin typeface="Cambria"/></a:majorFont><a:minorFont><a:latin typeface="Calibri"/></a:minorFont></a:fontScheme>' .
            '<a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="50000"/><a:satMod val="300000"/></a:schemeClr></a:gs><a:gs pos="35000"><a:schemeClr val="phClr"><a:tint val="37000"/><a:satMod val="220000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:tint val="15000"/><a:satMod val="130000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="16200000"/></a:gradFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:shade val="51000"/><a:satMod val="130000"/></a:schemeClr></a:gs><a:gs pos="80000"><a:schemeClr val="phClr"><a:shade val="93000"/><a:satMod val="130000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="94000"/><a:satMod val="135000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="16200000"/></a:gradFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525" cap="flat" cmpd="s" algn="ctr"><a:solidFill><a:schemeClr val="phClr"><a:shade val="95000"/><a:satMod val="105000"/></a:schemeClr></a:solidFill><a:prstDash val="solid"/></a:ln><a:ln w="25400" cap="flat" cmpd="s" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln><a:ln w="38100" cap="flat" cmpd="s" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="40000"/><a:satMod val="350000"/></a:schemeClr></a:gs><a:gs pos="40000"><a:schemeClr val="phClr"><a:tint val="45000"/><a:shade val="99000"/><a:satMod val="350000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="20000"/><a:satMod val="255000"/></a:schemeClr></a:gs></a:gsLst><a:path path="circle"><a:fillToRect l="50000" t="-80000" r="50000" b="180000"/></a:path></a:gradFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="80000"/><a:satMod val="300000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="30000"/><a:satMod val="200000"/></a:schemeClr></a:gs></a:gsLst><a:path path="circle"><a:fillToRect l="50000" t="50000" r="50000" b="50000"/></a:path></a:gradFill></a:bgFillStyleLst></a:fmtScheme>' .
            '</a:themeElements>' .
            '</a:theme>';
    }
}
