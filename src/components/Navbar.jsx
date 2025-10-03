// components/Navbar.jsx
import { Nav } from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'
import {
  FaUser,
  FaBox,
  FaBoxOpen,
  FaPlusSquare,
  FaClipboardList,
} from 'react-icons/fa'

export default function Navbar() {
  const location = useLocation()
  const links = [
    { to: '/home',       icon: <FaUser size={28} />,      label: 'Usuarios' },
    { to: '/productos',  icon: <FaBox size={28} />,       label: 'Productos' }, // 👈 ya apunta a productos
    { to: '/inventario', icon: <FaBoxOpen size={28} />,   label: 'Inventario' },
    { to: '/entrada',    icon: <FaPlusSquare size={28} />,label: 'Entrada' },
    { to: '/pedidos',    icon: <FaClipboardList size={28} />, label: 'Pedidos' },
  ]

  return (
    <Nav
      className="flex-column bg-primary text-white vh-100 p-3"
      style={{ width: '100px' }}
    >
      <div className="mb-5 text-center">
        <span className="h5">CobriXS</span>
      </div>
      {links.map(({ to, icon, label }) => (
        <Nav.Link
          as={Link}
          to={to}
          key={to}
          className={`d-flex flex-column align-items-center mb-4 text-white ${
            location.pathname === to ? 'opacity-100' : 'opacity-75'
          }`}
        >
          {icon}
          <small className="mt-1" style={{ fontSize: '0.75rem' }}>
            {label}
          </small>
        </Nav.Link>
      ))}
    </Nav>
  )
}
