document.addEventListener("DOMContentLoaded", () => {
    const botones = document.querySelectorAll(".btn-filtro");
    const tarjetas = document.querySelectorAll(".tarjeta-minimalista");
    const titulos = document.querySelectorAll(".titulo-coleccion");

    botones.forEach(boton => {
        boton.addEventListener("click", () => {
            // 1. Manejo de botones
            botones.forEach(b => b.classList.remove("activo"));
            boton.classList.add("activo");
            const filtro = boton.getAttribute("data-filtro");

            // 2. Filtrar tarjetas
            tarjetas.forEach(tarjeta => {
                const categoria = tarjeta.getAttribute("data-categoria");
                if (filtro === "todos" || categoria === filtro) {
                    tarjeta.style.display = "flex";
                } else {
                    tarjeta.style.display = "none";
                }
            });

            // 3. Filtrar títulos (Lógica mejorada)
            titulos.forEach(titulo => {
                const siguienteGrid = titulo.nextElementSibling;
                const esLlavero = siguienteGrid.querySelector('.tarjeta-minimalista[data-categoria="llaveros"]');
                
                if (filtro === "todos") {
                    titulo.style.display = "block";
                } else if (filtro === "llaveros") {
                    // Si el filtro es llaveros, solo muestra los títulos que tienen llaveros
                    titulo.style.display = esLlavero ? "block" : "none";
                } else if (filtro === "aretes") {
                    // Si el filtro es aretes, esconde los títulos que son puramente de llaveros
                    titulo.style.display = esLlavero ? "none" : "block";
                }
            });
        });
    });
});