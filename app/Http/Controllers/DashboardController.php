<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        // Di sini nantinya tempat mengambil data dari DB (absensi, mesin, dll)
        
        // Menampilkan view 'index.blade.php' yang sudah kita buat sebelumnya
        return view('index'); 
    }
}