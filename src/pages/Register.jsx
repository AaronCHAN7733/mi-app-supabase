import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import { useNavigate } from 'react-router-dom'

function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [nombreTienda, setNombreTienda] = useState('')
  const [error, setError] = useState(null)
  const rol = 'dueño'
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)

    // 1️⃣ Crear usuario en autenticación
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    console.log('Resultado del registro en Auth:', data)

    // 2️⃣ Obtener ID del usuario autenticado
    const auth_id = data?.user?.id

    if (!auth_id) {
      setError('No se pudo obtener el ID del usuario. Revisa si la confirmación por correo está activada en Supabase.')
      return
    }

    // 3️⃣ Crear tienda única
    const tiendaId = uuidv4()

    // Crear tienda en la tabla "tiendas"
    const { error: tiendaError } = await supabase.from('tiendas').insert([
      { id: tiendaId, nombre: nombreTienda },
    ])
    if (tiendaError) {
      console.error('Error al crear tienda:', tiendaError)
      setError('No se pudo crear la tienda.')
      return
    }

    // 4️⃣ Insertar usuario con su tienda
    const { data: insertData, error: insertError } = await supabase
      .from('usuarios')
      .insert([
        {
          id: uuidv4(),
          auth_id,
          nombre,
          rol,
          tienda_id: tiendaId,
          created_at: new Date(),
        },
      ])
      .select()

    console.log('Insert result:', insertData, insertError)

    if (insertError) {
      setError(insertError.message)
    } else {
      alert('Registro exitoso. Ahora inicia sesión.')
      navigate('/login')
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 w-100 bg-light">
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <h3 className="text-center mb-4">Regístrate</h3>
        <form onSubmit={handleRegister} className="border rounded p-4 shadow-sm bg-white">

          <div className="mb-3">
            <label className="form-label">Nombre completo</label>
            <input
              type="text"
              className="form-control"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Nombre de la tienda</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej. Tienda Los Amigos"
              value={nombreTienda}
              onChange={(e) => setNombreTienda(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Correo electrónico</label>
            <input
              type="email"
              className="form-control"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">Registrarse</button>

          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </form>

        <p className="text-center mt-3">
          ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
        </p>
      </div>
    </div>
  )
}

export default Register
