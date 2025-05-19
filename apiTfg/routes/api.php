<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GameController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;

// Rutas públicas
Route::post("/register", [AuthController::class, "register"]);
Route::post("/login", [AuthController::class, "login"]);

Route::get("/games", [GameController::class, "index"]);
Route::get("/games/{id}", [GameController::class, "show"]);
Route::get("/reviews", [ReviewController::class, "index"]);
Route::get("/reviews/{id}", [ReviewController::class, "show"]);

// Rutas protegidas (requieren autenticación)
Route::middleware("auth:sanctum")->group(function () {
    Route::post("/logout", [AuthController::class, "logout"]);
    Route::post("/reviews", [ReviewController::class, "store"]);
    Route::delete("/reviews/{id}", [ReviewController::class, "destroy"]);
    Route::get("/user", function (Request $request) {
        return response()->json($request->user());
    });
});
