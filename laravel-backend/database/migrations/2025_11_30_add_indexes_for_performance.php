<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add indexes to improve query performance
     */
    public function up(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            // Index untuk filtering by date
            $table->index('tanggal', 'idx_activities_tanggal');
            
            // Index untuk tanggal_berakhir (multi-day events)
            $table->index('tanggal_berakhir', 'idx_activities_tanggal_berakhir');
            
            // Index untuk filtering by pembuat
            $table->index('pembuat', 'idx_activities_pembuat');
            
            // Index untuk filtering by visibility
            $table->index('visibility', 'idx_activities_visibility');
            
            // Index untuk filtering by OPD
            $table->index('opd', 'idx_activities_opd');
            
            // Composite index untuk common query pattern (tanggal + visibility)
            $table->index(['tanggal', 'visibility'], 'idx_activities_tanggal_visibility');
            
            // Composite index untuk OPD scoping (opd + visibility)
            $table->index(['opd', 'visibility'], 'idx_activities_opd_visibility');
        });

        Schema::table('users', function (Blueprint $table) {
            // Index untuk username lookup (login, authorization)
            $table->index('username', 'idx_users_username');
            
            // Index untuk status filtering (pending approval)
            $table->index('status', 'idx_users_status');
            
            // Index untuk role filtering
            $table->index('role', 'idx_users_role');
            
            // Index untuk OPD filtering
            $table->index('opd', 'idx_users_opd');
            
            // Composite index untuk approval workflow (status + role)
            $table->index(['status', 'role'], 'idx_users_status_role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->dropIndex('idx_activities_tanggal');
            $table->dropIndex('idx_activities_tanggal_berakhir');
            $table->dropIndex('idx_activities_pembuat');
            $table->dropIndex('idx_activities_visibility');
            $table->dropIndex('idx_activities_opd');
            $table->dropIndex('idx_activities_tanggal_visibility');
            $table->dropIndex('idx_activities_opd_visibility');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_username');
            $table->dropIndex('idx_users_status');
            $table->dropIndex('idx_users_role');
            $table->dropIndex('idx_users_opd');
            $table->dropIndex('idx_users_status_role');
        });
    }
};
