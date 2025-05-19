<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReviewsSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('reviews')->insert([
            [
                'user_id' => 1, // Admin
                'game_id' => 1, // Cyberpunk 2077
                'content' => 'Gráficos espectaculares, pero con algunos bugs.',
                'rating' => 9,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 2, // User1
                'game_id' => 2, // Elden Ring
                'content' => 'Mundo abierto impresionante y combate desafiante.',
                'rating' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 1,
                'game_id' => 3, // Call of Duty
                'content' => 'Shooter sólido, aunque algo repetitivo.',
                'rating' => 8,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
