<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->string('nama', 150)->nullable()->change();
            $table->string('cloud_id', 50)->nullable()->after('pin');
            $table->string('trans_id', 50)->nullable()->after('cloud_id');
            $table->string('privilege', 20)->nullable()->after('trans_id');
            $table->string('finger', 20)->nullable()->after('privilege');
            $table->string('face', 20)->nullable()->after('finger');
            $table->string('password', 255)->nullable()->after('face');
            $table->string('rfid', 100)->nullable()->after('password');
            $table->string('vein', 20)->nullable()->after('rfid');
            $table->longText('template')->nullable()->after('vein');
            $table->json('raw_data')->nullable()->after('template');
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn([
                'cloud_id',
                'trans_id',
                'privilege',
                'finger',
                'face',
                'password',
                'rfid',
                'vein',
                'template',
                'raw_data',
            ]);
        });
    }
};
