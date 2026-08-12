<?php

use Illuminate\Support\Facades\Route;

<<<<<<< HEAD
// Dashboard (tampilan yang sudah ada)
Route::get('/', function () {
    return view('user.layouts.app');
});

// Halaman Login 
Route::get('/login', function () {
    return view('user.auth.login');
});
=======
// Catch-all route to serve the React SPA
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
>>>>>>> f5ba3a1f5ae1ac4bb1e3f7cbb94ee648b226616d
