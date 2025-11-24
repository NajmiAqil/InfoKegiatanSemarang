<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Activity;

class ActivitySeeder extends Seeder
{
    public function run(): void
    {
        // Today's activities
        Activity::create([
            'no' => 1,
            'kegiatan' => 'Rapat Koordinasi Pengembangan Smart City',
            'tanggal' => '9 November 2025',
            'jam' => '09:00',
            'tempat' => 'Ruang Rapat Diskominfo Lt. 2',
            'jenis' => 'today'
        ]);

        Activity::create([
            'no' => 2,
            'kegiatan' => 'Workshop Digital Marketing UMKM',
            'tanggal' => '9 November 2025',
            'jam' => '13:00',
            'tempat' => 'Aula Diskominfo',
            'jenis' => 'today'
        ]);

        Activity::create([
            'no' => 3,
            'kegiatan' => 'Pelatihan Sistem Informasi Terpadu',
            'tanggal' => '9 November 2025',
            'jam' => '15:30',
            'tempat' => 'Lab Komputer Diskominfo',
            'jenis' => 'today'
        ]);

        // Tomorrow's activities
        Activity::create([
            'no' => 1,
            'kegiatan' => 'Launching Aplikasi Pelayanan Publik',
            'tanggal' => '10 November 2025',
            'jam' => '08:00',
            'tempat' => 'Balaikota Semarang',
            'jenis' => 'tomorrow'
        ]);

        Activity::create([
            'no' => 2,
            'kegiatan' => 'Sosialisasi E-Government',
            'tanggal' => '10 November 2025',
            'jam' => '10:30',
            'tempat' => 'Ruang Serbaguna Lt. 1',
            'jenis' => 'tomorrow'
        ]);

        Activity::create([
            'no' => 3,
            'kegiatan' => 'Evaluasi Kinerja TIK Triwulan',
            'tanggal' => '10 November 2025',
            'jam' => '14:00',
            'tempat' => 'Ruang Rapat Utama',
            'jenis' => 'tomorrow'
        ]);
    }
}
