document.addEventListener("DOMContentLoaded", () => {
    const botones = document.querySelectorAll(".btn-filtro");
    const tarjetas = document.querySelectorAll(".tarjeta-minimalista");
    const titulos = document.querySelectorAll(".titulo-coleccion");
    const buscador = document.getElementById("buscador");

    const filtrarTarjetas = () => {
        const termino = buscador.value.trim().toLowerCase();
        const filtroActivo = document.querySelector(".btn-filtro.activo");
        const filtro = filtroActivo ? filtroActivo.getAttribute("data-filtro") : "todos";

        tarjetas.forEach(tarjeta => {
            const categoria = tarjeta.getAttribute("data-categoria");
            const nombre = tarjeta.querySelector("h3").textContent.toLowerCase();
            const cumpleNombre = nombre.includes(termino);
            const cumpleCategoria = filtro === "todos" || categoria === filtro;
            tarjeta.style.display = cumpleNombre && cumpleCategoria ? "flex" : "none";
        });

        titulos.forEach(titulo => {
            const siguienteGrid = titulo.nextElementSibling;
            if (!siguienteGrid) {
                titulo.style.display = "none";
                return;
            }
            const tarjetasVisibles = Array.from(siguienteGrid.querySelectorAll('.tarjeta-minimalista')).some(tarjeta => tarjeta.style.display !== 'none');
            titulo.style.display = tarjetasVisibles ? "block" : "none";
        });
    };

    botones.forEach(boton => {
        boton.addEventListener("click", () => {
            botones.forEach(b => b.classList.remove("activo"));
            boton.classList.add("activo");
            filtrarTarjetas();
        });
    });

    buscador.addEventListener("input", filtrarTarjetas);

    document.querySelectorAll('.material-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const tarjeta = e.target.closest('.tarjeta-minimalista');
            const btn = tarjeta.querySelector('.btn-whatsapp');
            const material = e.target.options[e.target.selectedIndex].textContent;
            const nombrePieza = tarjeta.querySelector('h3').textContent;
            const mensaje = `Hola Atelier Gala, quiero la pieza: ${nombrePieza} con material: ${material}`;
            btn.href = `https://wa.me/TU_NUMERO?text=${encodeURIComponent(mensaje)}`;
        });
    });
});