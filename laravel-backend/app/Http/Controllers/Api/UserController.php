<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Register new user (status: pending)
     */
    public function register(Request $request)
    {
        \Log::info('User registration attempt', ['username' => $request->username]);
        
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'nomor_hp' => 'nullable|string|max:20',
            'opd' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'nomor_hp' => $request->nomor_hp,
            'opd' => $request->opd ?? 'Diskominfo',
            'role' => 'bawahan',
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Registration successful. Waiting for approval.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'nomor_hp' => $user->nomor_hp,
                'status' => $user->status,
            ]
        ], 201);
    }

    /**
     * Get all pending users
     */
    public function getPendingUsers()
    {
        $pendingUsers = User::where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'name', 'username', 'email', 'created_at']);

        return response()->json($pendingUsers);
    }

    /**
     * Get all approved bawahan users
     */
    public function getApprovedBawahan()
    {
        $approvedUsers = User::where('status', 'approved')
            ->where('role', 'bawahan')
            ->orderBy('name', 'asc')
            ->get(['id', 'name', 'username', 'opd']);

        return response()->json($approvedUsers);
    }

    /**
     * Get all approved users (for orang_terkait selection)
     */
    public function getAllApprovedUsers()
    {
        $approvedUsers = User::where('status', 'approved')
            ->orderBy('name', 'asc')
            ->get(['id', 'name', 'username']);

        return response()->json($approvedUsers);
    }

    /**
     * Approve user and send email
     */
    public function approveUser(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($user->status !== 'pending') {
            return response()->json(['message' => 'User is not pending approval'], 400);
        }

        $user->status = 'approved';
        $user->save();
        
        \Log::info('User approved', ['user_id' => $user->id, 'username' => $user->username]);

        // Send approval email
        try {
            Mail::send('emails.user-approved', ['user' => $user], function ($message) use ($user) {
                $message->to($user->email)
                    ->subject('Akun Anda Telah Disetujui - Sistem Informasi Kegiatan');
            });
        } catch (\Exception $e) {
            // Log error but don't fail the approval
            \Log::error('Failed to send approval email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'User approved successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'status' => $user->status,
            ]
        ]);
    }

    /**
     * Reject user
     */
    public function rejectUser(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($user->status !== 'pending') {
            return response()->json(['message' => 'User is not pending approval'], 400);
        }

        $user->status = 'rejected';
        $user->save();
        
        \Log::info('User rejected', ['user_id' => $user->id, 'username' => $user->username]);

        // Optionally send rejection email
        try {
            Mail::send('emails.user-rejected', ['user' => $user], function ($message) use ($user) {
                $message->to($user->email)
                    ->subject('Permintaan Akun Ditolak - Sistem Informasi Kegiatan');
            });
        } catch (\Exception $e) {
            \Log::error('Failed to send rejection email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'User rejected successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'status' => $user->status,
            ]
        ]);
    }
}
