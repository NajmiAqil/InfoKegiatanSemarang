<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $username = $request->input('username');
        $password = $request->input('password');

        // Look up user by username field first, then fallback to name
        $user = User::where('username', $username)
            ->orWhere('name', $username)
            ->first();

        if (!$user || !Hash::check($password, $user->password)) {
            return response()->json(['message' => 'Username atau password salah'], 401);
        }

        // Check user status
        if ($user->status === 'pending') {
            return response()->json(['message' => 'Akun Anda masih menunggu persetujuan dari Atasan'], 403);
        }

        if ($user->status === 'rejected') {
            return response()->json(['message' => 'Akun Anda telah ditolak. Silakan hubungi administrator'], 403);
        }

        // Determine role
        $role = $user->role ?? 'bawahan';
        if (strtolower($user->name) === 'hanry' || strtolower($user->username ?? '') === 'hanry') {
            $role = 'atasan';
        }

        return response()->json([
            'status' => 'ok',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username ?? $user->name,
                'email' => $user->email,
                'role' => $role,
            ],
        ]);
    }
}
