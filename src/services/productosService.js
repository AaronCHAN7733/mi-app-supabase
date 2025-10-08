import { supabase } from "../supabaseClient";

/* -------------------------------------------------------------------------- */
/*                             🔹 FUNCIONES DE PRODUCTOS                       */
/* -------------------------------------------------------------------------- */

// Obtener productos con nombres de proveedor y categoría
export async function getProductos() {
  const { data, error } = await supabase
    .from("productos")
    .select(`
      *,
      proveedores (nombre),
      categorias (nombre)
    `);

  if (error) throw error;

  return data.map((p) => ({
    ...p,
    proveedor_nombre: p.proveedores?.nombre || "",
    categoria_nombre: p.categorias?.nombre || "",
  }));
}

// Agregar producto
export async function addProducto(producto) {
  const { data, error } = await supabase.from("productos").insert([producto]).select();
  if (error) throw error;
  return data;
}

// Actualizar producto
export async function updateProducto(id, producto) {
  const { data, error } = await supabase
    .from("productos")
    .update(producto)
    .eq("id", id)
    .select();
  if (error) throw error;
  return data;
}

// Eliminar producto
export async function deleteProducto(id) {
  const { data, error } = await supabase.from("productos").delete().eq("id", id);
  if (error) throw error;
  return data;
}

/* -------------------------------------------------------------------------- */
/*                               🔹 FUNCIONES DE PEDIDOS                       */
/* -------------------------------------------------------------------------- */

// Obtener pedidos (con proveedor)
export async function getPedidos() {
  const { data, error } = await supabase
    .from("pedidos")
    .select(`
      *,
      proveedores (nombre)
    `)
    .order("fecha", { ascending: false });

  if (error) throw error;

  return data.map((p) => ({
    ...p,
    proveedor_nombre: p.proveedores?.nombre || "Sin proveedor",
  }));
}

// Crear pedido con sus detalles
export async function crearPedido({ tipoPedido, proveedor_id, categoria_id, detalles }) {
  try {
    if (!detalles || detalles.length === 0) {
      throw new Error("No hay productos en el pedido.");
    }

    const total = detalles.reduce(
      (sum, item) => sum + (item.subtotal || item.cantidad * item.precio_compra),
      0
    );

    // Insertar pedido principal
    const { data: pedido, error: pedidoError } = await supabase
      .from("pedidos")
      .insert([
        {
          tipo_pedido: tipoPedido || null,
          proveedor_id: proveedor_id || null,
          categoria_id: categoria_id || null,
          fecha: new Date().toISOString(),
          total,
        },
      ])
      .select()
      .single();

    if (pedidoError) throw pedidoError;

    // Insertar detalles
    const detallesData = detalles.map((item) => ({
      pedido_id: pedido.id,
      producto_id: item.id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_compra, // 👈 corregido
      subtotal: item.subtotal || item.cantidad * item.precio_compra,
    }));

    const { error: detalleError } = await supabase
      .from("detalle_pedidos")
      .insert(detallesData);

    if (detalleError) throw detalleError;

    console.log("✅ Pedido creado correctamente:", pedido);
    return pedido;
  } catch (error) {
    console.error("❌ Error al crear pedido:", error.message);
    throw error;
  }
}
