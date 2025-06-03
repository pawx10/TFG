document.addEventListener("DOMContentLoaded", async () => {

    const searchIcon = document.querySelector(".search-icon");
    const menu = document.getElementById("hamburger-menu");
    // const userIcon = document.querySelector(".user-icon"); // Se manejará dentro de actualizarEstadoHeader
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const API_BASE = `${window.location.origin}/api`;

    // Elementos del header que se actualizarán dinámicamente
    const userStatusContainer = document.getElementById("user-status-container");
    const userIconLink = document.querySelector("a.user-icon"); // El enlace <a> que envuelve la imagen de usuario
    const logoutBtnHeader = document.getElementById("logout-btn"); // Botón de logout en el header de index.html
    

    if (searchIcon && menu) {
        searchIcon.addEventListener("click", () => {
            menu.style.display = menu.style.display === "block" ? "none" : "block";
        });
    }

    // Función para actualizar el estado del header (nombre de usuario, botón login/logout)
    // Esta función asume que user.js y obtenerUserData ya están disponibles globalmente
    async function actualizarEstadoHeader() {
        const userData = await obtenerUserData(API_BASE); // obtenerUserData viene de user.js

        if (userData) { // Usuario autenticado
            if (userStatusContainer) {
                userStatusContainer.innerHTML = ''; // Limpiar
                const greetingText = document.createElement("span");
                greetingText.textContent = `Hola, ${userData.name}`;
                greetingText.classList.add("user-greeting-text");
                userStatusContainer.appendChild(greetingText);
                userStatusContainer.style.display = "inline";
            }
            if (userIconLink) { // Ocultar el icono de login genérico
                userIconLink.style.display = "none";
                // Si quisieras que el icono de usuario lleve al perfil cuando está logueado:
                // userIconLink.href = "perfil.html";
                // userIconLink.style.display = "inline-block";
            }
            if (logoutBtnHeader) {
                logoutBtnHeader.textContent = "Cerrar Sesión";
                logoutBtnHeader.style.display = "inline-block"; // o "block" según tu CSS
            }
        } else { // Usuario no autenticado (invitado)
            if (userStatusContainer) {
                userStatusContainer.innerHTML = '';
                userStatusContainer.style.display = "none";
            }
            if (userIconLink) { // Mostrar el icono de login genérico y enlazar a login.html
                userIconLink.href = "login.html";
                userIconLink.style.display = "inline-block"; // o "block"
            }
            if (logoutBtnHeader) {
                logoutBtnHeader.textContent = "Invitado"; // O simplemente ocultarlo
                logoutBtnHeader.style.display = "none"; // Ocultar si es "Invitado" y no se quiere mostrar
            }
        }
    }

    // Llamar a actualizarEstadoHeader al cargar la página para reflejar el estado actual
    // Asegúrate de que user.js se carga ANTES que script.js en tu HTML
    if (typeof obtenerUserData === 'function') {
        await actualizarEstadoHeader();
    } else {
        console.warn("obtenerUserData no está definido. Asegúrate de que user.js se carga antes que script.js.");
    }


    // Función genérica para hacer peticiones a la API
    async function apiRequest(endpoint, method, body = null, auth = false) {
        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        };
        if (auth) {
            const token = localStorage.getItem("token");
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            } else if (method !== "GET") { // Si no es GET y requiere auth pero no hay token, no continuar
                alert("Se requiere autenticación para esta acción.");
                // Podrías redirigir a login.html aquí si es apropiado
                // window.location.href = "login.html";
                return null; // O lanzar un error
            }
        }

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : null,
            });

            // Para respuestas sin contenido (ej. 204 No Content en un DELETE o logout exitoso)
            if (response.status === 204 || response.headers.get("content-length") === "0") {
                return { success: true, status: response.status }; // Devuelve un objeto indicando éxito
            }

            const text = await response.text();
            // console.log("Respuesta completa de la API:", text); // Útil para depurar

            let data = {};
            try {
                data = text ? JSON.parse(text) : {};
            } catch (jsonError) {
                console.error("La respuesta no es JSON válido:", text);
                throw new Error("La respuesta del servidor no es JSON válido.");
            }

            if (!response.ok) {
                throw new Error(data.message || `Error en la solicitud: ${response.status}`);
            }
            return data;
        } catch (error) {
            console.error(`Error en la API (${method} ${endpoint}):`, error);
            alert(error.message); // Considera mostrar errores de forma más amigable
            return null;
        }
    }

    // Manejar Login
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            const data = await apiRequest("/login", "POST", { email, password });
            if (data && data.access_token) {
                localStorage.setItem("token", data.access_token);
                // Opcional: guardar datos del usuario en localStorage si se necesitan globalmente sin llamar a /user
                // localStorage.setItem("userData", JSON.stringify(data.user));
                window.location.href = "index.html"; // Redirigir a la página principal
            } else {
                // El error ya se muestra con alert desde apiRequest
                console.error("Fallo el login", data);
            }
        });
    }

    // Manejar Registro
    if (registerForm) {
        registerForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const password_confirmation = document.getElementById("password_confirmation").value;

            const data = await apiRequest("/register", "POST", { name, email, password, password_confirmation });
            if (data && data.access_token) { // Un registro exitoso también podría devolver un token
                alert("Registro exitoso. Ahora inicia sesión.");
                window.location.href = "login.html";
            } else {
                // El error ya se muestra con alert desde apiRequest
                console.error("Fallo el registro", data);
            }
        });
    }

    // Manejar Logout (para el botón en index.html o cualquier header general)
    if (logoutBtnHeader) {
        logoutBtnHeader.addEventListener("click", async () => {
            const token = localStorage.getItem("token");
            if (token) {
                // Intenta cerrar sesión en el servidor
                const result = await apiRequest("/logout", "POST", null, true);
                if (result && result.success) {
                    console.log("Sesión cerrada correctamente en el servidor.");
                } else {
                    console.warn("No se pudo cerrar la sesión en el servidor o no hubo respuesta, limpiando localmente.");
                }
            }

            // Siempre limpiar localStorage y actualizar UI
            localStorage.removeItem("token");
            localStorage.removeItem("carrito"); // También limpiar el carrito local al cerrar sesión
            // localStorage.removeItem("userData"); // Si guardaste datos del usuario

            // Actualizar el header para reflejar el estado de no autenticado
            await actualizarEstadoHeader();

            // Opcional: Redirigir a login.html o recargar la página actual
            // Si estás en index.html, podrías querer recargar para que se muestre como invitado.
            // Si estás en otra página, podrías redirigir a login.
            if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
                 window.location.reload();
            } else {
                 window.location.href = "login.html";
            }
        });
    }


    // Función para cargar los juegos desde la API
    async function cargarJuegos() {
        try {
            // Podrías usar apiRequest aquí también:
            // const result = await apiRequest("/games", "GET");
            // if (!result || !result.data) throw new Error("No se recibieron datos de juegos.");
            // const gamesData = result.data;

            const response = await fetch(`${API_BASE}/games`, {
                method: "GET",
                headers: { "Accept": "application/json" }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            // console.log("Juegos recibidos:", data);

            const gamesContainer = document.querySelector(".games"); // Asumiendo que está en index.html
            if (!gamesContainer) return;
            gamesContainer.innerHTML = ""; // Limpiar contenido previo

            if (data.data && data.data.length > 0) {
                data.data.forEach(game => {
                    const gameCard = document.createElement("div");
                    gameCard.classList.add("game"); // Clase para estilizar la tarjeta del juego
                    gameCard.innerHTML = `
                        <img src="${game.image_url || '../img/default-game-placeholder.png'}" alt="${game.title}">
                        <p class="game-title"><a href="game-detail.html?id=${game.id}">${game.title}</a></p> <!-- Asumiendo game-detail.html -->
                        <p class="game-desc">${game.description ? game.description.substring(0, 100) + '...' : 'Sin descripción.'}</p>
                        <p class="game-price">${parseFloat(game.price).toFixed(2)}€</p>
                        <img src="../img/CARRITO.png" alt="Añadir al carrito" class="cart-icon" data-game-id="${game.id}" data-game-title="${game.title}" data-game-price="${game.price}" data-game-image="${game.image_url || '../img/default-game-placeholder.png'}">
                    `;
                    gamesContainer.appendChild(gameCard);
                });

                // Agregar event listeners a cada ícono de carrito
                // Asegúrate de que cart.js y la función agregarAlCarrito estén cargados
                document.querySelectorAll(".cart-icon").forEach(icon => {
                    icon.addEventListener("click", (e) => {
                        if (typeof agregarAlCarrito === 'function') {
                            const gameId = e.target.getAttribute("data-game-id");
                            const gameTitle = e.target.getAttribute("data-game-title");
                            const gamePrice = e.target.getAttribute("data-game-price");
                            const gameImage = e.target.getAttribute("data-game-image");

                            agregarAlCarrito({
                                id: parseInt(gameId), // Asegurar que el ID sea número si cart.js lo espera así
                                title: gameTitle,
                                price: parseFloat(gamePrice),
                                image_url: gameImage
                                // quantity se manejará dentro de agregarAlCarrito
                            });
                        } else {
                            console.error("La función agregarAlCarrito no está definida. Asegúrate de que cart.js se carga correctamente.");
                            alert("Error al intentar agregar al carrito.");
                        }
                    });
                });
            } else {
                gamesContainer.innerHTML = "<p>No hay juegos disponibles en este momento.</p>";
            }
        } catch (error) {
            console.error("Error al cargar juegos:", error);
            const gamesContainer = document.querySelector(".games");
            if (gamesContainer) {
                gamesContainer.innerHTML = "<p>Error al cargar los juegos. Inténtalo más tarde.</p>";
            }
        }
    }

    // Llamada para cargar los juegos al iniciar la página (si estamos en index.html o donde se muestren)
    if (document.querySelector(".games")) { // Solo cargar si existe el contenedor de juegos
        cargarJuegos();
    }

});