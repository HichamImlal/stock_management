<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    public function handle($request, Closure $next, ...$guards)
    {
        if (Auth::guard($guard)->check()) {
            return $next($request);
        }

        return response()->json(['error' => 'Unauthenticated'], 401);
    }
}
