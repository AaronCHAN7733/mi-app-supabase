import React, { useState, useEffect } from "react";
import { getProductos, crearPedido } from "../services/productosService";
import { supabase } from "../supabaseClient";
import Navbar from "../components/Navbar";
import './Pedidos.css'

export default function Pedidos() {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [tipoPedido, setTipoPedido] = useState(""); // proveedor | categoria | libre
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 Cargar productos, proveedores y categorías
  const fetchData = async () => {
    try {
      const productosData = await getProductos();
      setProductos(productosData);

      const { data: proveedoresData, error: errorProv } = await supabase
        .from("proveedores")
        .select("id, nombre");
      if (errorProv) throw errorProv;
      setProveedores(proveedoresData);

      const { data: categoriasData, error: errorCat } = await supabase
        .from("categorias")
        .select("id, nombre");
      if (errorCat) throw errorCat;
      setCategorias(categoriasData);
    } catch (error) {
      console.error("Error cargando datos:", error.message);
    }
  };

  // 🔹 Filtrar productos según tipo de pedido
  useEffect(() => {
    if (tipoPedido === "proveedor" && proveedorSeleccionado) {
      const filtrados = productos.filter(
        (p) => p.proveedor_id === proveedorSeleccionado
      );
      setProductosFiltrados(filtrados);
    } else if (tipoPedido === "categoria" && categoriaSeleccionada) {
      const filtrados = productos.filter(
        (p) => p.categoria_id === categoriaSeleccionada
      );
      setProductosFiltrados(filtrados);
    } else if (tipoPedido === "libre") {
      setProductosFiltrados([]); // libre: solo se agregan al escanear
    } else {
      setProductosFiltrados([]);
    }
  }, [tipoPedido, proveedorSeleccionado, categoriaSeleccionada, productos]);

  // 🔹 Buscar producto por código de barras (solo en modo libre)
  const handleScan = () => {
    const producto = productos.find((p) => p.codigo_barras === codigoBarras);
    if (producto) {
      agregarCantidad(producto.id, 1);
      setCodigoBarras("");
    } else {
      alert("Producto no encontrado.");
    }
  };

  // 🔹 Agregar o actualizar cantidad de producto
  const agregarCantidad = (id, cantidad) => {
    setProductosFiltrados((prev) => {
      const existe = prev.find((p) => p.id === id);
      if (existe) {
        return prev.map((p) =>
          p.id === id ? { ...p, cantidad: (p.cantidad || 0) + cantidad } : p
        );
      } else {
        const producto = productos.find((p) => p.id === id);
        return [
          ...prev,
          { ...producto, cantidad: cantidad, subtotal: cantidad * producto.precio_compra },
        ];
      }
    });
  };

  // 🔹 Cambiar cantidad manualmente en la tabla
  const cambiarCantidad = (id, nuevaCantidad) => {
    setProductosFiltrados((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              cantidad: Number(nuevaCantidad),
              subtotal: Number(nuevaCantidad) * p.precio_compra,
            }
          : p
      )
    );
  };

  // 🔹 Calcular total
  useEffect(() => {
    const nuevoTotal = productosFiltrados.reduce(
      (acc, p) => acc + (p.cantidad || 0) * p.precio_compra,
      0
    );
    setTotal(nuevoTotal);
  }, [productosFiltrados]);

  // 🔹 Guardar pedido
  const guardarPedido = async () => {
    if (productosFiltrados.length === 0) {
      alert("No hay productos en el pedido.");
      return;
    }

    try {
      await crearPedido({
        tipoPedido,
        proveedor_id: proveedorSeleccionado || null,
        categoria_id: categoriaSeleccionada || null,
        detalles: productosFiltrados.filter((p) => p.cantidad > 0),
      });

      alert("Pedido guardado correctamente ✅");
      setProductosFiltrados([]);
      setProveedorSeleccionado("");
      setCategoriaSeleccionada("");
      setTipoPedido("");
    } catch (error) {
      console.error(error);
      alert("Error al guardar el pedido.");
    }
  };

  return (
    <div className="pedidos-container">
 
      <div className="pedidos-content">
        <h2>📦 Crear Pedido</h2>

        {/* 🔹 Tipo de pedido */}
        <div className="filtros">
          <label>Tipo de pedido:</label>
          <select value={tipoPedido} onChange={(e) => setTipoPedido(e.target.value)}>
            <option value="">Selecciona una opción</option>
            <option value="proveedor">Por proveedor</option>
            <option value="categoria">Por categoría</option>
            <option value="libre">Pedido libre</option>
          </select>
        </div>

        {/* 🔹 Mostrar opciones según tipo */}
        {tipoPedido === "proveedor" && (
          <div className="proveedor-section">
            <label>Proveedor:</label>
            <select
              value={proveedorSeleccionado}
              onChange={(e) => setProveedorSeleccionado(e.target.value)}
            >
              <option value="">Selecciona un proveedor</option>
              {proveedores.map((prov) => (
                <option key={prov.id} value={prov.id}>
                  {prov.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {tipoPedido === "categoria" && (
          <div className="categoria-section">
            <label>Categoría:</label>
            <select
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {tipoPedido === "libre" && (
          <div className="scanner-section">
            <input
              type="text"
              placeholder="Escanea o ingresa código de barras"
              value={codigoBarras}
              onChange={(e) => setCodigoBarras(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
            />
            <button onClick={handleScan}>Agregar</button>
          </div>
        )}

        {/* 🔹 Mostrar tabla solo si se seleccionó algo */}
        {((tipoPedido === "proveedor" && proveedorSeleccionado) ||
          (tipoPedido === "categoria" && categoriaSeleccionada) ||
          tipoPedido === "libre") && (
          <>
            <h3>Productos</h3>
            <table className="tabla-pedidos">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Código</th>
                  <th>Stock</th>
                  <th>Precio Compra</th>
                  <th>Cantidad a pedir</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.length > 0 ? (
                  productosFiltrados.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <img
                          src={p.imagen_url || "/no-image.png"}
                          alt={p.nombre}
                          width="50"
                        />
                      </td>
                      <td>{p.nombre}</td>
                      <td>{p.codigo_barras}</td>
                      <td>{p.stock}</td>
                      <td>${p.precio_compra}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={p.cantidad || ""}
                          onChange={(e) => cambiarCantidad(p.id, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      No hay productos disponibles.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* 🔹 Total y guardar */}
            <div className="pedido-total">
              <h3>Total: ${total.toFixed(2)}</h3>
              <button className="btn-guardar" onClick={guardarPedido}>
                Guardar Pedido
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
