<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;


    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $adminRoutes = [
                'users.index', 'users.create', 'users.edit', 'users.store', 'users.update', 'users.destroy',
                'work-hours.report'
            ];
            if (in_array($request->route()->getName(), $adminRoutes)) {
                if (auth()->user()?->role !== 'admin') {
                    abort(403);
                }
            }
            return $next($request);
        });
    }
}
