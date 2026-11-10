<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Sistem Informasi Absensi dan Payroll FastLog Era Mandiri">
    <meta name="theme-color" content="#052B35">
    <link rel="icon" type="image/webp" href="/images/front-end/logo3.webp">
    <link rel="preload" as="image" href="/images/front-end/logo3.webp" type="image/webp">
    <title>FastLog - Absensi</title>
    <script>
        @php
            $initialAuth = null;
            if (Auth::check()) {
                $u = Auth::user()->load(['employee', 'roles']);
                $initialAuth = [
                    'user' => $u,
                    'roles' => $u->roles->pluck('name')->values(),
                    'permissions' => $u->permissions(),
                ];
            }
        @endphp
        window.__INITIAL_AUTH__ = @json($initialAuth);
        window.__INITIAL_USER__ = @json($initialAuth ? $initialAuth['user'] : null);
    </script>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/main.jsx'])
</head>
<body class="bg-gray-100 text-gray-900 antialiased font-sans">
    <div id="root"></div>
</body>
</html>
