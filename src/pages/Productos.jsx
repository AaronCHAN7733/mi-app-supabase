import React, { useState, useEffect } from "react";    
import { getProductos, deleteProducto } from "../services/productosService";
import ProductoModal from "./ProductoModal";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null); // para editar

  const fetchProductos = async () => {
    try {
      const data = await getProductos();
      setProductos(data);
    } catch (error) {
      console.error("Error cargando productos:", error.message);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleEdit = (producto) => {
    setSelectedProducto(producto);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que quieres eliminar este producto?")) {
      try {
        await deleteProducto(id);
        fetchProductos();
      } catch (error) {
        console.error("Error eliminando producto:", error.message);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProducto(null);
    fetchProductos();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Productos</h2>
      <button onClick={() => setShowModal(true)}>Agregar Producto</button>
      
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
          {productos.map((p) => (
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
                    style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px" }}
                  />
                ) : (
                  "No hay imagen"
                )}
              </td>
              <td>{p.porcentaje_ganancia}</td>
              <td>
                <button onClick={() => handleEdit(p)}>Editar</button>
                <button onClick={() => handleDelete(p.id)} style={{ marginLeft: "5px", color: "red" }}>
                  Borrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <ProductoModal
          producto={selectedProducto} // pasar producto seleccionado para editar
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default Productos;
