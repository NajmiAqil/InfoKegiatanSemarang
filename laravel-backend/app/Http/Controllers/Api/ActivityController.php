<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ActivityController extends Controller
{
    /**
     * Expand repeating activities into multiple occurrences
     */
    private function expandOccurrences($activity, $horizonDays = 180)
    {
        if ($activity->repeat !== 'yes' || !$activity->repeat_frequency) {
            return [$activity];
        }

        $occurrences = [];
        $startDate = Carbon::parse($activity->tanggal);
        $endDate = $activity->repeat_end_date 
            ? Carbon::parse($activity->repeat_end_date) 
            : Carbon::now()->addDays($horizonDays);
        
        // Batasi horizon maksimal
        $maxDate = Carbon::now()->addDays($horizonDays);
        if ($endDate->gt($maxDate)) {
            $endDate = $maxDate;
        }

        $currentDate = $startDate->copy();
        
        while ($currentDate->lte($endDate)) {
            // Clone activity dengan tanggal yang berbeda
            $occurrence = clone $activity;
            $occurrence->tanggal = $currentDate->format('Y-m-d');
            
            // Hitung tanggal_berakhir untuk occurrence ini
            if ($activity->tanggal_berakhir && $activity->tanggal_berakhir !== $activity->tanggal) {
                $daysDiff = Carbon::parse($activity->tanggal_berakhir)->diffInDays(Carbon::parse($activity->tanggal));
                $occurrence->tanggal_berakhir = $currentDate->copy()->addDays($daysDiff)->format('Y-m-d');
            } else {
                $occurrence->tanggal_berakhir = $occurrence->tanggal;
            }
            
            // Tandai occurrence yang bukan asli (untuk UI: disable edit/delete pada occurrence)
            $occurrence->is_occurrence = !$currentDate->isSameDay($startDate);
            $occurrence->original_date = $activity->tanggal;
            
            $occurrences[] = $occurrence;
            
            // Increment berdasarkan frekuensi
            switch ($activity->repeat_frequency) {
                case 'daily':
                    $currentDate->addDay();
                    break;
                case 'weekly':
                    $currentDate->addWeek();
                    break;
                case 'monthly':
                    $currentDate->addMonth();
                    break;
                case 'yearly':
                    $currentDate->addYear();
                    break;
                default:
                    // Jika frekuensi tidak dikenal, hentikan
                    return [$activity];
            }
        }
        
        return $occurrences;
    }

    public function index(Request $request)
    {
        $username = $request->query('username');
        $pembuat = $request->query('pembuat'); // Filter untuk melihat kegiatan bawahan tertentu
        $role = $request->query('role');
        $opdFilter = $request->query('opd');
        
        // Get today's date
        $today = date('Y-m-d');
        
        
        // Get all activities with optimized column selection
        $query = Activity::select('id', 'no', 'kegiatan', 'judul', 'tanggal', 'tanggal_berakhir', 
                       'jam', 'jam_mulai', 'jam_berakhir', 'tempat', 'lokasi', 
                       'jenis', 'jenis_kegiatan', 'visibility', 'pembuat', 'opd', 
                       'orang_terkait', 'deskripsi', 'media', 'repeat', 'repeat_frequency', 
                       'repeat_end_date', 'is_approved', 'approved_by', 'approved_at')
                ->orderBy('tanggal')
                ->orderBy('jam_mulai');
        
        // Jika ada parameter pembuat, show semua activities dari pembuat tersebut (termasuk private)
        if ($pembuat) {
            $query->where('pembuat', $pembuat);
        } 
        // Filter activities based on visibility + OPD scoping
        elseif ($username) {
            // Resolve user's OPD if needed
            $userOpd = null;
            if ($username) {
                $user = \App\Models\User::where('username', $username)->first();
                $userOpd = $user?->opd;
            }

            // Untuk dashboard (atasan/bawahan): show approved OR own activities
            $query->where(function($qApproval) use ($username) {
                $qApproval->where('is_approved', true) // Show approved activities
                          ->orWhere('pembuat', $username); // Show own activities regardless of approval
            });

            // Untuk dashboard (atasan/bawahan): show public (semua OPD), kantor (same OPD), private milik sendiri, dan private yang melibatkan user
            $query->where(function($q) use ($username, $userOpd) {
                $q->where('visibility', 'public') // public TIDAK dibatasi OPD
                  ->orWhere(function($q2) use ($userOpd, $username) {
                      // Kantor: hanya tampilkan jika user dan kegiatan di OPD yang sama
                      $q2->where('visibility', 'kantor')
                         ->where(function($q3) use ($userOpd, $username) {
                             // Tampilkan jika OPD sama ATAU user ada di orang_terkait (lintas OPD)
                             $q3->when($userOpd, function($q4) use ($userOpd) {
                                     $q4->whereRaw('LOWER(opd) = ?', [strtolower($userOpd)]);
                                 })
                                ->orWhereRaw('LOWER(orang_terkait) LIKE ?', ['%' . strtolower($username) . '%']);
                         });
                  })
                  ->orWhere(function($q2) use ($username) {
                      $q2->where('visibility', 'private')
                         ->where(function($q3) use ($username) {
                             // Private milik sendiri atau user ada di orang_terkait (SQLite compatible)
                             // Check both exact username match and case-insensitive JSON array match
                             $q3->where('pembuat', $username)
                                ->orWhereRaw('LOWER(orang_terkait) LIKE ?', ['%' . strtolower($username) . '%']);
                         });
                  });
            });

            // OPD filter opsional untuk atasan (tidak memfilter public, hanya kantor & private)
            if ($opdFilter) {
                $query->where(function($q) use ($opdFilter, $username) {
                    $q->where('visibility', 'public') // public tetap tampil semua
                      ->orWhereRaw('LOWER(opd) = ?', [strtolower($opdFilter)]) // kantor & private sesuai OPD
                      // Jangan sembunyikan kegiatan lintas OPD jika user terlibat (orang_terkait)
                      ->orWhere(function($q2) use ($username) {
                          if ($username) {
                              $q2->whereRaw('LOWER(orang_terkait) LIKE ?', ['%' . strtolower($username) . '%']);
                          }
                      });
                });
            }
        } else {
            // Untuk homepage (InfoDisplay): hanya tampilkan public yang sudah approved
            $query->where('visibility', 'public')
                  ->where('is_approved', true);
        }
        
        // Filter tambahan berdasarkan parameter opdFilter untuk homepage/InfoDisplay
        if (!$username && $opdFilter && $opdFilter !== 'Semua Divisi') {
            $query->whereRaw('LOWER(opd) = ?', [strtolower($opdFilter)]);
        }
        
        $allActivities = $query->get();
        
        // Expand repeating activities into multiple occurrences
        $expandedActivities = collect();
        foreach ($allActivities as $activity) {
            $occurrences = $this->expandOccurrences($activity);
            foreach ($occurrences as $occurrence) {
                $expandedActivities->push($occurrence);
            }
        }
        
        // Sort by date and time after expansion
        $expandedActivities = $expandedActivities->sortBy(function($activity) {
            return $activity->tanggal . ' ' . $activity->jam_mulai;
        })->values();
        
        // Separate by date (support multi-day: show in 'today' if today between tanggal and tanggal_berakhir)
        $todayActivities = $expandedActivities->filter(function($activity) use ($today) {
            $start = $activity->tanggal;
            $end = $activity->tanggal_berakhir ?: $activity->tanggal;
            return $start <= $today && $today <= $end;
        })->values();

        $tomorrowActivities = $expandedActivities->filter(function($activity) use ($today) {
            // Tomorrow & future (strictly after today end range)
            return $activity->tanggal > $today;
        })->values();
        
        return response()->json([
            'today' => $todayActivities,
            'tomorrow' => $tomorrowActivities
        ])->header('Cache-Control', 'public, max-age=30'); // Cache 30 seconds
    }

    public function store(Request $request)
    {
        // Log incoming request for debugging
        \Log::info('ActivityController@store called', [
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
                'external_contacts' => 'nullable|string',
                'pembuat' => 'required|string',
                'opd' => 'nullable|string',
                'media' => 'nullable|array',
                // Tambah dukungan webp & heic; naikkan batas ke 50MB untuk fleksibilitas
                'media.*' => 'mimes:jpeg,png,jpg,gif,webp,heic,mp4,avi,mov|max:51200', // max 50MB
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
            foreach ((array) $request->file('media') as $index => $file) {
                if ($file && $file->isValid()) {
                    try {
                        \Log::info('Uploading media file', [
                            'index' => $index,
                            'original_name' => $file->getClientOriginalName(),
                            'mime' => $file->getMimeType(),
                            'size' => $file->getSize()
                        ]);
                        $path = $file->store('activities', 'public');
                        $mediaPaths[] = $path;
                    } catch (\Throwable $t) {
                        \Log::error('Failed to store media file, skipping', [
                            'index' => $index,
                            'error' => $t->getMessage()
                        ]);
                        // Jangan gagalkan seluruh request; lanjutkan tanpa file ini
                        continue;
                    }
                } else {
                    \Log::warning('Skipping invalid media upload', [
                        'index' => $index,
                        'original_name' => $file ? $file->getClientOriginalName() : null
                    ]);
                    // Jangan gagalkan seluruh request; lanjutkan tanpa file ini
                    continue;
                }
            }
        }

        // Auto-generate 'no' based on existing count
        $maxNo = Activity::max('no') ?? 0;
        
        // Role-based OPD enforcement
        $username = $request->query('username');
        $role = $request->query('role');
        $userOpd = null;
        if ($username) {
            $user = \App\Models\User::where('username', $username)->first();
            $userOpd = $user?->opd;
        }
        $opdValue = $validated['opd'] ?? $userOpd;
        if (($role === 'bawahan') && $userOpd && $opdValue && strtolower($opdValue) !== strtolower($userOpd)) {
            return response()->json(['message' => 'Forbidden: OPD tidak sesuai dengan akun anda'], 403);
        }

        // Auto-approve logic:
        // - Atasan can auto-approve their own activities
        // - Non-public activities (kantor/private) are auto-approved
        // - Public activities from bawahan need approval
        $isApproved = false;
        $approvedBy = null;
        $approvedAt = null;
        
        if ($role === 'atasan') {
            // Atasan auto-approves their own activities
            $isApproved = true;
            $approvedBy = $username;
            $approvedAt = now();
        } elseif ($validated['visibility'] !== 'public') {
            // Non-public activities are auto-approved
            $isApproved = true;
            $approvedBy = $username;
            $approvedAt = now();
        }
        // else: public from bawahan requires approval (is_approved = false)

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
            'external_contacts' => $validated['external_contacts'] ?? null,
            'pembuat' => $validated['pembuat'],
            'opd' => $opdValue,
            'media' => $mediaPaths,
            'repeat' => $validated['repeat'],
            'repeat_frequency' => $validated['repeat'] === 'yes' ? $validated['repeat_frequency'] : null,
            'repeat_end_date' => $validated['repeat'] === 'yes' ? ($validated['repeat_end_date'] ?? null) : null,
            'is_approved' => $isApproved,
            'approved_by' => $approvedBy,
            'approved_at' => $approvedAt,
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

        // Atasan can view any activity for approval purposes
        if ($role === 'atasan') {
            return response()->json($activity);
        }

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

            // Jika user ada di orang_terkait, boleh lihat meskipun beda OPD
            $usernameLower = strtolower($username);
            $related = [];
            if (!empty($activity->orang_terkait)) {
                $decoded = json_decode($activity->orang_terkait, true);
                if (is_array($decoded)) {
                    $related = $decoded;
                } else {
                    $related = array_filter(array_map('trim', explode(',', (string) $activity->orang_terkait)));
                }
            }
            $relatedLower = array_map(fn($u) => strtolower($u), $related);
            if (in_array($usernameLower, $relatedLower, true)) {
                return response()->json($activity);
            }

            // Jika bukan orang terkait, wajib OPD yang sama
            $user = \App\Models\User::where('username', $username)->first();
            $userOpd = $user?->opd;
            $activityOpd = $activity->opd;

            if (!$userOpd || !$activityOpd || strtolower($userOpd) !== strtolower($activityOpd)) {
                return response()->json(['message' => 'Forbidden: kegiatan kantor hanya bisa dilihat oleh user di OPD yang sama'], 403);
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

        // Authorization: creator can always update, atasan can update any activity
        $username = $request->query('username');
        $role = $request->query('role');
        
        if (!$username) {
            return response()->json(['message' => 'Username is required'], 401);
        }
        
        // Check if user is creator
        $isCreator = $username === $activity->pembuat;
        
        // Atasan can edit any activity (for approval/review purposes)
        $isAtasan = ($role === 'atasan');
        
        // Allow update if user is creator OR atasan
        if (!$isCreator && !$isAtasan) {
            return response()->json([
                'message' => 'Forbidden: only the creator or atasan can update this activity',
                'debug' => [
                    'is_creator' => $isCreator,
                    'is_atasan' => $isAtasan,
                    'visibility' => $activity->visibility,
                    'allowed' => false
                ]
            ], 403);
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
                'external_contacts' => 'nullable|string',
                'pembuat' => 'required|string',
                'opd' => 'nullable|string',
                'media' => 'nullable|array',
                'media.*' => 'mimes:jpeg,png,jpg,gif,webp,heic,mp4,avi,mov|max:51200',
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

        // Role-based OPD enforcement on update
        $role = $request->query('role');
        $opdValue = $validated['opd'] ?? $activity->opd;
        if (($role === 'bawahan') && $opdValue && $activity->opd && strtolower($opdValue) !== strtolower($activity->opd)) {
            return response()->json(['message' => 'Forbidden: tidak boleh mengubah OPD kegiatan'], 403);
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
            'external_contacts' => $validated['external_contacts'] ?? null,
            // Keep original creator; ignore any changes to pembuat
            'pembuat' => $activity->pembuat,
            'opd' => $opdValue,
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

        // Authorization: creator can delete, atasan can delete non-private activities
        $username = $request->query('username');
        $role = $request->query('role');
        
        // Debug logging
        \Log::info('Delete attempt', [
            'username' => $username,
            'role' => $role,
            'pembuat' => $activity->pembuat,
            'visibility' => $activity->visibility,
            'activity_id' => $id
        ]);
        
        if (!$username) {
            return response()->json([
                'message' => 'Username is required',
                'debug' => ['username' => $username, 'pembuat' => $activity->pembuat]
            ], 401);
        }
        
        // Check if user is creator
        $isCreator = $username === $activity->pembuat;
        
        // Check if user is atasan and activity is not private
        $isAtasanAllowed = ($role === 'atasan') && ($activity->visibility !== 'private');
        
        // Allow delete if user is creator OR (atasan AND not private)
        if (!$isCreator && !$isAtasanAllowed) {
            return response()->json([
                'message' => 'Forbidden: only the creator or atasan (for non-private activities) can delete this activity',
                'debug' => [
                    'your_username' => $username,
                    'activity_creator' => $activity->pembuat,
                    'is_creator' => $isCreator,
                    'is_atasan' => $role === 'atasan',
                    'visibility' => $activity->visibility,
                    'allowed' => false
                ]
            ], 403);
        }

        $activity->delete();
        
        return response()->json(['message' => 'Activity deleted successfully']);
    }

    public function getPendingApproval(Request $request)
    {
        // Only atasan can view pending approvals
        $role = $request->query('role');
        if ($role !== 'atasan') {
            return response()->json(['message' => 'Forbidden: only atasan can view pending approvals'], 403);
        }

        // Get all public activities that are not yet approved
        $pendingActivities = Activity::where('visibility', 'public')
            ->where('is_approved', false)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($pendingActivities);
    }

    public function approveActivity(Request $request, $id)
    {
        // Only atasan can approve
        $role = $request->query('role');
        $username = $request->query('username');
        
        if ($role !== 'atasan') {
            return response()->json(['message' => 'Forbidden: only atasan can approve activities'], 403);
        }

        $activity = Activity::find($id);
        
        if (!$activity) {
            return response()->json(['message' => 'Activity not found'], 404);
        }

        // Update approval status
        $activity->update([
            'is_approved' => true,
            'approved_by' => $username,
            'approved_at' => now(),
        ]);

        return response()->json([
            'message' => 'Activity approved successfully',
            'activity' => $activity
        ]);
    }
}
