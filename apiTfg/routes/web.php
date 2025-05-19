<?php

use Illuminate\Support\Facades\Route;

Route::view('/', 'index');
Route::view('/reviews', 'reviews');
Route::view('/cart', 'carrito');
Route::view('/login', 'login');
Route::view('/register', 'register');


