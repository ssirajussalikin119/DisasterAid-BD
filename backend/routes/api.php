<?php

declare(strict_types=1);
use App\Http\Controllers\Api\ReliefCenterController;
use App\Http\Controllers\Api\ReliefDistributionController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AssignmentController;
use App\Http\Controllers\Api\IncidentController;
use App\Http\Controllers\Api\OtpAuthController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\RoleApplicationController;
use App\Http\Controllers\Api\VolunteerController;
use App\Http\Middleware\AuthenticateJwt;
use App\Http\Middleware\EnsureRole;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('/send-otp', [OtpAuthController::class, 'sendOtp'])->middleware('throttle:otp-send');
    Route::post('/verify-otp', [OtpAuthController::class, 'verifyOtp'])->middleware('throttle:otp-verify');
});
Route::get('/reports', [ReportController::class, 'index']);
Route::get('/reports/{id}', [ReportController::class, 'show']);
Route::get('/incidents', [IncidentController::class, 'index']);
Route::get('/incidents/{id}', [IncidentController::class, 'show']);
Route::middleware([AuthenticateJwt::class])->group(function (): void {
    Route::post('/reports', [ReportController::class, 'store']);
    Route::put('/reports/{id}', [ReportController::class, 'update']);
    Route::patch('/reports/{id}', [ReportController::class, 'update']);
    Route::delete('/reports/{id}', [ReportController::class, 'destroy']);
});

Route::middleware([AuthenticateJwt::class, 'role:admin,volunteer'])->group(function (): void {
    Route::apiResource('incidents', IncidentController::class)->except(['index', 'show']);
    Route::apiResource('volunteers', VolunteerController::class);
    Route::apiResource('assignments', AssignmentController::class);
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
Route::apiResource('relief-centers', ReliefCenterController::class);
Route::apiResource('relief-distributions', ReliefDistributionController::class);
