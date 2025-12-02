<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    protected $fillable = [
        'no',
        'kegiatan',
        'judul',
        'tanggal',
        'tanggal_berakhir',
        'jam',
        'jam_mulai',
        'jam_berakhir',
        'tempat',
        'lokasi',
        'jenis',
        'jenis_kegiatan',
        'visibility',
        'deskripsi',
        'orang_terkait',
        'external_contacts',
        'pembuat',
        'opd',
        'media',
        'repeat',
        'repeat_frequency',
        'repeat_end_date',
        'is_approved',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'media' => 'array',
        'external_contacts' => 'array',
    ];
}