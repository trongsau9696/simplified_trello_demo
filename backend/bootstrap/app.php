<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        channels: __DIR__ . '/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // We use Bearer tokens instead of SPA Cookie authentication
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Uniform JSON error responses for API
        $exceptions->render(function (AuthenticationException $e, Request $request): ?JsonResponse {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            return null;
        });

        $exceptions->render(function (ValidationException $e, Request $request): ?JsonResponse {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Validation failed.',
                    'errors' => $e->errors(),
                ], 422);
            }

            return null;
        });

        $exceptions->render(function (HttpException $e, Request $request): ?JsonResponse {
            if ($request->is('api/*')) {
                return response()->json(['message' => $e->getMessage() ?: 'HTTP Error'], $e->getStatusCode());
            }

            return null;
        });
    })->create();
