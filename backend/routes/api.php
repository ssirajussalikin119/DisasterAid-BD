<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OtpAuthController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\RoleApplicationController;
use App\Http\Middleware\AuthenticateJwt;
use App\Http\Middleware\EnsureRole;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('/send-otp', [OtpAuthController::class, 'sendOtp'])->middleware('throttle:otp-send');
    Route::post('/verify-otp', [OtpAuthController::class, 'verifyOtp'])->middleware('throttle:otp-verify');
});
Route::get('/reports', [ReportController::class, 'index']);
Route::get('/reports/{id}', [ReportController::class, 'show']);
Route::middleware([AuthenticateJwt::class])->group(function (): void {
    Route::post('/reports', [ReportController::class, 'store']);
    Route::put('/reports/{id}', [ReportController::class, 'update']);
    Route::patch('/reports/{id}', [ReportController::class, 'update']);
    Route::delete('/reports/{id}', [ReportController::class, 'destroy']);
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

