<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Llama a los seeders específicos
        $this->call([
            UsersSeeder::class,      // Seeder para los usuarios (puedes usar el factory existente)
            GamesSeeder::class,      // Seeder para los juegos
            ReviewsSeeder::class,    // Seeder para las reviews
            CartsSeeder::class,      // Seeder para los carritos
        ]);
    }
}
