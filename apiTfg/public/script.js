// Definir API_BASE globalmente para que sea accesible por otras funciones y scripts
const API_BASE = `${window.location.origin}/api`;

// Hacer apiRequest global
// Esta función es responsable de hacer las llamadas a la API.
async function apiRequest(endpoint, method, body = null, auth = false) {
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    };
    if (auth) {
        const token = localStorage.getItem("token");
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        } else if (method.toUpperCase() !== "GET" && method.toUpperCase() !== "HEAD") {
            // Solo alertar o fallar si no es una petición GET/HEAD y se requiere auth pero no hay token
            // alert("Se requiere autenticación para esta acción."); // Considera un manejo de error más sutil
            console.warn("Se requiere autenticación para esta acción, pero no hay token.");
            throw new Error("Autenticación requerida."); // Lanzar error para que sea capturado
        }
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null,
        });

        if (response.status === 204 || response.headers.get("content-length") === "0") {
            return { success: true, status: response.status, message: "Operación exitosa sin contenido." };
        }

        const text = await response.text();
        let data = {};
        try {
            data = text ? JSON.parse(text) : {};
        } catch (jsonError) {
            console.error("La respuesta del servidor no es JSON válido:", text);
            throw new Error("Respuesta inválida del servidor.");
        }

        if (!response.ok) {
            throw new Error(data.message || `Error en la solicitud: ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error(`Error en la API (${method} ${API_BASE}${endpoint}):`, error.message);
        // El error se relanza para que la función que llama pueda manejar la UI
        throw error;
    }
}
// Exponerla globalmente si otros scripts la necesitan directamente (opcional si solo la usan funciones dentro de este script)
window.apiRequest = apiRequest;

// Hacer actualizarEstadoHeader global
// Esta función actualiza la UI del header basada en el estado de autenticación del usuario.
async function actualizarEstadoHeader() {
    // Elementos del header que se actualizarán dinámicamente
    // Se buscan aquí para asegurar que la función sea autocontenida si se llama desde otro script
    const userStatusContainer = document.getElementById("user-status-container");
    const userIconLink = document.querySelector("a.user-icon");
    const logoutBtnHeader = document.getElementById("logout-btn"); // ID del botón de logout en el header

    try {
        const userData = await obtenerUserData(API_BASE); // obtenerUserData viene de user.js

        if (userData) { // Usuario autenticado
            if (userStatusContainer) {
                userStatusContainer.innerHTML = '';
                const greetingText = document.createElement("span");
                greetingText.textContent = `Hola, ${userData.name}`;
                greetingText.classList.add("user-greeting-text");
                userStatusContainer.appendChild(greetingText);
                userStatusContainer.style.display = "inline";
            }
            if (userIconLink) {
                userIconLink.href = "perfil.html"; // Enlazar a perfil.html si está logueado
                // userIconLink.style.display = "inline-block"; // Asegurar que se vea
            }
            if (logoutBtnHeader) {
                logoutBtnHeader.textContent = "Cerrar Sesión";
                logoutBtnHeader.style.display = "inline-block";
            }
        } else { // Usuario no autenticado (invitado)
            if (userStatusContainer) {
                userStatusContainer.innerHTML = '';
                userStatusContainer.style.display = "none";
            }
            if (userIconLink) {
                userIconLink.href = "login.html"; // Enlazar a login.html si no está logueado
                userIconLink.style.display = "inline-block";
            }
            if (logoutBtnHeader) {
                logoutBtnHeader.textContent = "Invitado";
                logoutBtnHeader.style.display = "none";
            }
        }
    } catch (error) {
        console.warn("No se pudo obtener el estado del usuario para el header, mostrando como invitado:", error);
        // Forzar estado de invitado en caso de error al obtener userData
        if (userStatusContainer) userStatusContainer.style.display = "none";
        if (userIconLink) {
            userIconLink.href = "login.html";
            userIconLink.style.display = "inline-block";
        }
        if (logoutBtnHeader) logoutBtnHeader.style.display = "none";
    }
}
// Exponerla globalmente
window.actualizarEstadoHeader = actualizarEstadoHeader;


// El código que depende del DOM se mantiene dentro de DOMContentLoaded
document.addEventListener("DOMContentLoaded", async () => {
    const searchIcon = document.querySelector(".search-icon");
    const menu = document.getElementById("hamburger-menu");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const logoutBtnHeader = document.getElementById("logout-btn"); // Re-declarar para el event listener si es necesario

    // Lógica del menú hamburguesa
    if (searchIcon && menu) {
        searchIcon.addEventListener("click", () => {
            menu.style.display = menu.style.display === "block" ? "none" : "block";
        });
    }

    // Llamar a actualizarEstadoHeader al cargar la página para reflejar el estado actual
    // Asegúrate de que user.js se carga ANTES que script.js en tu HTML
    if (typeof obtenerUserData === 'function' && typeof window.actualizarEstadoHeader === 'function') {
        await window.actualizarEstadoHeader();
    } else {
        console.warn("obtenerUserData o actualizarEstadoHeader no están definidos globalmente. Asegúrate de que user.js se carga antes y las funciones están expuestas.");
    }

    // Función para mostrar mensajes en formularios
    function mostrarMensajeFormulario(formElement, mensaje, tipo = "error") {
        let messageEl = formElement.querySelector(".form-message");
        if (!messageEl) { // Si no existe, crearlo (opcional, mejor tenerlo en el HTML)
            messageEl = document.createElement("p");
            messageEl.className = "form-message";
            // formElement.insertBefore(messageEl, formElement.querySelector("button[type='submit']"));
            const button = formElement.querySelector("button[type='submit']");
            if (button) formElement.insertBefore(messageEl, button);
            else formElement.appendChild(messageEl); // fallback
        }
        messageEl.textContent = mensaje;
        messageEl.className = `form-message ${tipo}`; // Resetear y añadir clase de tipo
        messageEl.style.display = "block";
    }

    function ocultarMensajeFormulario(formElement) {
        const messageEl = formElement.querySelector(".form-message");
        if (messageEl) {
            messageEl.style.display = "none";
            messageEl.textContent = "";
            messageEl.className = "form-message";
        }
    }


    // Manejar Login
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            ocultarMensajeFormulario(loginForm);
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                const data = await window.apiRequest("/login", "POST", { email, password }); // Usar apiRequest global
                if (data && data.access_token) {
                    localStorage.setItem("token", data.access_token);
                    window.location.href = "index.html";
                } else {
                    // Esto es por si apiRequest no lanza error pero no devuelve token
                    throw new Error(data ? data.message : "Respuesta inesperada del servidor.");
                }
            } catch (error) {
                mostrarMensajeFormulario(loginForm, error.message || "Error al iniciar sesión.");
                console.error("Fallo el login:", error);
            }
        });
    }

    // Manejar Registro
    if (registerForm) {
        registerForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            ocultarMensajeFormulario(registerForm);
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const password_confirmation = document.getElementById("password_confirmation").value;

            try {
                const data = await window.apiRequest("/register", "POST", { name, email, password, password_confirmation }); // Usar apiRequest global
                if (data && (data.access_token || data.message.includes("registrado correctamente"))) {
                    alert("Registro exitoso. Ahora inicia sesión."); // Puedes cambiar este alert
                    window.location.href = "login.html";
                } else {
                    throw new Error(data ? data.message : "Respuesta inesperada del servidor.");
                }
            } catch (error) {
                mostrarMensajeFormulario(registerForm, error.message || "Error al registrar el usuario.");
                console.error("Fallo el registro:", error);
            }
        });
    }

    // Manejar Logout (para el botón en el header general, si existe en la página actual)
    // El ID 'logout-btn' debe ser consistente en todos los headers
    const logoutButtonGeneral = document.getElementById("logout-btn");
    if (logoutButtonGeneral) {
        logoutButtonGeneral.addEventListener("click", async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    await window.apiRequest("/logout", "POST", null, true); // Usar apiRequest global
                    console.log("Sesión cerrada correctamente en el servidor.");
                } catch (error) {
                    console.warn("No se pudo cerrar la sesión en el servidor o hubo un error, limpiando localmente:", error.message);
                }
            }

            localStorage.removeItem("token");
            localStorage.removeItem("carrito");

            if (typeof window.actualizarEstadoHeader === 'function') {
                await window.actualizarEstadoHeader(); // Actualizar UI del header
            }

            // Redirigir o recargar
            // Si estamos en una página que requiere login (ej. perfil.html), redirigir a login.
            // Si estamos en index.html, recargar para mostrar como invitado.
            if (window.location.pathname.includes("perfil.html")) { // Ejemplo
                 window.location.href = "login.html";
            } else {
                 window.location.reload(); // Recargar la página actual
            }
        });
    }


    // Función para cargar los juegos desde la API
    async function cargarJuegos() {
        const gamesContainer = document.querySelector(".games");
        if (!gamesContainer) return;
        gamesContainer.innerHTML = "<p>Cargando juegos...</p>"; // Mensaje de carga

        try {
            const result = await window.apiRequest("/games", "GET"); // Usar apiRequest global
            if (!result || !result.data) throw new Error("No se recibieron datos de juegos.");
            const gamesData = result.data;

            gamesContainer.innerHTML = ""; // Limpiar contenido previo

            if (gamesData.length > 0) {
                gamesData.forEach(game => {
                    const gameCard = document.createElement("div");
                    gameCard.classList.add("game");
                    const imageUrl = game.image_url || '../img/default-game-placeholder.png'; // Placeholder
                    const description = game.description ? game.description.substring(0, 100) + (game.description.length > 100 ? '...' : '') : 'Sin descripción.';

                    gameCard.innerHTML = `
                        <img src="${imageUrl}" alt="${game.title}">
                        <p class="game-title"><a href="game-detail.html?id=${game.id}">${game.title}</a></p>
                        <p class="game-desc">${description}</p>
                        <p class="game-price">${parseFloat(game.price).toFixed(2)}€</p>
                        <img src="../img/CARRITO.png" alt="Añadir al carrito" class="cart-icon"
                             data-game-id="${game.id}"
                             data-game-title="${game.title}"
                             data-game-price="${game.price}"
                             data-game-image="${imageUrl}">
                    `;
                    gamesContainer.appendChild(gameCard);
                });

                document.querySelectorAll(".cart-icon").forEach(icon => {
                    icon.addEventListener("click", (e) => {
                        if (typeof agregarAlCarrito === 'function') { // agregarAlCarrito de cart.js
                            const gameId = e.target.getAttribute("data-game-id");
                            const gameTitle = e.target.getAttribute("data-game-title");
                            const gamePrice = e.target.getAttribute("data-game-price");
                            const gameImage = e.target.getAttribute("data-game-image");

                            agregarAlCarrito({
                                id: parseInt(gameId),
                                title: gameTitle,
                                price: parseFloat(gamePrice),
                                image_url: gameImage
                            });
                            // Opcional: actualizar contador de carrito si tienes uno visible en el header
                            // if (typeof window.actualizarContadorCarrito === 'function') window.actualizarContadorCarrito();
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
            if (gamesContainer) {
                gamesContainer.innerHTML = `<p>Error al cargar los juegos: ${error.message}. Inténtalo más tarde.</p>`;
            }
        }
    }

    // Llamada para cargar los juegos (solo si estamos en una página que los muestra)
    if (document.querySelector(".games")) {
        cargarJuegos();
    }

});