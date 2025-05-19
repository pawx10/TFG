<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'game_id', 'content', 'rating'];

    // Relación: Una review pertenece a un usuario
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relación: Una review pertenece a un juego
    public function game()
    {
        return $this->belongsTo(Game::class);
    }
}
