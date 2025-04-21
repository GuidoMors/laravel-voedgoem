<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\User;
use App\Http\Controllers\UserController;

Route::get('/users', function () {
    return User::select('id', 'name')->get();
});

Route::put('/users/game', [UserController::class, 'handleJoinGame']);

Route::post('/update-socket-id', [UserController::class, 'updateSocketId']);