<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GamesSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('games')->insert([
            [
                'title' => 'Cyberpunk 2077',
                'description' => 'Juego de rol futurista en mundo abierto.',
                'price' => 60.00,
                'image_url' => '/img/cyberpunk.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Elden Ring',
                'description' => 'Un RPG épico de acción en un mundo abierto.',
                'price' => 70.00,
                'image_url' => '/img/ELDENRING.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Call of Duty',
                'description' => 'Shooter en primera persona lleno de acción.',
                'price' => 50.00,
                'image_url' => '/img/COD.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Forza',
                'description' => 'Juego de conducción en mundo abierto.',
                'price' => 70.00,
                'image_url' => '/img/FORZA.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Metro Exodus',
                'description' => 'Juego de accion postapocalíptico.',
                'price' => 40.00,
                'image_url' => '/img/metro.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Lies Of P',
                'description' => 'Juego soulslike.',
                'price' => 45.00,
                'image_url' => '/img/LIESOFP.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Magic: The Gathering ',
                'description' => 'Juego de cartas coleccionables.',
                'price' => 00.00,
                'image_url' => '/img/MAGIC.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
