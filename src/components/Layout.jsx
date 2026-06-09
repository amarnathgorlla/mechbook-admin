import { NavLink, useLocation } from 'react-router-dom'

export default function Layout({ children, onLogout }) {
  const location = useLocation()

  const navItems = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/mechanics', icon: '🔧', label: 'Mechanics' },
    { path: '/users', icon: '👥', label: 'Users' },
    { path: '/bookings', icon: '📋', label: 'Bookings' },
  ]

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">🔩</div>
          <div>
            <h1>SWARAMA</h1>
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link" onClick={onLogout}>
            <span className="icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
