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
            // Untuk dashboard (atasan/bawahan): show public, kantor, private milik sendiri, dan private yang melibatkan user
            $query->where(function($q) use ($username) {
                $q->where('visibility', 'public')
                  ->orWhere('visibility', 'kantor')
                  ->orWhere(function($q2) use ($username) {
                      $q2->where('visibility', 'private')
                         ->where(function($q3) use ($username) {
                             // Private milik sendiri atau user ada di orang_terkait (SQLite compatible)
                             $q3->where('pembuat', $username)
                                ->orWhereRaw('LOWER(orang_terkait) LIKE ?', ['%"' . strtolower($username) . '"%']);
                         });
                  });
            });
        } else {
            // Untuk homepage (InfoDisplay): tampilkan public + kantor (private tetap disembunyikan)
            $query->whereIn('visibility', ['public', 'kantor']);
        }
        
        $allActivities = $query->get();
        
        // Separate by date (support multi-day: show in 'today' if today between tanggal and tanggal_berakhir)
        $todayActivities = $allActivities->filter(function($activity) use ($today) {
            $start = $activity->tanggal;
            $end = $activity->tanggal_berakhir ?: $activity->tanggal;
            return $start <= $today && $today <= $end;
        })->values();

        $tomorrowActivities = $allActivities->filter(function($activity) use ($today) {
            // Tomorrow & future (strictly after today end range)
            return $activity->tanggal > $today;
        })->values();
        
        return response()->json([
            'today' => $todayActivities,
            'tomorrow' => $tomorrowActivities
        ]);
    }

    public function store(Request $request)
    {
        // Log incoming request for debugging
        \Log::info('Activity store request:', [
            'all_data' => $request->all(),
            'has_files' => $request->hasFile('media')
        ]);

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
                'media.*' => 'mimes:jpeg,png,jpg,gif,mp4,avi,mov|max:20480', // max 20MB
                'repeat' => 'required|in:yes,no',
                'repeat_frequency' => 'nullable|in:daily,weekly,monthly,yearly',
                'repeat_end_date' => 'nullable|string',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed:', $e->errors());
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Unexpected error in validation:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }

        // Handle file uploads
        $mediaPaths = [];
        if ($request->hasFile('media')) {
            foreach ((array) $request->file('media') as $file) {
                if ($file && $file->isValid()) {
                    $path = $file->store('activities', 'public');
                    $mediaPaths[] = $path;
                } else {
                    \Log::warning('Skipping invalid media upload');
                }
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

    public function show(Request $request, $id)
    {
        $activity = Activity::find($id);

        if (!$activity) {
            return response()->json(['message' => 'Activity not found'], 404);
        }

        $username = $request->query('username');
        $role = $request->query('role');

        // Visibility rules:
        // - public: always visible
        // - kantor: visible only if a username is provided (treated as logged-in)
        // - private: visible only to pembuat or orang_terkait
        if ($activity->visibility === 'public') {
            return response()->json($activity);
        }

        if ($activity->visibility === 'kantor') {
            if (!$username) {
                return response()->json(['message' => 'Unauthorized: login required to view this activity'], 403);
            }
            return response()->json($activity);
        }

        if ($activity->visibility === 'private') {
            // Normalize case for comparison
            $usernameLower = $username ? strtolower($username) : null;
            $pembuatLower = $activity->pembuat ? strtolower($activity->pembuat) : null;

            if ($usernameLower && $usernameLower === $pembuatLower) {
                return response()->json($activity);
            }

            // Check orang_terkait JSON for username
            $related = [];
            if (!empty($activity->orang_terkait)) {
                $decoded = json_decode($activity->orang_terkait, true);
                if (is_array($decoded)) {
                    $related = $decoded;
                } else {
                    // Fallback: if stored as comma-separated or plain text
                    $related = array_filter(array_map('trim', explode(',', (string) $activity->orang_terkait)));
                }
            }

            // Case-insensitive membership check (related users)
            $relatedLower = array_map(function($u) { return strtolower($u); }, $related);
            if ($usernameLower && in_array($usernameLower, $relatedLower, true)) {
                return response()->json($activity);
            }

            // Atasan override: when viewing via sidebar (role=atasan), allow viewing private
            if ($role === 'atasan') {
                return response()->json($activity);
            }

            return response()->json(['message' => 'Forbidden: you do not have access to this activity'], 403);
        }

        // Default: deny if visibility has unexpected value
        return response()->json(['message' => 'Forbidden'], 403);
    }

    public function update(Request $request, $id)
    {
        $activity = Activity::find($id);
        
        if (!$activity) {
            return response()->json(['message' => 'Activity not found'], 404);
        }

        // Authorization: only creator can update
        $username = $request->query('username');
        if (!$username || $username !== $activity->pembuat) {
            return response()->json(['message' => 'Forbidden: only the creator can update this activity'], 403);
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
                'media.*' => 'mimes:jpeg,png,jpg,gif,mp4,avi,mov|max:20480',
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
            foreach ((array) $request->file('media') as $file) {
                if ($file && $file->isValid()) {
                    $path = $file->store('activities', 'public');
                    $mediaPaths[] = $path;
                } else {
                    \Log::warning('Skipping invalid media upload');
                }
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
            // Keep original creator; ignore any changes to pembuat
            'pembuat' => $activity->pembuat,
            'media' => $mediaPaths,
            'repeat' => $validated['repeat'],
            'repeat_frequency' => $validated['repeat'] === 'yes' ? $validated['repeat_frequency'] : null,
            'repeat_end_date' => $validated['repeat'] === 'yes' ? ($validated['repeat_end_date'] ?? null) : null,
        ]);

        return response()->json($activity);
    }

    public function destroy(Request $request, $id)
    {
        $activity = Activity::find($id);
        
        if (!$activity) {
            return response()->json(['message' => 'Activity not found'], 404);
        }

        // Authorization: only creator can delete
        $username = $request->query('username');
        if (!$username || $username !== $activity->pembuat) {
            return response()->json(['message' => 'Forbidden: only the creator can delete this activity'], 403);
        }

        $activity->delete();
        
        return response()->json(['message' => 'Activity deleted successfully']);
    }
}
