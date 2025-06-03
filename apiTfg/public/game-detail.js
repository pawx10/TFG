// /public/game-detail.js
document.addEventListener("DOMContentLoaded", async () => {
    const gameDetailContainer = document.getElementById("game-detail-container");
    const reviewsListContainer = document.getElementById("reviews-list");
    const addReviewSection = document.getElementById("add-review-section");
    const addReviewForm = document.getElementById("add-review-form");
    const reviewGameIdInput = document.getElementById("review-game-id"); // Input oculto para el game_id
    const reviewFormMessage = document.getElementById("review-form-message"); // Para mensajes de éxito/error del form

    // API_BASE debería ser global si se usa en múltiples scripts, o definido aquí si es solo para este.
    // Asumimos que API_BASE está disponible globalmente desde script.js o se define aquí.
    // const API_BASE = window.API_BASE || `${window.location.origin}/api`; // Ejemplo si es global
    // Si no es global, y script.js no la define globalmente, usa:
    const API_BASE_DETAIL = `${window.location.origin}/api`;


    // Obtener el ID del juego de la URL (ej. game-detail.html?id=1)
    const urlParams = new URLSearchParams(window.location.search);
    const gameIdFromUrl = urlParams.get('id'); // Renombrado para claridad

    if (!gameIdFromUrl) {
        if (gameDetailContainer) gameDetailContainer.innerHTML = "<p class='error-message'>No se especificó un ID de juego.</p>";
        if (reviewsListContainer) reviewsListContainer.innerHTML = "";
        return;
    }

    // --- Cargar Detalles del Juego ---
    async function loadGameDetails() {
        if (!gameDetailContainer) return;
        gameDetailContainer.innerHTML = "<p class='loading-message'>Cargando detalles del juego...</p>";

        try {
            // Usamos la función apiRequest global de script.js
            const game = await window.apiRequest(`/games/${gameIdFromUrl}`, "GET");

            if (!game || !game.data) {
                throw new Error("Juego no encontrado o respuesta inválida.");
            }
            const gameData = game.data;

            gameDetailContainer.innerHTML = `
                <h1>${gameData.title}</h1>
                <img src="${gameData.image_url || '../img/default-game-placeholder.png'}" alt="${gameData.title}" class="game-image-large">
                <p class="game-price">${parseFloat(gameData.price).toFixed(2)}€</p>
                <p class="game-description">${gameData.description || 'No hay descripción disponible.'}</p>
                <button class="add-to-cart-btn" data-game-id="${gameData.id}" data-game-title="${gameData.title}" data-game-price="${gameData.price}" data-game-image="${gameData.image_url || '../img/default-game-placeholder.png'}">
                    Añadir al Carrito
                </button>
            `;

            // Asignar el game_id al input oculto del formulario de reviews
            if (reviewGameIdInput) {
                reviewGameIdInput.value = gameData.id;
                console.log("Game ID asignado al input oculto 'review-game-id':", reviewGameIdInput.value); // DEBUG
            } else {
                console.warn("El input oculto 'review-game-id' no fue encontrado en el DOM.");
            }


            const addToCartBtn = gameDetailContainer.querySelector(".add-to-cart-btn");
            if (addToCartBtn) {
                addToCartBtn.addEventListener("click", (e) => {
                    if (typeof agregarAlCarrito === 'function') {
                        agregarAlCarrito({
                            id: parseInt(e.target.getAttribute("data-game-id"), 10),
                            title: e.target.getAttribute("data-game-title"),
                            price: parseFloat(e.target.getAttribute("data-game-price")),
                            image_url: e.target.getAttribute("data-game-image")
                        });
                        if (typeof actualizarContadorCarrito === 'function') actualizarContadorCarrito();
                    } else {
                        console.error("agregarAlCarrito no está definido.");
                        alert("Error al añadir al carrito.");
                    }
                });
            }

        } catch (error) {
            console.error("Error al cargar detalles del juego:", error);
            if (gameDetailContainer) gameDetailContainer.innerHTML = `<p class='error-message'>Error al cargar el juego: ${error.message}</p>`;
        }
    }

    // --- Cargar Reviews del Juego ---
    async function loadGameReviews() {
        if (!reviewsListContainer) return;
        reviewsListContainer.innerHTML = "<p class='loading-message'>Cargando reviews...</p>";

        try {
            const reviewsResponse = await window.apiRequest(`/games/${gameIdFromUrl}/reviews`, "GET");

            if (!reviewsResponse || !reviewsResponse.data) {
                reviewsListContainer.innerHTML = "<p>No hay reviews para este juego todavía o error al cargarlas.</p>";
                return;
            }
            const reviews = reviewsResponse.data;
            reviewsListContainer.innerHTML = "";

            if (reviews.length === 0) {
                reviewsListContainer.innerHTML = "<p>Sé el primero en dejar una review para este juego.</p>";
                return;
            }

            reviews.forEach(review => {
                const reviewElement = document.createElement("div");
                reviewElement.classList.add("review-item");
                reviewElement.innerHTML = `
                    <p class="review-rating">${'⭐'.repeat(review.rating)} (${review.rating}/5)</p>
                    <p class="review-author"><strong>Por:</strong> ${review.user.name} - <em>${new Date(review.created_at).toLocaleDateString()}</em></p>
                    <p class="review-content-text">${review.content}</p>
                `;
                reviewsListContainer.appendChild(reviewElement);
            });

        } catch (error) {
            console.error("Error al cargar reviews del juego:", error);
            if (reviewsListContainer) reviewsListContainer.innerHTML = `<p class='error-message'>Error al cargar las reviews: ${error.message}</p>`;
        }
    }

    // --- Funcionalidad 3: Enviar Nueva Review ---
    if (addReviewForm) {
        addReviewForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (reviewFormMessage) {
                reviewFormMessage.textContent = "";
                reviewFormMessage.className = "form-message"; // Reset class
                reviewFormMessage.style.display = "none";
            }

            const token = localStorage.getItem("token");
            if (!token) {
                if (reviewFormMessage) {
                    reviewFormMessage.textContent = "Debes iniciar sesión para dejar una review.";
                    reviewFormMessage.className = "form-message error";
                    reviewFormMessage.style.display = "block";
                }
                return;
            }

            // Obtener el valor del game_id DESDE el input oculto en el momento del submit
            const gameIdForReview = reviewGameIdInput ? reviewGameIdInput.value : null;

            console.log("Valor del input 'review-game-id' al enviar:", gameIdForReview); // DEBUG
            if (!gameIdForReview) {
                console.error("Error: game_id no está disponible en el input oculto al enviar la review.");
                if (reviewFormMessage) {
                    reviewFormMessage.textContent = "Error: No se pudo identificar el juego para la review.";
                    reviewFormMessage.className = "form-message error";
                    reviewFormMessage.style.display = "block";
                }
                return;
            }

            const reviewData = {
                game_id: parseInt(gameIdForReview, 10), // Usar el valor leído del input
                rating: parseInt(document.getElementById("review-rating").value, 10),
                content: document.getElementById("review-content").value,
            };

            console.log("Datos de la review a enviar:", JSON.stringify(reviewData)); // DEBUG

            try {
                const response = await window.apiRequest("/reviews", "POST", reviewData, true);
                if (response && response.data && response.data.id) { // Verificar si la review se creó (tiene un ID)
                    if (reviewFormMessage) {
                        reviewFormMessage.textContent = "¡Review enviada con éxito!";
                        reviewFormMessage.className = "form-message success";
                        reviewFormMessage.style.display = "block";
                    }
                    addReviewForm.reset();
                    // Asignar de nuevo el game_id al input oculto después del reset,
                    // ya que form.reset() podría borrarlo si no es un valor por defecto del HTML.
                    if (reviewGameIdInput) reviewGameIdInput.value = gameIdForReview;

                    await loadGameReviews(); // Recargar la lista de reviews
                } else {
                    // Si la respuesta no tiene 'data' o 'data.id', pero fue exitosa (ej. status 200/201 con solo mensaje)
                    if (response && response.message && (response.status === 200 || response.status === 201)) {
                         if (reviewFormMessage) {
                            reviewFormMessage.textContent = response.message || "Review procesada.";
                            reviewFormMessage.className = "form-message success";
                            reviewFormMessage.style.display = "block";
                        }
                        addReviewForm.reset();
                        if (reviewGameIdInput) reviewGameIdInput.value = gameIdForReview;
                        await loadGameReviews();
                    } else {
                        throw new Error(response ? response.message : "Error desconocido al enviar la review.");
                    }
                }
            } catch (error) {
                console.error("Error al enviar review:", error);
                if (reviewFormMessage) {
                    reviewFormMessage.textContent = `Error: ${error.message}`;
                    reviewFormMessage.className = "form-message error";
                    reviewFormMessage.style.display = "block";
                }
            }
        });
    }

    // --- Controlar visibilidad del formulario de review y contador de carrito ---
    async function checkUserStatusAndSetupPage() {
        // API_BASE_DETAIL o la variable global API_BASE de script.js
        const userData = await obtenerUserData(API_BASE_DETAIL);
        if (addReviewSection) {
            if (userData) {
                addReviewSection.style.display = "block";
            } else {
                addReviewSection.style.display = "none";
            }
        }
        if (typeof actualizarContadorCarrito === 'function') actualizarContadorCarrito();
    }


    // --- Funcionalidad 4: Actualizar Contador del Carrito en Header ---
    // Esta función debe ser global si se llama desde otros scripts (ej. cart.js)
    // o definida aquí si solo se usa en esta página.
    function actualizarContadorCarrito() {
        const cartItemCountElement = document.getElementById("cart-item-count");
        if (cartItemCountElement && typeof obtenerCarrito === 'function') {
            const carrito = obtenerCarrito();
            const itemCount = carrito.reduce((total, item) => total + item.quantity, 0);
            cartItemCountElement.textContent = itemCount;
            cartItemCountElement.style.display = itemCount > 0 ? "inline-block" : "none";
        }
    }
    // Exponerla si es necesario globalmente
    window.actualizarContadorCarrito = actualizarContadorCarrito;


    // --- Inicialización ---
    // Asegurarse que las funciones globales de script.js y user.js estén disponibles
    if (typeof window.apiRequest !== 'function' || typeof window.obtenerUserData !== 'function' || typeof window.actualizarEstadoHeader !== 'function') {
        console.error("Funciones globales esenciales (apiRequest, obtenerUserData, actualizarEstadoHeader) no están disponibles. Asegúrate que script.js y user.js se cargan antes y exponen estas funciones.");
        // Podrías mostrar un error al usuario aquí o detener la ejecución.
        if(gameDetailContainer) gameDetailContainer.innerHTML = "<p class='error-message'>Error crítico al cargar la página. Funcionalidades básicas no disponibles.</p>";
        return; // Detener si las dependencias no están
    }


    await loadGameDetails();
    await loadGameReviews();
    await checkUserStatusAndSetupPage();

    if (typeof window.actualizarEstadoHeader === 'function') {
        await window.actualizarEstadoHeader();
    }

});