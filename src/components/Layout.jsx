import { NavLink } from 'react-router-dom'
import {
  DashboardIcon,
  WrenchIcon,
  UsersIcon,
  BookingsIcon,
  FeedbackIcon,
  LogoIcon,
  LogoutIcon
} from './Icons'

export default function Layout({ children, onLogout }) {
  const navItems = [
    { path: '/', icon: <DashboardIcon />, label: 'Dashboard' },
    { path: '/mechanics', icon: <WrenchIcon />, label: 'Mechanics' },
    { path: '/users', icon: <UsersIcon />, label: 'Users' },
    { path: '/bookings', icon: <BookingsIcon />, label: 'Bookings' },
    { path: '/feedback', icon: <FeedbackIcon />, label: 'Feedback' },
  ]

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <LogoIcon size={22} />
          </div>
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
              <span className="icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link" onClick={onLogout}>
            <span className="icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogoutIcon />
            </span>
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
