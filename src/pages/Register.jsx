import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import { useNavigate } from 'react-router-dom'

function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState(null)
  const rol = 'dueño' // 👈 rol fijo
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      return
    }

    const auth_id = data.user?.id
    if (!auth_id) {
      setError('Error al obtener ID del usuario.')
      return
    }

    const { error: insertError } = await supabase.from('usuarios').insert({
      id: uuidv4(),
      auth_id,
      nombre,
      rol,
      created_at: new Date(),
    })

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
      <h3 className="text-center mb-4">Registrate</h3>
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
