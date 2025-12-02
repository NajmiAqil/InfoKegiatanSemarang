<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            // Add tanggal_berakhir index if not exists
            try {
                $table->index('tanggal_berakhir', 'idx_activities_tanggal_berakhir');
            } catch (\Exception $e) {
                // Index may already exist, ignore
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            try {
                $table->dropIndex('idx_activities_tanggal_berakhir');
            } catch (\Exception $e) {
                // Index may not exist, ignore
            }
        });
    }
};
