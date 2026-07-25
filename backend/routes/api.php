<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoleApplicationController;
use App\Http\Middleware\AuthenticateJwt;
use App\Http\Middleware\EnsureGuestJwt;
use App\Http\Middleware\EnsureRole;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:auth-register')->group(function (): void {
    Route::post('/register', [AuthController::class, 'register'])->middleware(EnsureGuestJwt::class);
});

Route::middleware('throttle:auth-login')->group(function (): void {
    Route::post('/login', [AuthController::class, 'login'])->middleware(EnsureGuestJwt::class);
});

Route::middleware([AuthenticateJwt::class])->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::patch('/me', [AuthController::class, 'updateProfile']);

    Route::prefix('applications')->group(function (): void {
        Route::post('/volunteer', [RoleApplicationController::class, 'storeVolunteer'])->middleware('role:citizen');
        Route::post('/ngo', [RoleApplicationController::class, 'storeNgo'])->middleware('role:citizen');
    });

    Route::prefix('admin')->middleware('role:admin')->group(function (): void {
        Route::get('/role-applications', [RoleApplicationController::class, 'index']);
        Route::patch('/role-applications/{roleApplication}', [RoleApplicationController::class, 'review']);
    });
});
