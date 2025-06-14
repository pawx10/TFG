<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            "name" => "required|string|max:255",
            "email" => "required|string|email|max:255|unique:users",
            "password" => "required|string|min:8|confirmed",
        ]);

        $user = User::create([
            "name" => $request->name,
            "email" => $request->email,
            "password" => Hash::make($request->password),
        ]);

        $token = $user->createToken("auth_token")->plainTextToken;

        return response()->json([
            "message" => "Usuario registrado correctamente.",
            "user" => $user,
            "access_token" => $token,
            "token_type" => "Bearer",
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            "email" => "required|string|email",
            "password" => "required|string",
        ]);

        $user = User::where("email", $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(["message" => "Credenciales incorrectas."], 401);
        }

        $user->tokens()->delete();
        $token = $user->createToken("auth_token")->plainTextToken;

        return response()->json([
            "message" => "Inicio de sesión exitoso.",
            "user" => $user,
            "access_token" => $token,
            "token_type" => "Bearer",
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
            return response()->json(["message" => "Sesión cerrada correctamente."], 200);
        }

        return response()->json(["message" => "No hay una sesión activa."], 400);
    }
}
