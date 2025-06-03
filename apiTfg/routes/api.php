<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GameController;
use App\Http\Controllers\ReviewController;
// use App\Http\Controllers\CartController; // Comentado si no lo estás usando aún
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// --- Rutas Públicas ---

// Autenticación
Route::post("/register", [AuthController::class, "register"]);
Route::post("/login", [AuthController::class, "login"]);

// Juegos
Route::get("/games", [GameController::class, "index"]);
Route::get("/games/{game}", [GameController::class, "show"]); // Cambiado {id} a {game} para consistencia con Route Model Binding

// Reviews
Route::get("/reviews", [ReviewController::class, "index"]); // Obtener todas las reviews
Route::get("/reviews/{review}", [ReviewController::class, "show"]); // Obtener una review específica por su ID. Cambiado {id} a {review}

// NUEVA RUTA: Obtener reviews para un juego específico
Route::get("/games/{game}/reviews", [ReviewController::class, "gameReviews"]);


// --- Rutas Protegidas (Requieren Autenticación con Sanctum) ---
Route::middleware("auth:sanctum")->group(function () {
    // Autenticación
    Route::post("/logout", [AuthController::class, "logout"]);
    Route::get("/user", function (Request $request) {
        return response()->json($request->user());
    });

    // Reviews (Crear, Eliminar - Actualizar podría ir aquí también)
    Route::post("/reviews", [ReviewController::class, "store"]);
    Route::put("/reviews/{review}", [ReviewController::class, "update"]); // Añadida ruta para actualizar review
    Route::delete("/reviews/{review}", [ReviewController::class, "destroy"]); // Cambiado {id} a {review}

    // Juegos (Crear, Actualizar, Eliminar - si son acciones protegidas)
    // Route::post("/games", [GameController::class, "store"]);
    // Route::put("/games/{game}", [GameController::class, "update"]);
    // Route::delete("/games/{game}", [GameController::class, "destroy"]);

    // Carrito (si implementas la API del carrito)
    // Route::get('/cart', [CartController::class, 'show']);
    // Route::post('/cart/items', [CartController::class, 'addItem']);
    // Route::put('/cart/items/{cartItemId}', [CartController::class, 'updateItem']);
    // Route::delete('/cart/items/{cartItemId}', [CartController::class, 'removeItem']);
});