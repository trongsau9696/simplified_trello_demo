<?php

namespace App\Providers;

use App\Models\Comment;
use App\Models\Project;
use App\Models\Task;
use App\Policies\CommentPolicy;
use App\Policies\ProjectPolicy;
use App\Policies\TaskPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Bind Repositories as singletons
        $this->app->singleton(\App\Repositories\ProjectRepository::class);
        $this->app->singleton(\App\Repositories\TaskRepository::class);
    }

    public function boot(): void
    {
        // ─── Policies ────────────────────────────────────────────
        Gate::policy(Project::class, ProjectPolicy::class);
        Gate::policy(Task::class,    TaskPolicy::class);
        Gate::policy(Comment::class, CommentPolicy::class);

        // ─── Rate Limiters ────────────────────────────────────────
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });
    }
}
