document.addEventListener("DOMContentLoaded", () => {
    const botonesFiltro = document.querySelectorAll(".btn-filtro");
    const tarjetasProductos = document.querySelectorAll(".tarjeta-minimalista");

    botonesFiltro.forEach(boton => {
        boton.addEventListener("click", () => {
            // 1. Cambiar el botón activo visualmente
            botonesFiltro.forEach(b => b.classList.remove("activo"));
            boton.classList.add("activo");

            // 2. Filtrar los productos
            const filtroSeleccionado = boton.getAttribute("data-filtro");

            tarjetasProductos.forEach(tarjeta => {
                const categoriaTarjeta = tarjeta.getAttribute("data-categoria");

                if (filtroSeleccionado === "todos" || categoriaTarjeta === filtroSeleccionado) {
                    tarjeta.classList.remove("oculto");
                } else {
                    tarjeta.classList.add("oculto");
                }
            });
        });
    });
});