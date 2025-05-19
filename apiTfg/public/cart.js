// Función para obtener el carrito desde localStorage o inicializarlo vacío
function obtenerCarrito() {
    const carrito = localStorage.getItem("carrito");
    return carrito ? JSON.parse(carrito) : [];
}

// Función para guardar el carrito en localStorage
function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

// Función para agregar un juego al carrito
function agregarAlCarrito(juego) {
    const carrito = obtenerCarrito();
    const index = carrito.findIndex(item => item.id === juego.id);
    if (index !== -1) {
        carrito[index].quantity += 1;
    } else {
        juego.quantity = 1;
        carrito.push(juego);
    }
    guardarCarrito(carrito);
    alert(`"${juego.title}" agregado al carrito.`);
}

// Función para eliminar un juego del carrito por su ID
function eliminarDelCarrito(gameId) {
    let carrito = obtenerCarrito();
    carrito = carrito.filter(item => item.id !== gameId);
    guardarCarrito(carrito);
    mostrarCarrito(); // Actualiza la vista del carrito
}

// Función para calcular el total
function calcularTotal() {
    const carrito = obtenerCarrito();
    let total = 0;
    carrito.forEach(item => {
        total += parseFloat(item.price) * item.quantity;
    });
    return total.toFixed(2);
}

// Función para mostrar el contenido del carrito en la página
function mostrarCarrito() {
    const carrito = obtenerCarrito();
    const container = document.getElementById("cart-items");
    const totalElement = document.getElementById("cart-total");
    
    if (!container || !totalElement) return;

    container.innerHTML = ""; // Limpiar contenido

    if (carrito.length === 0) {
        container.innerHTML = "<p>El carrito está vacío.</p>";
        totalElement.textContent = "0";
        return;
    }

    carrito.forEach(item => {
        const divItem = document.createElement("div");
        divItem.classList.add("cart-item");
        divItem.innerHTML = `
            <img src="${item.image_url}" alt="${item.title}" width="80">
            <div class="item-details">
                <p><strong>${item.title}</strong></p>
                <p>Precio: ${item.price}€</p>
                <p>Cantidad: <input type="number" value="${item.quantity}" min="1" onchange="actualizarCantidad(${item.id}, this.value)"></p>
                <button onclick="eliminarDelCarrito(${item.id})" class="remove-btn">Eliminar</button>
            </div>
        `;
        container.appendChild(divItem);
    });

    totalElement.textContent = calcularTotal();
}

// Función para actualizar la cantidad de un item en el carrito
function actualizarCantidad(gameId, nuevaCantidad) {
    const carrito = obtenerCarrito();
    const index = carrito.findIndex(item => item.id === gameId);
    if (index !== -1) {
        carrito[index].quantity = parseInt(nuevaCantidad, 10);
        guardarCarrito(carrito);
        mostrarCarrito(); // Actualiza la vista
    }
}

// Inicializa la vista del carrito al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    mostrarCarrito();
});
