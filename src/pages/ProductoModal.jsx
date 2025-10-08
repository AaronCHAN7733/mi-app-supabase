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
  const [tiendaId, setTiendaId] = useState(null);
  const [marcaActivada, setMarcaActivada] = useState(true);
  const [segundoCodigoActivado, setSegundoCodigoActivado] = useState(true);

  // 🔹 Obtener tienda_id del usuario autenticado
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
      return usuario.tienda_id;
    } catch (error) {
      console.error("Error obteniendo tienda del usuario:", error.message);
    }
  };

  // 🔹 Cargar proveedores y categorías filtrados por tienda_id
  useEffect(() => {
    const fetchData = async () => {
      const tienda = await fetchTiendaId();
      if (!tienda) return;

      const { data: prov } = await supabase
        .from("proveedores")
        .select("*")
        .eq("tienda_id", tienda);
      setProveedores(prov || []);

      const { data: cat } = await supabase
        .from("categorias")
        .select("*")
        .eq("tienda_id", tienda);
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

      // Recalcular ganancia
      if (name === "precio_compra" || name === "precio_venta") {
        const compra = parseFloat(updated.precio_compra) || 0;
        const venta = parseFloat(updated.precio_venta) || 0;
        updated.porcentaje_ganancia =
          compra > 0 ? (((venta - compra) / compra) * 100).toFixed(2) : 0;
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tiendaId) {
      alert("Error: no se pudo obtener la tienda del usuario.");
      return;
    }

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
      tienda_id: tiendaId,
      created_at: new Date().toISOString(),
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
      alert("Error al guardar el producto: " + error.message);
    }
  };

  // 🔹 Agregar nuevo proveedor ligado a la tienda
  const addProveedor = async () => {
    if (!tiendaId) return alert("No se puede agregar proveedor sin tienda.");

    const nombre = prompt("Nombre del nuevo proveedor:");
    if (!nombre) return;

    const { data, error } = await supabase
      .from("proveedores")
      .insert([{ nombre, tienda_id: tiendaId }])
      .select();

    if (error) {
      console.error("Error agregando proveedor:", error.message);
      alert("Error: " + error.message);
      return;
    }

    setProveedores([...proveedores, ...data]);
  };

  // 🔹 Agregar nueva categoría ligada a la tienda
  const addCategoria = async () => {
    if (!tiendaId) return alert("No se puede agregar categoría sin tienda.");

    const nombre = prompt("Nombre de la nueva categoría:");
    if (!nombre) return;

    const descripcion = prompt("Descripción (opcional):") || "";

    const { data, error } = await supabase
      .from("categorias")
      .insert([
        {
          id: crypto.randomUUID(),
          nombre,
          descripcion,
          tienda_id: tiendaId,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Error insertando categoría:", error.message);
      alert("Error: " + error.message);
      return;
    }

    setCategorias([...categorias, ...data]);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          width: "500px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h3>{producto ? "Editar Producto" : "Agregar Producto"}</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
          <input type="number" name="precio_venta" placeholder="Precio Venta" value={form.precio_venta} onChange={handleChange} required />
          <input type="number" name="precio_compra" placeholder="Precio Compra" value={form.precio_compra} onChange={handleChange} required />
          <input type="number" name="stock" placeholder="Stock" value={form.stock} onChange={handleChange} />

          <input name="codigo_barras" placeholder="Código de Barras" value={form.codigo_barras} onChange={handleChange} required />

          <div>
            <label>
              <input type="checkbox" checked={segundoCodigoActivado} onChange={() => setSegundoCodigoActivado(!segundoCodigoActivado)} />
              Usar Segundo Código
            </label>
            {segundoCodigoActivado && (
              <input name="segundo_codigo" placeholder="Segundo Código" value={form.segundo_codigo} onChange={handleChange} />
            )}
          </div>

          <textarea name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} />

          <input name="unidad_medida" placeholder="Unidad de Medida" value={form.unidad_medida} onChange={handleChange} />

          <div>
            <label>Proveedor: </label>
            <select name="proveedor_id" value={form.proveedor_id || ""} onChange={handleChange}>
              <option value="">-- Selecciona --</option>
              {proveedores.map((prov) => (
                <option key={prov.id} value={prov.id}>
                  {prov.nombre}
                </option>
              ))}
            </select>
            <button type="button" onClick={addProveedor}>
              +
            </button>
          </div>

          <div>
            <label>Categoría: </label>
            <select name="categoria_id" value={form.categoria_id || ""} onChange={handleChange}>
              <option value="">-- Selecciona --</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
            <button type="button" onClick={addCategoria}>
              +
            </button>
          </div>

          <div>
            <label>
              <input type="checkbox" checked={marcaActivada} onChange={() => setMarcaActivada(!marcaActivada)} />
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
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductoModal;
