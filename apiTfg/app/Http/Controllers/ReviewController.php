<?php

namespace App\Http\Controllers;

use App\Models\Game; // Asegúrate de importar Game
use App\Models\Review;
use App\Http\Requests\ReviewRequest;
use App\Http\Resources\ReviewResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewController extends Controller
{
    public function index(): JsonResource
    {
        return ReviewResource::collection(Review::with(['user', 'game'])->latest()->get()); // Añadido with y latest
    }

    // NUEVO MÉTODO: Obtener reviews para un juego específico
    public function gameReviews(Game $game): JsonResource
    {
        // Cargar reviews con sus relaciones de usuario y juego (aunque el juego ya lo tenemos)
        $reviews = Review::where('game_id', $game->id)
                        ->with('user') // Cargar la relación del usuario
                        ->latest()     // Ordenar por más recientes
                        ->paginate(5);  // Opcional: paginar si son muchas reviews
        return ReviewResource::collection($reviews);
    }

    public function store(ReviewRequest $request): JsonResource
    {
        // Asegurarse de que el usuario autenticado se asocia a la review
        $reviewData = $request->validated();
        $reviewData['user_id'] = auth()->id(); // Asignar el ID del usuario autenticado

        $review = Review::create($reviewData);
        return new ReviewResource($review->load(['user', 'game'])); // Cargar relaciones
    }

    public function show(Review $review): JsonResource
    {
        return new ReviewResource($review->load(['user', 'game']));
    }

    public function update(ReviewRequest $request, Review $review): JsonResource
    {
        // Opcional: verificar que el usuario que actualiza es el dueño de la review o un admin
         if ($review->user_id !== auth()->id() && !auth()->user()->isAdmin()) {
             return response()->json(['message' => 'No autorizado'], 403);
         }
        $review->update($request->validated());
        return new ReviewResource($review->load(['user', 'game']));
    }

    public function destroy(Review $review): JsonResponse
    {
        // Opcional: verificar que el usuario que elimina es el dueño de la review o un admin
         if ($review->user_id !== auth()->id() && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        $review->delete();
        return response()->json(['message' => 'Review eliminada'], 200);
    }
}