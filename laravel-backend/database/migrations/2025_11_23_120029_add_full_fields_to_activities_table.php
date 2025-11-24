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
            $table->string('judul')->nullable()->after('kegiatan');
            $table->string('jenis_kegiatan')->nullable()->after('jenis');
            $table->string('jam_mulai')->nullable()->after('jam');
            $table->string('jam_berakhir')->nullable()->after('jam_mulai');
            $table->string('lokasi')->nullable()->after('tempat');
            $table->enum('visibility', ['public', 'private'])->default('public')->after('lokasi');
            $table->text('deskripsi')->nullable()->after('visibility');
            $table->string('orang_terkait')->nullable()->after('deskripsi');
            $table->string('pembuat')->nullable()->after('orang_terkait');
            $table->json('media')->nullable()->after('pembuat'); // untuk foto/video paths
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->dropColumn(['judul', 'jenis_kegiatan', 'jam_mulai', 'jam_berakhir', 'lokasi', 'visibility', 'deskripsi', 'orang_terkait', 'pembuat', 'media']);
        });
    }
};
