<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\Http\Request;
use App\Http\Resources\GameResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Requests\GameRequest;

class GameController extends Controller
{
    public function index(): JsonResource
    {
        return GameResource::collection(Game::all());
    }

    public function store(GameRequest $request): JsonResource // Inyectar GameRequest aquí
    {
        $game = Game::create($request->validated()); // Ahora $request->validated() funcionará
        return new GameResource($game);
    }   

    public function show(Game $game): JsonResource
    {
        return new GameResource($game);
    }

    public function update(GameRequest $request, Game $game): JsonResource // Inyectar GameRequest aquí
    {
        $game->update($request->validated());
        return new GameResource($game);
    }

    public function destroy(Game $game): JsonResponse
    {
        $game->delete();
        return response()->json(['message' => 'Juego eliminado'], 200);
    }
}
