<?php

use Illuminate\Support\Facades\Route;

// Dashboard (tampilan yang sudah ada)
Route::get('/', function () {
    return view('user.layouts.app');
});

// Halaman Login 
Route::get('/login', function () {
    return view('user.auth.login');
});