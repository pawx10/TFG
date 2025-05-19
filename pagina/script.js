// Abrir menú hamburguesa al hacer clic en la lupa
// script.js

// script.js

document.addEventListener('DOMContentLoaded', () => {
    const searchIcon = document.querySelector('.search-icon');
    const menu = document.getElementById('hamburger-menu');

    // Verifica si el icono y el menú existen antes de añadir el evento
    if (searchIcon && menu) {
        searchIcon.addEventListener('click', () => {
            menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
        });
    } else {
        console.error('Elemento no encontrado: revisa la existencia de .search-icon y #hamburger-menu');
    }
});


// Función para cargar las cards dinámicamente desde un JSON
function cargarJuegos() {
    fetch('../data/games.json')  // Ruta del archivo JSON
        .then(response => response.json())
        .then(data => {
            const gamesContainer = document.querySelector('.games');
            gamesContainer.innerHTML = '';  // Limpiar cualquier contenido anterior

            data.games.forEach(game => {
                const gameCard = `
                    <div class="game">
                        <img src="${game.image}" alt="${game.title}">
                        <p class="game-title"><a href="${game.link}">${game.title}</a></p>
                        <p class="game-desc">${game.description}</p>
                        <p class="game-ign">IGN: ${game.ign}</p>
                        <span class="game-price">${game.price}</span>
                        <img src="../img/carrito.png" alt="Carrito" class="cart-icon">
                    </div>
                `;
                gamesContainer.innerHTML += gameCard;
            });
        })
        .catch(error => console.error('Error al cargar el JSON:', error));
}

// Cargar los juegos al iniciar la página
document.addEventListener('DOMContentLoaded', cargarJuegos);
