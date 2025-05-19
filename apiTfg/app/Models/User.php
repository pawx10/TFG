<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password'];

    // Relación: Un usuario puede tener múltiples reviews
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    // Relación: Un usuario puede tener múltiples carritos
    public function carts()
    {
        return $this->hasMany(Cart::class);
    }
}
