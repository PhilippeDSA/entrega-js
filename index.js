let productos = JSON.parse(localStorage.getItem("productos"));
if (!productos) {
    productos = [
        { id: 1, nombre: "Remera", precio: 1600, stock: 10, imagen: "images/remera.jpg" },
        { id: 2, nombre: "Pantalon", precio: 1600, stock: 5, imagen: "images/pantalon.png" },
        { id: 3, nombre: "Buzo", precio: 1600, stock: 3, imagen: "images/buzo.jpg" },
        { id: 4, nombre: "Sacacorcho", precio: 1600, stock: 7, imagen: "images/sacacorcho.jpg" },
    ]; localStorage.setItem("productos", JSON.stringify(productos));
};

let carrito = [];
const carritoGuardado = localStorage.getItem("carrito");
if (carritoGuardado) {
    carrito = JSON.parse(carritoGuardado);
}

const listaProductosDiv = document.getElementById("lista-de-productos");
const carritoDiv = document.getElementById("carrito");
const btnFinalizar = document.getElementById("btn-finalizar");
const btnVaciar = document.getElementById("btn-vaciar");
function mostrarProductos(lista = productos) {
    listaProductosDiv.innerHTML = "";
    lista.forEach(prod => {
        const imagen = prod.imagen || "images/placeholder.jpg";
        const prodDiv = document.createElement("div");
        prodDiv.innerHTML = `
        <img src="${prod.imagen}" alt="${prod.nombre}" style="width:100px;height:auto;">    
        <strong>${prod.nombre}</strong> - $${prod.precio} - stock: ${prod.stock}
            <button id="btn-agregar-${prod.id}"${prod.stock === 0 ? "disabled" : ""} >Agregar al carrito </button>
            `;
        listaProductosDiv.appendChild(prodDiv);
        document.getElementById(`btn-agregar-${prod.id}`).addEventListener("click", () => agregarAlCarrito(prod.id));
    });
}
function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto || producto.stock === 0) {
        swal("Error", "Producto agotado", "error");
        return;
    }
    const itemCarrito = carrito.find(item => item.id === id);
    if (itemCarrito) {
        if (itemCarrito.cantidad < producto.stock) {
            itemCarrito.cantidad++;
            Toastify({
                text: `Se agregó otra unidad de ${producto.nombre}`,
                duration: 2000,
                gravity: "top",
                position: "right",
                backgroundColor: "#4CAF50"
            }).showToast();
        } else {
            swal("Aviso", "No hay mas Stock disponible. Disculpe las Molestias", "Warning")
        }
    } else {
        carrito.push({ id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1 });
        Toastify({
            text: ` ${producto.nombre} Agregado al Carrito`,
            duration: 2000,
            gravity: "top",
            position: "right",
            backgroundColor: "#4CAF50"
        }).showToast();
    } mostrarCarrito();
    localStorage.setItem("carrito", JSON.stringify(carrito));
}
function mostrarCarrito() {
    carritoDiv.innerHTML = "";
    if (carrito.length === 0) {
        carritoDiv.innerHTML = "<p>Carrito Vacío</p>";
        return;
    }
    carrito.forEach(item => {
        const itemDiv = document.createElement("div");
        itemDiv.textContent = `${item.nombre} x ${item.cantidad}-$${item.precio * item.cantidad}`;
        carritoDiv.appendChild(itemDiv);

    }); localStorage.setItem("carrito", JSON.stringify(carrito));
    const totalDiv = document.createElement("div");
    totalDiv.innerHTML = `<strong>Total:$${totalCarrito()}</strong>`;
    carritoDiv.appendChild(totalDiv);
}
const inputBusqueda = document.getElementById("input-busqueda");
inputBusqueda.addEventListener("input", () => {
    const texto = inputBusqueda.value.toLowerCase();
    const productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(texto)
    );
    mostrarProductos(productosFiltrados);
});
const btnRestaurar = document.getElementById("btn-restaurar");
btnRestaurar.addEventListener("click", () => {
    const stockOriginal = [
        { id: 1, nombre: "Remera", precio: 1600, stock: 10, imagen: "images/remera.jpg" },
        { id: 2, nombre: "Pantalon", precio: 1600, stock: 5, imagen: "images/pantalon.png" },
        { id: 3, nombre: "Buzo", precio: 1600, stock: 3, imagen: "images/buzo.jpg" },
        { id: 4, nombre: "Sacacorcho", precio: 1600, stock: 7, imagen: "images/sacacorcho.jpg" },
    ];
    productos = [...stockOriginal];
    localStorage.setItem("productos", JSON.stringify(productos));
    carrito = [];
    localStorage.removeItem("carrito");
    mostrarCarrito();
    mostrarProductos();
    Toastify({
        text: "Stock restaurado correctamente",
        duration: 2000,
        gravity: "top",
        position: "right",
        backgroundColor: "#2196F3",
    }).showToast();
});
btnFinalizar.addEventListener("click", () => {
    if (carrito.length === 0) {
        swal("Atencion", "El carrito esta vacío", "info");
        return;
    }
    swal({
        title: "Confirmar Compra",
        text: `¿Queres finalizar la compra por un total de $${totalCarrito()}?`,
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then((confirm) => {
        if (confirm) {
            carrito.forEach(item => {
                const producto = productos.find(p => p.id === item.id);
                if (producto) producto.stock -= item.cantidad;
            });
            localStorage.setItem("productos", JSON.stringify(productos))
            swal("Gracias por tu compra", {
                icon: "success",
            });
            carrito = [];
            localStorage.removeItem("carrito");
            mostrarCarrito();
            mostrarProductos();
            mostrarFormularioCompra();
        }
    });
});

function finalizarCompra(nombre, email, direccion, metodoPago) {
    swal(`¡Gracias por tu compra,${nombre}!\n Te enviamos un correo a ${email}.\n Tu pedido llegara a: ${direccion}.\n Y su metodo de pago es: ${metodoPago}`);
    carrito = [];
    mostrarCarrito();
    mostrarProductos();
    document.getElementById("formulario-compra").innerHTML = "";
}
btnVaciar.addEventListener("click", () => {
    if (carrito.length === 0) {
        swal("info", "El carrito ya esta vacio", "info");
        return
    }
    swal({
        title: "Vaciar Carrito",
        text: "¿Queres Vaciar el carrito?",
        icon: "warning",
        dangerMode: "true",
    }).then((confirm) => {
        if (confirm) {
            carrito.forEach(item => {
                const producto = productos.find(p => p.id === item.id);
                if (producto) producto.stock += item.cantidad;
            });
            localStorage.setItem("productos", JSON.stringify(productos));
            mostrarProductos();
            carrito = [];
            localStorage.removeItem("carrito");
            mostrarCarrito();
            Toastify({
                text: "Carrito Vaciado",
                duration: 2000,
                gravity: "top",
                position: "right",
                backgroundColor: "#f44436"
            }).showToast();

        }
    });
});
function totalCarrito() {
    return carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
}
function mostrarFormularioCompra() {
    const contenedor = document.getElementById("formulario-compra");
    contenedor.innerHTML = `
        <h3> Datos del comprador</h3>
    <form id="formCompra">
        <input type="text" id="nombre" placeholder="Nombre y Apellido" value="${localStorage.getItem(" nombre") || ''}" required>
        <input type="email" id="email" placeholder="Email" value="${localStorage.getItem(" email") || ''}" required>
        <input type="text" id="direccion" placeholder="Dirección de entrega" required>
            <select id="metodoPago" required>
                <option value="">Seleccioná un método de pago</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
            </select>
            <button type="submit">Finalizar Compra</button>
    </form>`;
    const form = document.getElementById("formCompra");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const nombre = document.getElementById("nombre").value.trim();
        const email = document.getElementById("email").value.trim();
        const direccion = document.getElementById("direccion").value.trim();
        const metodoPago = document.getElementById("metodoPago").value;
        if (!nombre || !email || !direccion || !metodoPago) {
            alert("Por Favor,completá todos los campos");
            return;
        }
        localStorage.setItem("nombre", nombre);
        localStorage.setItem("email", email);
        finalizarCompra(nombre, email, direccion, metodoPago);
    })
}
mostrarProductos();
mostrarCarrito();


