<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Activity;

$username = 'Aqil';

echo "Testing query for username: {$username}\n\n";

$activities = Activity::where(function($q) use ($username) {
    $q->where('visibility', 'public')
      ->orWhere('visibility', 'kantor')
      ->orWhere(function($q2) use ($username) {
          $q2->where('visibility', 'private')
             ->where(function($q3) use ($username) {
                 $q3->where('pembuat', $username)
                    ->orWhereRaw('LOWER(orang_terkait) LIKE ?', ['%' . strtolower($username) . '%']);
             });
      });
})->get(['id', 'judul', 'visibility', 'orang_terkait', 'pembuat', 'tanggal']);

echo "Found " . $activities->count() . " activities:\n\n";

foreach ($activities as $activity) {
    echo "ID: {$activity->id}\n";
    echo "Judul: {$activity->judul}\n";
    echo "Visibility: {$activity->visibility}\n";
    echo "Pembuat: {$activity->pembuat}\n";
    echo "Orang Terkait: {$activity->orang_terkait}\n";
    echo "Tanggal: {$activity->tanggal}\n";
    echo "---\n";
}
