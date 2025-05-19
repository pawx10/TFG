    async function obtenerUserData(API_BASE) {
        const token = localStorage.getItem("token");
        if (!token) return null;

        try {
            const response = await fetch(`${API_BASE}/user`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
               //     "Accept": "application/json", // 👈 Importante para evitar redirección
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                return await response.json();
            } else {
                console.warn("Token inválido, eliminándolo...");
                localStorage.removeItem("token");
                return null;
            }
        } catch (error) {
            console.error("Error al obtener los datos del usuario:", error);
            return null;
        }
    }
 
