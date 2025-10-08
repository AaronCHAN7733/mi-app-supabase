import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validar campos antes de enviar
      if (!email || !password) {
        throw new Error('Por favor ingresa correo y contraseña.')
      }

      console.log('Intentando iniciar sesión con:', email)

      // 1️⃣ Iniciar sesión con Supabase Auth
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) {
        console.error('Error al iniciar sesión:', loginError)
        throw new Error(loginError.message || 'Credenciales incorrectas.')
      }

      const userId = data?.user?.id
      if (!userId) throw new Error('No se pudo obtener el ID del usuario.')

      console.log('Usuario autenticado con ID:', userId)

      // 2️⃣ Consultar datos del usuario desde la tabla 'usuarios'
      const { data: userInfo, error: userError } = await supabase
        .from('usuarios')
        .select('rol, tienda_id')
        .eq('auth_id', userId)
        .single()

      if (userError) {
        console.error('Error al obtener información del usuario:', userError)
        throw new Error('No se encontró información del usuario en la base de datos.')
      }

      if (!userInfo) throw new Error('El usuario no tiene datos registrados.')

      console.log('Datos del usuario:', userInfo)

      // 3️⃣ Guardar datos en localStorage
      localStorage.setItem('rol', userInfo.rol)
      localStorage.setItem('tienda_id', userInfo.tienda_id)

      // 4️⃣ Redirigir según el rol
      switch (userInfo.rol) {
        case 'admin':
          navigate('/admin/home')
          break
        case 'cajero':
          navigate('/caja')
          break
        default:
          navigate('/home')
          break
      }
    } catch (err) {
      console.error('Error general:', err)
      setError(err.message || 'Error al iniciar sesión.')
    } finally {
      setLoading(false)
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Entrar'}
          </button>

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
