import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { deleteProducto } from "../services/productosService";
import ProductoModal from "./ProductoModal";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [search, setSearch] = useState("");
  const [tiendaId, setTiendaId] = useState(null);

  // 🔹 1. Obtener la tienda_id del usuario autenticado
  const fetchTiendaId = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        console.error("Error obteniendo usuario:", userError?.message);
        return;
      }

      const authId = userData.user.id;
      const { data: usuario, error: usuarioError } = await supabase
        .from("usuarios")
        .select("tienda_id")
        .eq("auth_id", authId)
        .single();

      if (usuarioError) throw usuarioError;
      setTiendaId(usuario.tienda_id);
    } catch (error) {
      console.error("Error obteniendo tienda del usuario:", error.message);
    }
  };

  // 🔹 2. Obtener productos con nombres de proveedor y categoría
  const fetchProductos = async (tienda_id) => {
    try {
      const { data, error } = await supabase
        .from("productos")
        .select(`
          *,
          proveedores:proveedor_id ( nombre ),
          categorias:categoria_id ( nombre )
        `)
        .eq("tienda_id", tienda_id);

      if (error) throw error;

      // 🔸 Mapear los nombres
      const productosConNombres = data.map((p) => ({
        ...p,
        proveedor_nombre: p.proveedores?.nombre || "Sin proveedor",
        categoria_nombre: p.categorias?.nombre || "Sin categoría",
      }));

      setProductos(productosConNombres);
      setFilteredProductos(productosConNombres);
    } catch (error) {
      console.error("Error cargando productos:", error.message);
    }
  };

  // 🔹 3. Cargar productos cuando haya tiendaId
  useEffect(() => {
    if (tiendaId) fetchProductos(tiendaId);
  }, [tiendaId]);

  // 🔹 4. Obtener tienda al iniciar
  useEffect(() => {
    fetchTiendaId();
  }, []);

  // 🔹 5. Filtrar productos
  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    setFilteredProductos(
      productos.filter(
        (p) =>
          p.nombre?.toLowerCase().includes(lowerSearch) ||
          p.proveedor_nombre?.toLowerCase().includes(lowerSearch) ||
          p.categoria_nombre?.toLowerCase().includes(lowerSearch)
      )
    );
  }, [search, productos]);

  // 🔹 6. Acciones
  const handleEdit = (producto) => {
    setSelectedProducto(producto);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que quieres eliminar este producto?")) {
      try {
        await deleteProducto(id);
        fetchProductos(tiendaId);
      } catch (error) {
        console.error("Error eliminando producto:", error.message);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProducto(null);
    fetchProductos(tiendaId);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Productos</h2>
      <div style={{ marginBottom: "10px", display: "flex", gap: "10px" }}>
        <button onClick={() => setShowModal(true)}>Agregar Producto</button>
        <input
          type="text"
          placeholder="Buscar por nombre, proveedor o categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: "5px" }}
        />
      </div>

      <table border="1" cellPadding="8" style={{ width: "100%", marginTop: "10px" }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Precio Venta</th>
            <th>Precio Compra</th>
            <th>Stock</th>
            <th>Código Barras</th>
            <th>Segundo Código</th>
            <th>Descripción</th>
            <th>Unidad Medida</th>
            <th>Proveedor</th>
            <th>Categoría</th>
            <th>Marca</th>
            <th>Ubicación</th>
            <th>Imagen</th>
            <th>% Ganancia</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredProductos.map((p) => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.precio_venta}</td>
              <td>{p.precio_compra}</td>
              <td>{p.stock}</td>
              <td>{p.codigo_barras}</td>
              <td>{p.segundo_codigo}</td>
              <td>{p.descripcion}</td>
              <td>{p.unidad_medida}</td>
              <td>{p.proveedor_nombre}</td>
              <td>{p.categoria_nombre}</td>
              <td>{p.marca}</td>
              <td>{p.ubicacion}</td>
              <td>
                {p.imagen_url ? (
                  <img
                    src={p.imagen_url}
                    alt={p.nombre}
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                ) : (
                  "No hay imagen"
                )}
              </td>
              <td>{p.porcentaje_ganancia}</td>
              <td>
                <button onClick={() => handleEdit(p)}>Editar</button>
                <button
                  onClick={() => handleDelete(p.id)}
                  style={{ marginLeft: "5px", color: "red" }}
                >
                  Borrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <ProductoModal producto={selectedProducto} onClose={handleCloseModal} />
      )}
    </div>
  );
}

export default Productos;
