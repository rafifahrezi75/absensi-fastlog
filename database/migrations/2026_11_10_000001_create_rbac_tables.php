<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('label');
            $table->text('description')->nullable();
            $table->boolean('is_system')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('app_permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('label');
            $table->string('group_name');
            $table->timestamps();
        });

        Schema::create('role_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['user_id', 'role_id']);
        });

        Schema::create('app_permission_role', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('app_permission_id')->constrained('app_permissions')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['role_id', 'app_permission_id']);
        });

        Schema::create('app_permission_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('app_permission_id')->constrained('app_permissions')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['user_id', 'app_permission_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_permission_user');
        Schema::dropIfExists('app_permission_role');
        Schema::dropIfExists('role_user');
        Schema::dropIfExists('app_permissions');
        Schema::dropIfExists('roles');
    }
};

