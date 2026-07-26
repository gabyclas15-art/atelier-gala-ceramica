document.addEventListener("DOMContentLoaded", () => {
    const botones = document.querySelectorAll(".btn-filtro");
    const tarjetas = document.querySelectorAll(".tarjeta-minimalista");
    const titulos = document.querySelectorAll(".titulo-coleccion");
    const buscador = document.getElementById("buscador");

    const filtrarTarjetas = () => {
        const termino = buscador.value.trim().toLowerCase();
        const filtroActivo = document.querySelector(".btn-filtro.activo");
        const filtro = filtroActivo ? filtroActivo.getAttribute("data-filtro") : "todos";
        const mostrarSoloPersonalizados = filtro === "personalizados";
        const mostrarTodos = filtro === "todos";

        tarjetas.forEach(tarjeta => {
            const categoria = tarjeta.getAttribute("data-categoria");
            const nombre = tarjeta.querySelector("h3").textContent.toLowerCase();
            const cumpleNombre = nombre.includes(termino);
            const esPersonalizado = categoria === "personalizados";
            let mostrar = false;

            if (mostrarSoloPersonalizados) {
                mostrar = esPersonalizado && cumpleNombre;
            } else if (mostrarTodos) {
                mostrar = !esPersonalizado && cumpleNombre;
            } else {
                mostrar = categoria === filtro && cumpleNombre;
            }

            tarjeta.style.display = mostrar ? "flex" : "none";
        });

        titulos.forEach(titulo => {
            const siguienteGrid = titulo.nextElementSibling;
            if (!siguienteGrid) {
                titulo.style.display = "none";
                return;
            }

            const esColeccionPersonalizados = titulo.textContent.trim() === "Colección Personalizados";
            const tarjetasVisibles = Array.from(siguienteGrid.querySelectorAll('.tarjeta-minimalista')).some(tarjeta => tarjeta.style.display !== 'none');

            if (mostrarSoloPersonalizados) {
                titulo.style.display = esColeccionPersonalizados && tarjetasVisibles ? "block" : "none";
            } else {
                titulo.style.display = esColeccionPersonalizados ? "none" : (tarjetasVisibles ? "block" : "none");
            }
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
            btn.href = `https://wa.me/51987676127?text=${encodeURIComponent(mensaje)}`;
        });
    });
});let carrito = [];
let productoModalActivo = null;

const parsePrecio = (texto) => {
    if (!texto) return 0;
    const numero = texto.replace(/[^0-9.,+-]/g, '').replace(',', '.');
    return parseFloat(numero) || 0;
};

const calcularPrecioMaterial = (precioBase, optionText) => {
    if (!optionText) return precioBase;
    const match = optionText.match(/([+-])?\s*S\/\s*([0-9.,]+)/);
    if (!match) return precioBase;
    const signo = match[1] || '';
    const valor = parseFloat(match[2].replace(',', '.')) || 0;
    if (signo === '+') return precioBase + valor;
    if (signo === '-') return Math.max(0, precioBase - valor);
    return valor;
};

const actualizarContadorCarrito = () => {
    const contador = document.getElementById('contador-carrito');
    contador.textContent = carrito.reduce((acc, item) => acc + item.cantidad, 0);
};

const mostrarToast = (texto) => {
    const toast = document.getElementById('toast');
    toast.textContent = texto;
    toast.classList.add('visible');
    clearTimeout(toast.timeoutId);
    toast.timeoutId = setTimeout(() => {
        toast.classList.remove('visible');
    }, 2200);
};

const limpiarModalProducto = () => {
    productoModalActivo = null;
    const modalCantidad = document.getElementById('modal-cantidad-input');
    if (modalCantidad) modalCantidad.value = 1;
};

const cerrarModal = (modal) => {
    if (!modal) return;
    modal.classList.remove('active');
    modal.style.display = 'none';
    if (modal.id === 'modal-producto') {
        limpiarModalProducto();
    }
};

const abrirModal = (modal) => {
    if (!modal) return;
    modal.style.display = 'flex';
    modal.classList.add('active');
};

const obtenerDatosTarjeta = (tarjeta) => {
    const titulo = tarjeta.querySelector('h3')?.textContent.trim() || 'Producto';
    const descripcion = tarjeta.querySelector('.descripcion')?.textContent.trim() || '';
    const precioTexto = tarjeta.querySelector('.precio')?.textContent.trim() || '';
    const precioBase = parsePrecio(precioTexto);
    const imagen = tarjeta.querySelector('.foto-producto')?.src || '';
    const categoria = tarjeta.querySelector('.categoria')?.textContent.trim() || '';
    const select = tarjeta.querySelector('.material-select');
    const opcionesMaterial = select ? Array.from(select.options).map(option => ({
        value: option.value,
        text: option.textContent.trim()
    })) : [];
    const material = select ? select.options[select.selectedIndex]?.textContent.trim() || 'Estándar' : 'Estándar';
    const precioFinal = select ? calcularPrecioMaterial(precioBase, material) : precioBase;

    return {
        titulo,
        descripcion,
        precioBase,
        precioUnitario: precioFinal,
        imagen,
        categoria,
        material,
        opcionesMaterial,
        cantidad: 1
    };
};

const crearBotonesHoja = () => {
    document.querySelectorAll('.detalles-producto').forEach(detalles => {
        if (detalles.querySelector('.btn-hoja-carrito')) return;
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'btn-hoja-carrito';
        boton.title = 'Agregar al carrito';
        boton.textContent = '🛒';
        const select = detalles.querySelector('.material-select');
        const precio = detalles.querySelector('.precio');
        if (select) {
            detalles.insertBefore(boton, select);
        } else if (precio) {
            detalles.insertBefore(boton, precio);
        } else {
            detalles.appendChild(boton);
        }
    });
};

const buscarItemCarrito = (titulo, material) => carrito.find(item => item.titulo === titulo && item.material === material);

const agregarAlCarrito = (producto) => {
    const itemExistente = buscarItemCarrito(producto.titulo, producto.material);
    if (itemExistente) {
        itemExistente.cantidad += producto.cantidad;
        itemExistente.subtotal = parseFloat((itemExistente.precioUnitario * itemExistente.cantidad).toFixed(2));
        itemExistente.seleccionado = true;
    } else {
        carrito.push({
            ...producto,
            subtotal: parseFloat((producto.precioUnitario * producto.cantidad).toFixed(2)),
            seleccionado: true
        });
    }
    actualizarContadorCarrito();
    mostrarToast('¡Pieza agregada al carrito!');
};

const abrirModalProducto = (producto) => {
    productoModalActivo = producto;
    document.getElementById('modal-producto-img').src = producto.imagen;
    document.getElementById('modal-producto-img').alt = producto.titulo;
    document.getElementById('modal-producto-titulo').textContent = producto.titulo;
    document.getElementById('modal-producto-categoria').textContent = producto.categoria;
    document.getElementById('modal-producto-descripcion').textContent = producto.descripcion;
    document.getElementById('modal-producto-precio').textContent = `S/ ${producto.precioUnitario.toFixed(2)}`;
    const materialSelect = document.getElementById('modal-material-select');
    materialSelect.innerHTML = '';
    if (producto.opcionesMaterial.length > 0) {
        producto.opcionesMaterial.forEach(opcion => {
            const option = document.createElement('option');
            option.value = opcion.value;
            option.textContent = opcion.text;
            materialSelect.appendChild(option);
        });
        materialSelect.disabled = false;
        materialSelect.value = producto.opcionesMaterial[0].value;
    } else {
        const option = document.createElement('option');
        option.value = 'estandar';
        option.textContent = 'Estándar';
        materialSelect.appendChild(option);
        materialSelect.disabled = true;
    }
    document.getElementById('modal-cantidad-input').value = 1;
    abrirModal(document.getElementById('modal-producto'));
};

const actualizarTotalCarrito = () => {
    const total = carrito
        .filter(item => item.seleccionado)
        .reduce((acc, item) => acc + item.subtotal, 0);
    document.getElementById('carrito-total').textContent = `S/ ${total.toFixed(2)}`;
    return total;
};

const eliminarItemCarrito = (index) => {
    carrito.splice(index, 1);
    actualizarContadorCarrito();
    renderCarrito();
};

const renderCarrito = () => {
    const carritoItems = document.getElementById('carrito-items');
    carritoItems.innerHTML = '';
    if (carrito.length === 0) {
        carritoItems.innerHTML = '<p>El carrito está vacío.</p>';
        document.getElementById('carrito-total').textContent = 'S/ 0.00';
        return;
    }
    carrito.forEach((item, index) => {
        const fila = document.createElement('div');
        fila.className = 'item-carrito-fila';
        fila.innerHTML = `
            <input type="checkbox" class="item-carrito-checkbox" ${item.seleccionado ? 'checked' : ''} />
            <img class="img-mini-carrito" src="${item.imagen}" alt="${item.titulo}" />
            <div class="item-carrito-detalles">
                <strong>${item.cantidad}x ${item.titulo}</strong>
                <div class="item-carrito-meta">${item.material ? item.material : 'Material Estándar'}</div>
                <div class="item-carrito-meta">S/ ${item.precioUnitario.toFixed(2)} c/u · Subtotal S/ ${item.subtotal.toFixed(2)}</div>
            </div>
            <button type="button" class="btn-eliminar-item" data-index="${index}">Eliminar</button>
        `;

        const checkbox = fila.querySelector('.item-carrito-checkbox');
        checkbox.addEventListener('change', (event) => {
            item.seleccionado = event.target.checked;
            actualizarTotalCarrito();
        });

        const eliminarBtn = fila.querySelector('.btn-eliminar-item');
        eliminarBtn.addEventListener('click', () => eliminarItemCarrito(index));

        carritoItems.appendChild(fila);
    });
    actualizarTotalCarrito();
};

const construirPedidoWhatsApp = () => {
    const itemsSeleccionados = carrito.filter(item => item.seleccionado);
    if (itemsSeleccionados.length === 0) {
        mostrarToast('Selecciona al menos un artículo del carrito.');
        return;
    }
    const lineas = itemsSeleccionados.map(item => {
        const materialTexto = item.material && item.material.toLowerCase() !== 'estándar' ? ` (${item.material})` : '';
        return `- ${item.cantidad}x ${item.titulo}${materialTexto} - S/ ${item.subtotal.toFixed(2)}`;
    });
    const total = itemsSeleccionados.reduce((acc, item) => acc + item.subtotal, 0).toFixed(2);
    const mensaje = `Hola Atelier Gala, quiero hacer este pedido:\n\n${lineas.join('\n')}\n\nTotal a pagar: S/ ${total}`;
    const telefono = '51987676127';
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
};

const actualizarProductoModalPrecio = () => {
    if (!productoModalActivo) return;
    const materialSelect = document.getElementById('modal-material-select');
    const seleccion = materialSelect.options[materialSelect.selectedIndex]?.textContent || productoModalActivo.material;
    const precioFinal = calcularPrecioMaterial(productoModalActivo.precioBase, seleccion);
    document.getElementById('modal-producto-precio').textContent = `S/ ${precioFinal.toFixed(2)}`;
    productoModalActivo.precioUnitario = precioFinal;
    productoModalActivo.material = seleccion;
};

const manejarClickAgregarCarrito = (event) => {
    const boton = event.currentTarget;
    if (boton.id === 'modal-agregar-carrito') {
        if (!productoModalActivo) return;
        const cantidadInput = Number(document.getElementById('modal-cantidad-input').value) || 1;
        const materialSelect = document.getElementById('modal-material-select');
        const seleccionMaterial = materialSelect.options[materialSelect.selectedIndex]?.textContent || productoModalActivo.material;
        const precioFinal = calcularPrecioMaterial(productoModalActivo.precioBase, seleccionMaterial);
        agregarAlCarrito({
            ...productoModalActivo,
            material: seleccionMaterial,
            precioUnitario: precioFinal,
            cantidad: cantidadInput,
            subtotal: parseFloat((precioFinal * cantidadInput).toFixed(2))
        });
        cerrarModal(document.getElementById('modal-producto'));
        return;
    }
    const tarjeta = boton.closest('.tarjeta-minimalista');
    if (!tarjeta) return;
    const datos = obtenerDatosTarjeta(tarjeta);
    agregarAlCarrito(datos);
};

const inicializarEventosCarrito = () => {
    crearBotonesHoja();
    document.querySelectorAll('.btn-hoja-carrito').forEach(boton => {
        boton.removeEventListener('click', manejarClickAgregarCarrito);
        boton.addEventListener('click', manejarClickAgregarCarrito);
    });

    document.querySelectorAll('.tarjeta-minimalista .foto-producto').forEach(imagen => {
        imagen.addEventListener('click', () => {
            const tarjeta = imagen.closest('.tarjeta-minimalista');
            if (!tarjeta) return;
            const datos = obtenerDatosTarjeta(tarjeta);
            abrirModalProducto(datos);
        });
    });

    document.getElementById('abrir-carrito')?.addEventListener('click', () => {
        renderCarrito();
        abrirModal(document.getElementById('modal-carrito'));
    });

    document.querySelectorAll('.modal-close-btn').forEach(boton => {
        boton.addEventListener('click', () => {
            const modal = boton.closest('.modal-overlay');
            cerrarModal(modal);
        });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                cerrarModal(overlay);
            }
        });
    });

    document.getElementById('modal-material-select')?.addEventListener('change', () => {
        actualizarProductoModalPrecio();
    });

    document.getElementById('modal-whatsapp-btn')?.addEventListener('click', () => {
        construirPedidoWhatsApp();
    });
};

window.addEventListener('DOMContentLoaded', () => {
    inicializarEventosCarrito();
});

// Protección básica contra copia: deshabilitar clic derecho y atajos de desarrollador
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'F12') {
        e.preventDefault();
    }

    if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
        e.preventDefault();
    }

    if (e.ctrlKey && e.key.toUpperCase() === 'U') {
        e.preventDefault();
    }
});
