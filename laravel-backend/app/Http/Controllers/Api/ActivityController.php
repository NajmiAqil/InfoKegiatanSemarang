<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    public function index(Request $request)
    {
        $username = $request->query('username');
        $pembuat = $request->query('pembuat'); // Filter untuk melihat kegiatan bawahan tertentu
        
        // Get today's date
        $today = date('Y-m-d');
        
        // Get all activities
        $query = Activity::orderBy('tanggal')->orderBy('jam_mulai');
        
        // Jika ada parameter pembuat, show semua activities dari pembuat tersebut (termasuk private)
        if ($pembuat) {
            $query->where('pembuat', $pembuat);
        } 
        // Filter activities based on visibility
        elseif ($username) {
            // Untuk dashboard (atasan/bawahan): show public, kantor, dan private milik sendiri
            $query->where(function($q) use ($username) {
                $q->where('visibility', 'public')
                  ->orWhere('visibility', 'kantor')
                  ->orWhere(function($q2) use ($username) {
                      $q2->where('visibility', 'private')
                         ->where('pembuat', $username);
                  });
            });
        } else {
            // Untuk homepage (InfoDisplay): hanya show public
            $query->where('visibility', 'public');
        }
        
        $allActivities = $query->get();
        
        // Separate by date
        $todayActivities = $allActivities->filter(function($activity) use ($today) {
            return $activity->tanggal === $today;
        })->values();
        
        $tomorrowActivities = $allActivities->filter(function($activity) use ($today) {
            return $activity->tanggal > $today;
        })->values();
        
        return response()->json([
            'today' => $todayActivities,
            'tomorrow' => $tomorrowActivities
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'judul' => 'required|string|max:255',
                'tanggal' => 'required|string',
                'tanggal_berakhir' => 'nullable|string',
                'jenis_kegiatan' => 'required|string',
                'jam_mulai' => 'required|string',
                'jam_berakhir' => 'required|string',
                'lokasi' => 'required|string',
                'visibility' => 'required|in:public,private,kantor',
                'deskripsi' => 'nullable|string',
                'orang_terkait' => 'nullable|string',
                'pembuat' => 'required|string',
                'media' => 'nullable|array',
                'media.*' => 'file|mimes:jpeg,png,jpg,gif,mp4,avi,mov|max:20480', // max 20MB
                'repeat' => 'required|in:yes,no',
                'repeat_frequency' => 'nullable|in:daily,weekly,monthly,yearly',
                'repeat_end_date' => 'nullable|string',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }

        // Handle file uploads
        $mediaPaths = [];
        if ($request->hasFile('media')) {
            foreach ($request->file('media') as $file) {
                $path = $file->store('activities', 'public');
                $mediaPaths[] = $path;
            }
        }

        // Auto-generate 'no' based on existing count
        $maxNo = Activity::max('no') ?? 0;
        
        $activity = Activity::create([
            'no' => $maxNo + 1,
            'kegiatan' => $validated['judul'], // backward compatibility
            'judul' => $validated['judul'],
            'tanggal' => $validated['tanggal'],
            'tanggal_berakhir' => $validated['tanggal_berakhir'] ?? $validated['tanggal'],
            'jam' => $validated['jam_mulai'], // backward compatibility
            'jam_mulai' => $validated['jam_mulai'],
            'jam_berakhir' => $validated['jam_berakhir'],
            'tempat' => $validated['lokasi'], // backward compatibility
            'lokasi' => $validated['lokasi'],
            'jenis' => 'today', // will be auto-determined based on date
            'jenis_kegiatan' => $validated['jenis_kegiatan'],
            'visibility' => $validated['visibility'],
            'deskripsi' => $validated['deskripsi'] ?? null,
            'orang_terkait' => $validated['orang_terkait'] ?? null,
            'pembuat' => $validated['pembuat'],
            'media' => $mediaPaths,
            'repeat' => $validated['repeat'],
            'repeat_frequency' => $validated['repeat'] === 'yes' ? $validated['repeat_frequency'] : null,
            'repeat_end_date' => $validated['repeat'] === 'yes' ? ($validated['repeat_end_date'] ?? null) : null,
        ]);

        return response()->json($activity, 201);
    }

    public function show($id)
    {
        $activity = Activity::find($id);
        
        if (!$activity) {
            return response()->json(['message' => 'Activity not found'], 404);
        }
        
        return response()->json($activity);
    }

    public function update(Request $request, $id)
    {
        $activity = Activity::find($id);
        
        if (!$activity) {
            return response()->json(['message' => 'Activity not found'], 404);
        }

        try {
            $validated = $request->validate([
                'judul' => 'required|string|max:255',
                'tanggal' => 'required|string',
                'tanggal_berakhir' => 'nullable|string',
                'jenis_kegiatan' => 'required|string',
                'jam_mulai' => 'required|string',
                'jam_berakhir' => 'required|string',
                'lokasi' => 'required|string',
                'visibility' => 'required|in:public,private,kantor',
                'deskripsi' => 'nullable|string',
                'orang_terkait' => 'nullable|string',
                'pembuat' => 'required|string',
                'media' => 'nullable|array',
                'media.*' => 'file|mimes:jpeg,png,jpg,gif,mp4,avi,mov|max:20480',
                'repeat' => 'required|in:yes,no',
                'repeat_frequency' => 'nullable|in:daily,weekly,monthly,yearly',
                'repeat_end_date' => 'nullable|string',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }

        // Handle file uploads
        $mediaPaths = $activity->media ?? [];
        if ($request->hasFile('media')) {
            foreach ($request->file('media') as $file) {
                $path = $file->store('activities', 'public');
                $mediaPaths[] = $path;
            }
        }

        $activity->update([
            'kegiatan' => $validated['judul'],
            'judul' => $validated['judul'],
            'tanggal' => $validated['tanggal'],
            'tanggal_berakhir' => $validated['tanggal_berakhir'] ?? $validated['tanggal'],
            'jam' => $validated['jam_mulai'],
            'jam_mulai' => $validated['jam_mulai'],
            'jam_berakhir' => $validated['jam_berakhir'],
            'tempat' => $validated['lokasi'],
            'lokasi' => $validated['lokasi'],
            'jenis_kegiatan' => $validated['jenis_kegiatan'],
            'visibility' => $validated['visibility'],
            'deskripsi' => $validated['deskripsi'] ?? null,
            'orang_terkait' => $validated['orang_terkait'] ?? null,
            'pembuat' => $validated['pembuat'],
            'media' => $mediaPaths,
            'repeat' => $validated['repeat'],
            'repeat_frequency' => $validated['repeat'] === 'yes' ? $validated['repeat_frequency'] : null,
            'repeat_end_date' => $validated['repeat'] === 'yes' ? ($validated['repeat_end_date'] ?? null) : null,
        ]);

        return response()->json($activity);
    }

    public function destroy($id)
    {
        $activity = Activity::find($id);
        
        if (!$activity) {
            return response()->json(['message' => 'Activity not found'], 404);
        }

        $activity->delete();
        
        return response()->json(['message' => 'Activity deleted successfully']);
    }
}
