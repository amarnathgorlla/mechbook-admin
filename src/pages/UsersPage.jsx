import { useState, useEffect } from 'react'
import { adminAPI } from '../services/api'
import { UsersIcon } from '../components/Icons'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchTimeout, setSearchTimeout] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async (query = '') => {
    setLoading(true)
    try {
      const data = await adminAPI.getUsers(query)
      setUsers(data.users || [])
    } catch (err) {
      console.error('Failed to load users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value) => {
    setSearch(value)
    if (searchTimeout) clearTimeout(searchTimeout)
    const timeout = setTimeout(() => {
      loadUsers(value)
    }, 400)
    setSearchTimeout(timeout)
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const closeDetail = () => setSelectedUser(null);

  return (
    <div>
      <div className="page-header">
        <h2>Users</h2>
        <p>All registered users on the platform</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h3>All Users ({users.length})</h3>
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : users.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Vehicle</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="cell-main">{u.name}</td>
                  <td>{u.phone}</td>
                  <td>
                    <div className="cell-main" style={{ textTransform: 'capitalize' }}>{u.vehicle_type}</div>
                    <div className="cell-sub">{u.vehicle_number}</div>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    {formatDate(u.created_at)}
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => setSelectedUser(u)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--color-text-tertiary)' }}>
              <UsersIcon size={36} />
            </div>
            <p>{search ? `No users found for "${search}"` : 'No users registered yet'}</p>
          </div>
        )}
      </div>

      {selectedUser && (
        <>
          <div className="side-panel-overlay" onClick={closeDetail} />
          <div className="side-panel">
            <div className="side-panel-header">
              <h3>User Details</h3>
              <button className="side-panel-close" onClick={closeDetail}>✕</button>
            </div>
            <div className="side-panel-body">
              <div className="detail-section">
                <h4>Identity</h4>
                <div className="detail-row">
                  <span className="label">Name</span>
                  <span className="value">{selectedUser.name}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Phone</span>
                  <span className="value">{selectedUser.phone}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Vehicle</h4>
                <div className="detail-row">
                  <span className="label">Type</span>
                  <span className="value" style={{ textTransform: 'capitalize' }}>{selectedUser.vehicle_type}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Number</span>
                  <span className="value">{selectedUser.vehicle_number}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Activity</h4>
                <div className="detail-row">
                  <span className="label">Registered On</span>
                  <span className="value">{formatDate(selectedUser.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
