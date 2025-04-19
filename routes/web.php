<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;

// Predefined list of games
$games = [
    'Woerdgoem',
    'Cookaloor',
    'Tetrys',
    '31seconds'
];

Route::middleware('auth')->group(function () use ($games) {

    Route::get('/', function () use ($games) {
        return Inertia::render('index', [
            'game' => 'index',
            'user' => Auth::user(),
        ]);
    })->name('index');

    foreach ($games as $game) {
        Route::get('/' . $game, function () use ($game) {
            return Inertia::render($game, [
                'game' => $game,
                'user' => Auth::user(),
            ]);
        })->name($game);
    }
});

Route::post('/logout', function (Request $request) {
    Auth::logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    return redirect()->route('login');
})->name('logout');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
