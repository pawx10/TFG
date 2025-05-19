document.addEventListener("DOMContentLoaded", async () => {
    console.log("cargando perfil.js");
    const API_BASE = `${window.location.origin}/api`;

    const userData = await obtenerUserData(API_BASE);
    if (userData) {
        console.log("Usuario autenticado:", userData);
        document.getElementById("profile-name").textContent = userData.name;
        document.getElementById("profile-email").textContent = userData.email;

    }
    else{
        console.warn("No hay token en localStorage, redirigiendo a login...");
       window.location.href = "login.html";
        //return;

    }

    // Configurar el botón de logout
     const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            console.log("Intentando cerrar sesión...");
            try {
                const response = await fetch(`${API_BASE}/logout`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                console.log("Código de respuesta al cerrar sesión:", response.status);

                if (!response.ok) throw new Error("Error al cerrar sesión");

                console.log("Borrando token de localStorage...");
                localStorage.removeItem("token");
                window.location.href = "login.html";
            } catch (error) {
                console.error("Error en el logout:", error);
                alert("Error al cerrar sesión");
            }
        });
    } 
});
