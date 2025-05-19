<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('games', function (Blueprint $table) {
            $table->id(); // ID del juego
            $table->string('title'); // Título del juego
            $table->text('description'); // Descripción del juego
            $table->decimal('price', 8, 2); // Precio del juego (máximo 999,999.99)
            $table->string('image_url')->nullable(); // URL de la imagen (opcional)
            $table->timestamps(); // created_at y updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('games');
    }
};
