<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ─── Public routes (rate limited) ────────────────────────────────────────
Route::prefix('auth')->middleware(['throttle:10,1'])->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login']);
});

// ─── Authenticated routes ─────────────────────────────────────────────────
Route::middleware(['auth:sanctum'])->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me',     [AuthController::class, 'me']);
    });

    // Projects
    Route::apiResource('projects', ProjectController::class);
    Route::post('projects/{project}/invite', [ProjectController::class, 'invite']);
    Route::delete('projects/{project}/members/{user}', [ProjectController::class, 'removeMember']);
    Route::get('projects/{project}/stats',   [ProjectController::class, 'stats']);
    Route::get('projects/{project}/report/pdf', [ReportController::class, 'projectPdf']);

    // Tasks
    Route::get('projects/{project}/tasks',        [TaskController::class, 'index']);
    Route::get('projects/{project}/tasks/kanban', [TaskController::class, 'kanban']);
    Route::post('projects/{project}/tasks',       [TaskController::class, 'store']);
    Route::get('tasks/{task}',                    [TaskController::class, 'show']);
    Route::put('tasks/{task}',                    [TaskController::class, 'update']);
    Route::patch('tasks/{task}/status',           [TaskController::class, 'updateStatus']);
    Route::delete('tasks/{task}',                 [TaskController::class, 'destroy']);

    // Comments
    Route::get('tasks/{task}/comments',     [CommentController::class, 'index']);
    Route::post('tasks/{task}/comments',    [CommentController::class, 'store']);
    Route::delete('comments/{comment}',     [CommentController::class, 'destroy']);
});
