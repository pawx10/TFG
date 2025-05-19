<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = ['cart_id', 'game_id', 'quantity'];

    // Relación: Un item pertenece a un carrito
    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    // Relación: Un item pertenece a un juego
    public function game()
    {
        return $this->belongsTo(Game::class);
    }
}
