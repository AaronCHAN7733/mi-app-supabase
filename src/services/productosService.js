// src/services/productosService.js
import { supabase } from "../supabaseClient"

// Obtener productos con nombres de proveedor y categoría
export async function getProductos() {
  const { data, error } = await supabase
    .from("productos")
    .select(`
      *,
      proveedores (nombre),
      categorias (nombre)
    `)

  if (error) throw error

  // Mapear para que sea más fácil de usar en React
  return data.map((p) => ({
    ...p,
    proveedor_nombre: p.proveedores?.nombre || "",
    categoria_nombre: p.categorias?.nombre || "",
  }))
}

// Agregar producto
export async function addProducto(producto) {
  const { data, error } = await supabase.from("productos").insert([producto])
  if (error) throw error
  return data
}

// Actualizar producto
export async function updateProducto(id, producto) {
  const { data, error } = await supabase
    .from("productos")
    .update(producto)
    .eq("id", id)
  if (error) throw error
  return data
}

// Eliminar producto
export async function deleteProducto(id) {
  const { data, error } = await supabase.from("productos").delete().eq("id", id)
  if (error) throw error
  return data
}
