<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Atasan (Supervisor)
        User::create([
            'name' => 'hanry',
            'username' => 'hanry',
            'email' => 'hanry@diskominfo.semarang.go.id',
            'password' => Hash::make('hanry123'),
            'role' => 'atasan',
            'status' => 'approved',
        ]);

        // Create Bawahan (Subordinates)
        User::create([
            'name' => 'mahes',
            'username' => 'mahes',
            'email' => 'mahes@diskominfo.semarang.go.id',
            'password' => Hash::make('mahes123'),
            'role' => 'bawahan',
            'status' => 'approved',
        ]);

        User::create([
            'name' => 'yani',
            'username' => 'yani',
            'email' => 'yani@diskominfo.semarang.go.id',
            'password' => Hash::make('yani123'),
            'role' => 'bawahan',
            'status' => 'approved',
        ]);

        // Example pending user (waiting for approval)
        User::create([
            'name' => 'Aqil Najmi',
            'username' => 'Aqil',
            'email' => 'aqil@example.com',
            'password' => Hash::make('najmiaqil2020'),
            'role' => 'bawahan',
            'status' => 'pending',
        ]);
    }
}
