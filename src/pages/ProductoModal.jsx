import React, { useState, useEffect } from "react";   
import { addProducto, updateProducto } from "../services/productosService";
import { supabase } from "../supabaseClient";

function ProductoModal({ onClose, producto }) {
  const [form, setForm] = useState({
    nombre: "",
    precio_venta: "",
    precio_compra: "",
    stock: 0,
    proveedor_id: "",
    codigo_barras: "",
    segundo_codigo: "",
    descripcion: "",
    unidad_medida: "",
    categoria_id: "",
    marca: "",
    ubicacion: "",
    imagen_url: "",
    porcentaje_ganancia: "",
  });

  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [marcaActivada, setMarcaActivada] = useState(true);
  const [segundoCodigoActivado, setSegundoCodigoActivado] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: prov } = await supabase.from("proveedores").select("*");
      setProveedores(prov || []);

      const { data: cat } = await supabase.from("categorias").select("*");
      setCategorias(cat || []);

      if (producto) {
        setForm({ ...producto });
        setMarcaActivada(!!producto.marca);
        setSegundoCodigoActivado(!!producto.segundo_codigo);
      }
    };
    fetchData();
  }, [producto]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      // Recalcular porcentaje de ganancia si cambian los precios
      if (name === "precio_compra" || name === "precio_venta") {
        const precioCompra = parseFloat(updated.precio_compra) || 0;
        const precioVenta = parseFloat(updated.precio_venta) || 0;
        updated.porcentaje_ganancia =
          precioCompra > 0
            ? (((precioVenta - precioCompra) / precioCompra) * 100).toFixed(2)
            : 0;
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productoData = {
      nombre: form.nombre,
      precio_venta: form.precio_venta,
      precio_compra: form.precio_compra,
      stock: form.stock,
      proveedor_id: form.proveedor_id || null,
      categoria_id: form.categoria_id || null,
      codigo_barras: form.codigo_barras,
      segundo_codigo: segundoCodigoActivado ? form.segundo_codigo : null,
      descripcion: form.descripcion,
      unidad_medida: form.unidad_medida,
      marca: marcaActivada ? form.marca : null,
      ubicacion: form.ubicacion,
      imagen_url: form.imagen_url,
      porcentaje_ganancia: form.porcentaje_ganancia,
    };

    try {
      if (producto) {
        await updateProducto(producto.id, productoData);
      } else {
        await addProducto(productoData);
      }
      onClose();
    } catch (error) {
      console.error("Error guardando producto:", error.message);
    }
  };

  const addProveedor = async () => {
    const nombre = prompt("Nombre del nuevo proveedor:");
    if (nombre) {
      const { data, error } = await supabase
        .from("proveedores")
        .insert([{ nombre }])
        .select();
      if (!error) setProveedores([...proveedores, ...data]);
    }
  };

  const addCategoria = async () => {
    const nombre = prompt("Nombre de la nueva categoría:");
    if (!nombre) return;

    const descripcion = prompt("Descripción de la categoría (opcional):") || "";

    const { data, error } = await supabase
      .from("categorias")
      .insert([{
        id: crypto.randomUUID(),
        nombre,
        descripcion,
        created_at: new Date().toISOString(),
      }])
      .select();

    if (error) {
      console.error("Error insertando categoría:", error);
      alert("Error: " + error.message);
      return;
    }

    if (data) setCategorias([...categorias, ...data]);
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.5)", display: "flex",
      justifyContent: "center", alignItems: "center"
    }}>
      <div style={{ background: "white", padding: "20px", borderRadius: "8px", width: "500px", maxHeight: "90vh", overflowY: "auto" }}>
        <h3>{producto ? "Editar Producto" : "Agregar Producto"}</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          
          <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
          <input type="number" name="precio_venta" placeholder="Precio Venta" value={form.precio_venta} onChange={handleChange} required />
          <input type="number" name="precio_compra" placeholder="Precio Compra" value={form.precio_compra} onChange={handleChange} required />
          <input type="number" name="stock" placeholder="Stock" value={form.stock} onChange={handleChange} />

          <input name="codigo_barras" placeholder="Código de Barras" value={form.codigo_barras} onChange={handleChange} required />
          
          <div>
            <label>
              <input
                type="checkbox"
                checked={segundoCodigoActivado}
                onChange={() => setSegundoCodigoActivado(!segundoCodigoActivado)}
              />
              Usar Segundo Código
            </label>
            {segundoCodigoActivado && (
              <input
                name="segundo_codigo"
                placeholder="Segundo Código"
                value={form.segundo_codigo}
                onChange={handleChange}
              />
            )}
          </div>

          <textarea name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} />

          <input name="unidad_medida" placeholder="Unidad de Medida" value={form.unidad_medida} onChange={handleChange} />

          <div>
            <label>Proveedor: </label>
            <select name="proveedor_id" value={form.proveedor_id || ""} onChange={handleChange}>
              <option value="">-- Selecciona --</option>
              {proveedores.map((prov) => (
                <option key={prov.id} value={prov.id}>{prov.nombre}</option>
              ))}
            </select>
            <button type="button" onClick={addProveedor}>+</button>
          </div>

          <div>
            <label>Categoría: </label>
            <select name="categoria_id" value={form.categoria_id || ""} onChange={handleChange}>
              <option value="">-- Selecciona --</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
            <button type="button" onClick={addCategoria}>+</button>
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                checked={marcaActivada}
                onChange={() => setMarcaActivada(!marcaActivada)}
              />
              Usar Marca
            </label>
            {marcaActivada && (
              <input name="marca" placeholder="Marca" value={form.marca} onChange={handleChange} />
            )}
          </div>

          <input name="ubicacion" placeholder="Ubicación" value={form.ubicacion} onChange={handleChange} />
          <input name="imagen_url" placeholder="Imagen URL" value={form.imagen_url} onChange={handleChange} />

          <input type="number" step="0.01" name="porcentaje_ganancia" placeholder="Porcentaje Ganancia" value={form.porcentaje_ganancia} readOnly />

          <div style={{ marginTop: "10px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button type="submit">Guardar</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductoModal;
