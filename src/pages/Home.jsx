import { useState } from 'react'
import Navbar from '../components/Navbar'
import NumericPad from '../components/NumericPad'
import './Home.css'

export default function Home() {
  const [cantidad, setCantidad] = useState(1)
  const [codigo, setCodigo] = useState('')
  const [preview, setPreview] = useState('Vista previa del producto')
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [pago, setPago] = useState('')

  const ultimoTicket = 15465845
  const usuario = 'AaronChan'

  const handleSearch = () => {
    const precio = 25
    setRows([{ cantidad, codigo, descripcion: preview, precio, subtotal: precio * cantidad }])
    setTotal(precio * cantidad)
  }

  const handlePad = (val) => {
    if (val === 'del') setPago(pago.slice(0, -1))
    else setPago(pago + val)
  }

  const cambio = pago ? (Number(pago) - total).toFixed(2) : '0.00'

  return (
    <div className="pos-container">
      <Navbar />

      <div className="pos-main">
        {/* Encabezado */}
        <header className="pos-header">
          <div className="ticket-info">Último ticket: <strong>{ultimoTicket}</strong></div>
          <div className="user-info">👤 {usuario}</div>
        </header>

        {/* Búsqueda */}
        <section className="pos-inputs">
          <input
            type="number"
            className="pos-input cantidad"
            value={cantidad}
            onChange={e => setCantidad(Number(e.target.value))}
            placeholder="Cantidad"
          />
          <input
            type="text"
            className="pos-input codigo"
            value={codigo}
            onChange={e => setCodigo(e.target.value)}
            placeholder="Código de barras"
          />
          <button className="btn-search" onClick={handleSearch}>Buscar</button>
        </section>

        {/* Vista previa */}
        <section className="pos-preview">
          <div className="preview-text">
            <label>Vista previa</label>
            <input type="text" value={preview} readOnly />
          </div>
          <div className="preview-img">
            <div className="placeholder-img">📦</div>
          </div>
        </section>

        {/* Tabla */}
        <section className="pos-table">
          <table>
            <thead>
              <tr>
                <th>Cant.</th>
                <th>Código</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Importe</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.cantidad}</td>
                  <td>{r.codigo}</td>
                  <td>{r.descripcion}</td>
                  <td>${r.precio.toFixed(2)}</td>
                  <td>${r.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Teclado numérico */}
        <NumericPad onPress={handlePad} />

        {/* Resumen */}
        <aside className="pos-summary">
          <div className="summary-card">
            <div className="summary-item total">
              <span>TOTAL</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
            <div className="summary-item">
              <span>PAGO</span>
              <strong>${pago || '0.00'}</strong>
            </div>
            <div className="summary-item cambio">
              <span>CAMBIO</span>
              <strong>${cambio}</strong>
            </div>
            <button className="btn-charge">💳 COBRAR</button>
          </div>
        </aside>
      </div>
    </div>
  )
}
