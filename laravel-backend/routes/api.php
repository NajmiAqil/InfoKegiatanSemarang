<?php

use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('api')->group(function () {
    Route::get('/activities', [ActivityController::class, 'index']);
    Route::get('/activities/{id}', [ActivityController::class, 'show']);
    Route::post('/activities', [ActivityController::class, 'store']);
    Route::put('/activities/{id}', [ActivityController::class, 'update']);
    Route::post('/activities/{id}', [ActivityController::class, 'update']); // For FormData with _method=PUT
    Route::delete('/activities/{id}', [ActivityController::class, 'destroy']);
    Route::post('/login', [AuthController::class, 'login']);
    
    // User management routes
    Route::post('/users/register', [UserController::class, 'register']);
    Route::get('/users/pending', [UserController::class, 'getPendingUsers']);
    Route::get('/users/approved-bawahan', [UserController::class, 'getApprovedBawahan']);
    Route::post('/users/{id}/approve', [UserController::class, 'approveUser']);
    Route::post('/users/{id}/reject', [UserController::class, 'rejectUser']);
});