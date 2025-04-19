<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // Method to update the game_id and game_type for a specific user
    public function handleJoinGame(Request $request)
    {

    $userId = (int) $request->input('user_id');
    $gameId = (int) $request->input('game_id');
    $user = User::findOrFail($userId);

    $user->game_id = $gameId;
    $user->game_type = $request->input('game_type');
    $user->save();

    error_log("TEST: ".$userId);

    return response()->json($user);
    }
}