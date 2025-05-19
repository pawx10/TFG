<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'description', 'price', 'image_url'];

    // Relación: Un juego puede tener múltiples reviews
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    // Relación: Un juego puede estar en varios items de carrito
    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }
}
