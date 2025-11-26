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
        Schema::dropIfExists('news');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('news', function (Blueprint $table) {
            $table->id();
            $table->string('judul');
            $table->text('konten')->nullable();
            $table->string('kategori')->nullable();
            $table->json('media')->nullable();
            $table->string('pembuat')->nullable();
            $table->timestamps();
        });
    }
};
