<?php

declare(strict_types=1);
use App\Http\Controllers\Api\ReliefCenterController;
use App\Http\Controllers\Api\ReliefDistributionController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AssignmentController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\IncidentController;
use App\Http\Controllers\Api\OtpAuthController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ReportIncidentRelationshipController;
use App\Http\Controllers\Api\AdminReportController;
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
        Route::get('/applications', [RoleApplicationController::class, 'adminApplications']);
        Route::get('/applications/sql/inner-join', [RoleApplicationController::class, 'innerJoin']);
        Route::get('/applications/sql/left-join', [RoleApplicationController::class, 'leftJoin']);
        Route::get('/applications/sql/union', [RoleApplicationController::class, 'unionQueue']);
        Route::get('/applications/sql/intersect', [RoleApplicationController::class, 'intersectApproved']);
        Route::get('/applications/sql/statistics', [RoleApplicationController::class, 'statistics']);
        Route::get('/applications/sql/recent', [RoleApplicationController::class, 'recentFiltered']);
        Route::get('/applications/{id}', [RoleApplicationController::class, 'detail']);
        Route::post('/applications/{id}/approve', [RoleApplicationController::class, 'approve']);
        Route::post('/applications/{id}/reject', [RoleApplicationController::class, 'reject']);
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::get('/users/{id}', [AdminUserController::class, 'show']);
        Route::put('/users/{id}', [AdminUserController::class, 'update']);
        Route::patch('/users/{id}/activate', [AdminUserController::class, 'activate']);
        Route::patch('/users/{id}/suspend', [AdminUserController::class, 'suspend']);
        Route::get('/role-applications', [RoleApplicationController::class, 'index']);
        Route::patch('/role-applications/{roleApplication}', [RoleApplicationController::class, 'review']);

        Route::get('/reports', [AdminReportController::class, 'index']);
        Route::get('/reports/sql/inner-join', [AdminReportController::class, 'innerJoin']);
        Route::get('/reports/sql/left-join', [AdminReportController::class, 'leftJoin']);
        Route::get('/reports/sql/statistics', [AdminReportController::class, 'statistics']);
        Route::get('/reports/sql/recent', [AdminReportController::class, 'recentFiltered']);
        Route::get('/reports/{id}', [AdminReportController::class, 'detail']);
        Route::post('/reports/{id}/verify', [AdminReportController::class, 'verify']);
        Route::post('/reports/{id}/reject', [AdminReportController::class, 'reject']);
        Route::post('/reports/{id}/close', [AdminReportController::class, 'close']);
    });
});
Route::apiResource('relief-centers', ReliefCenterController::class);
Route::apiResource('relief-distributions', ReliefDistributionController::class);
