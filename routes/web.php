<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'DisasterAid BD API',
        'status' => 'online',
        'version' => '1.0.0',
    ]);
});

