<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->string('visibility_new')->default('public')->after('lokasi');
        });

        // Copy existing visibility values into the new column
        DB::table('activities')->update([
            'visibility_new' => DB::raw('visibility')
        ]);

        Schema::table('activities', function (Blueprint $table) {
            $table->dropColumn('visibility');
        });

        Schema::table('activities', function (Blueprint $table) {
            $table->renameColumn('visibility_new', 'visibility');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate enum-like behavior (public/private) if rolling back
        Schema::table('activities', function (Blueprint $table) {
            $table->enum('visibility_old', ['public', 'private'])->default('public')->after('lokasi');
        });

        DB::table('activities')->update([
            'visibility_old' => DB::raw('visibility')
        ]);

        Schema::table('activities', function (Blueprint $table) {
            $table->dropColumn('visibility');
        });

        Schema::table('activities', function (Blueprint $table) {
            $table->renameColumn('visibility_old', 'visibility');
        });
    }
};
