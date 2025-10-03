import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      navigate('/home')
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 w-100 bg-light">
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <h3 className="text-center mb-4">Iniciar sesión</h3>
        <form onSubmit={handleLogin} className="border rounded p-4 shadow-sm bg-white">
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

          <button type="submit" className="btn btn-primary w-100">Entrar</button>

          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </form>

        <p className="text-center mt-3">
          ¿No tienes cuenta? <a href="/register">Regístrate</a>
        </p>
      </div>
    </div>
  )
}

export default Login
