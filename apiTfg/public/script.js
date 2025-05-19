document.addEventListener("DOMContentLoaded", async () => {
    const searchIcon = document.querySelector(".search-icon");
    const menu = document.getElementById("hamburger-menu");
    const userIcon = document.querySelector(".user-icon");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const API_BASE = `${window.location.origin}/api`;
    const logoutBtn = document.getElementById("logout-btn");
    const userStatusContainer = document.getElementById("user-status-container"); 

    if (searchIcon && menu) {
        searchIcon.addEventListener("click", () => {
            menu.style.display = menu.style.display === "block" ? "none" : "block";
        });
    }


    const userData = await obtenerUserData(API_BASE);
    console.log("userData", userData);

    if (userData){
        if (userStatusContainer) {
            // Crear un elemento <span> para el saludo
            const greetingText = document.createElement("span");
            greetingText.textContent = `Hola, ${userData.name || 'Usuario'}`;
            greetingText.classList.add("user-greeting-text"); // Clase para estilizar el texto

            // Limpiar el contenedor y añadir el saludo
            userStatusContainer.innerHTML = ''; // Elimina el <a> del icono
            userStatusContainer.appendChild(greetingText);
        }
        if (userIcon){
            userIcon.style.display = "none";
            
        }
       
    }

 if (userIcon) {
            userIcon.addEventListener("click", () => {
                console.log("redirigiendo al login");
                event.preventDefault();
                window.location.href = "login.html";
            });
        }


       // const userData = await obtenerUserData(API_BASE);

  /*   const userData = await obtenerUserData(API_BASE);
    if (userData) {
        console.log("Usuario autenticado:", userData);
        if (userIcon) {
            console.log("estoy en user icon");
            userIcon.setAttribute("title", `Perfil de ${userData.name}`);
            userIcon.addEventListener("click", () => {
                window.location.href = "perfil.html";
            });
        }
    } else {
        console.log("estoy aqui")
       
    } 
 */

    // Función genérica para hacer peticiones a la API
    async function apiRequest(endpoint, method, body = null, auth = false) {
        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        };
        if (auth) {
            const token = localStorage.getItem("token");
            if (token) headers["Authorization"] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : null,
            });

            const text = await response.text();
            console.log("Respuesta completa:", text);

            let data = {};
            try {
                data = text ? JSON.parse(text) : {};
            } catch (jsonError) {
                throw new Error("La respuesta no es JSON válido");
            }

            if (!response.ok) {
                throw new Error(data.message || "Error en la solicitud");
            }
            return data;
        } catch (error) {
            console.error("Error en la API:", error);
            alert(error.message);
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
            if (data) {
                localStorage.setItem("token", data.access_token);
                window.location.href = "index.html";
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
            if (data) {
                alert("Registro exitoso. Ahora inicia sesión.");
                window.location.href = "login.html";
            }
        });
    }

    // Manejar Logout
/*     if (userIcon) {
        userIcon.addEventListener("click", async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                window.location.href = "login.html";
                return;
            }
            const data = await apiRequest("/logout", "POST", null, true);
            if (data) {
                localStorage.removeItem("token");
                window.location.href = "login.html";
            }
        });
    } */
    //LOGOUT
if (logoutBtn) {
        
        console.log("logout button", logoutBtn);
        
        function actualizarEstadoUsuario() {
            const usuario = localStorage.getItem("token");
            if (usuario) {
                logoutBtn.textContent = "Cerrar Sesión";
                logoutBtn.style.display = "block";
            } else {
                console.log("invitado");
                logoutBtn.textContent = "Invitado";
                logoutBtn.style.display = "none"; // Ocultar si no hay usuario
            }
        }
    
         logoutBtn.addEventListener("click", () => {
            console.log("eliminando token de LS");
            localStorage.removeItem("token"); // Eliminar usuario guardado
            localStorage.removeItem("carrito"); 
            console.log("invitado");
            logoutBtn.textContent = "Invitado";
            logoutBtn.style.display = "none"; 
            userStatusContainer.style.display = "none"; 
            userIcon.style.display = "";
          //  actualizarEstadoUsuario();
        });
       
    
       actualizarEstadoUsuario(); // Verificar estado al cargar la página

}

    // Función para cargar los juegos desde la API
    // Función para cargar los juegos desde la API
async function cargarJuegos() {
    try {
        const response = await fetch(`${API_BASE}/games`, {
            method: "GET",
            headers: { "Accept": "application/json" }
        });
        const data = await response.json();
        console.log("Juegos recibidos:", data);

        const gamesContainer = document.querySelector(".games");
        if (!gamesContainer) return;
        gamesContainer.innerHTML = "";

        data.data.forEach(game => {
            // Crear la tarjeta del juego
            const gameCard = document.createElement("div");
            gameCard.classList.add("game");
            gameCard.innerHTML = `
                <img src="${game.image_url}" alt="${game.title}">
                <p class="game-title"><a href="/game/${game.id}">${game.title}</a></p>
                <p class="game-desc">${game.description}</p>
                <p class="game-price">${game.price}€</p>
                <img src="/img/carrito.png" alt="Añadir al carrito" class="cart-icon" data-game-id="${game.id}">
            `;
            gamesContainer.appendChild(gameCard);
        });

        // Agregar event listeners a cada ícono de carrito
        document.querySelectorAll(".cart-icon").forEach(icon => {
            icon.addEventListener("click", async (e) => {
                const gameId = e.target.getAttribute("data-game-id");
                const game = data.data.find(g => g.id == gameId); // Busca el juego en la lista
                if (game) {
                    agregarAlCarrito({
                        id: game.id,
                        title: game.title,
                        price: game.price,
                        image_url: game.image_url
                    });
                }
            });
        });
    } catch (error) {
        console.error("Error al cargar juegos:", error);
    }
}
    // async function cargarJuegos() {
    //     try {
    //         const response = await fetch(`${API_BASE}/games`, {
    //             method: "GET",
    //             headers: { "Accept": "application/json" }
    //         });
    //         const data = await response.json();
    //         console.log("Juegos recibidos:", data);

    //         const gamesContainer = document.querySelector(".games");
    //         if (!gamesContainer) return;
    //         gamesContainer.innerHTML = "";

    //         data.data.forEach(game => {
    //             // Crear la tarjeta del juego
    //             const gameCard = document.createElement("div");
    //             gameCard.classList.add("game");
    //             gameCard.innerHTML = `
    //                 <img src="${game.image_url}" alt="${game.title}">
    //                 <p class="game-title"><a href="/game/${game.id}">${game.title}</a></p>
    //                 <p class="game-desc">${game.description}</p>
    //                 <p class="game-price">${game.price}€</p>
    //                 <img src="/img/carrito.png" alt="Añadir al carrito" class="cart-icon" data-game-id="${game.id}">
    //             `;
    //             gamesContainer.appendChild(gameCard);
    //         });


            // <!-- La siguiente parte es la lógica de carrito que moveremos a cart.js -->
            /*
            // Agregar event listeners a cada ícono de carrito
            document.querySelectorAll(".cart-icon").forEach(icon => {
                icon.addEventListener("click", async (e) => {
                    const gameId = e.target.getAttribute("data-game-id");
                    console.log("gameID:", gameId);
                    await handleClickGame(gameId);
                });
            });
            */
    //     } catch (error) {
    //         console.error("Error al cargar juegos:", error);
    //     }
    // }

    // Llamada para cargar los juegos al iniciar la página
    cargarJuegos();

    // La función handleClickGame se comenta aquí ya que la lógica del carrito se trasladará a cart.js
    /*
    async function handleClickGame(gameId){
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Debes iniciar sesión para agregar juegos al carrito.");
            window.location.href = "login.html";
            return;
        }
        // Aquí se implementaría la lógica para agregar el juego al carrito (por ejemplo, guardarlo en localStorage)
        // Por simplicidad, podemos simular la adición con un alert y almacenar el juego en localStorage

        // Obtener el carrito actual desde localStorage o inicializarlo como array
        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        // Agregar el juego (suponiendo que el gameId es único)
        carrito.push({ id: gameId, quantity: 1 });
        localStorage.setItem("carrito", JSON.stringify(carrito));
        alert("Juego agregado al carrito.");
    }
    */
});
