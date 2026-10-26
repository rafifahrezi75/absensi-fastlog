<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('permissions') && !Schema::hasColumn('permissions', 'tipe_lembur')) {
            Schema::table('permissions', function (Blueprint $table) {
                $table->string('tipe_lembur', 50)->nullable()->after('category');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('permissions') && Schema::hasColumn('permissions', 'tipe_lembur')) {
            Schema::table('permissions', function (Blueprint $table) {
                $table->dropColumn('tipe_lembur');
            });
        }
    }
};
