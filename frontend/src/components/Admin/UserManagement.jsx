import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import MetaData from '../Layouts/MetaData'
import { DataGrid } from '@mui/x-data-grid'
import { Button, Avatar } from '@mui/material'
import { useAuth } from '../../context/AuthContext'
import { getAllUsersApi, updateUserApi } from '../../utils/api'
import SideBar from './SideBar'
import { addDeactivatedUser, removeDeactivatedUser, DEACTIVATED_USERS } from '../../config/deactivatedUsers'

export default function UserManagement() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const auth = useAuth()
    const [error, setError] = useState(null)
    const [updatingIds, setUpdatingIds] = useState(new Set())

    useEffect(() => {
        // Wait until auth finishes loading. If user is not admin, don't call admin API.
        if (!auth.loading) {
            fetchUsers()
        }
    }, [auth.loading])

    const fetchUsers = async () => {
        try {
            setError(null)
            setLoading(true)
            const token = auth?.token
            if (!token) {
                setError('Not authenticated')
                setLoading(false)
                return
            }
            // Only admins can access this page
            if (auth?.user?.role !== 'admin') {
                setError('Access denied: admin only')
                setLoading(false)
                return
            }
            const data = await getAllUsersApi({ token })
            const fetched = data.users || []
            
            // Sync deactivated users list with database
            console.log('🔄 Syncing deactivated users list with database...')
            DEACTIVATED_USERS.length = 0 // Clear current list
            
            fetched.forEach(user => {
                if (user.isActive === false) {
                    console.log('🔒 Found deactivated user in DB:', user._id, user.name)
                    addDeactivatedUser(user._id)
                }
            })
            
            console.log('📋 Current deactivated users list:', DEACTIVATED_USERS)
            
            // Normalize to rows for DataGrid
            setUsers(fetched.map(u => ({
                id: u._id,
                name: u.name,
                email: u.email,
                role: u.role,
                isActive: typeof u.isActive === 'undefined' ? true : u.isActive,
                createdAt: u.createdAt,
                avatar: u.avatar?.url || null
            })))
            setLoading(false)
        } catch (error) {
            console.error('Error fetching users:', error)
            setError(error?.message || 'Failed to fetch users')
            setLoading(false)
        }
    }

    const updateUserRole = async (userId, newRole) => {
        try {
            const token = auth?.token
            if (!token) throw new Error('Not authenticated')
            setUpdatingIds(prev => new Set(prev).add(userId))
            await updateUserApi({ token, id: userId, role: newRole })
            // Refresh list from server to keep UI consistent
            await fetchUsers()
        } catch (error) {
            console.error('Error updating user role:', error)
            console.error('Full error details:', error)
            const errorMessage = error?.data?.message || error?.message || 'Failed to update user role'
            alert(`Error: ${errorMessage}`)
        } finally {
            setUpdatingIds(prev => {
                const s = new Set(prev)
                s.delete(userId)
                return s
            })
        }
    }

    const toggleUserStatus = async (userId) => {
        const user = users.find(u => u.id === userId)
        if (!user) {
            alert('User not found')
            return
        }

        const newStatus = !user.isActive
        console.log(`Toggling user ${userId} from ${user.isActive} to ${newStatus}`)

        // Optimistic update: update UI immediately
        setUsers(prevUsers =>
            prevUsers.map(u =>
                u.id === userId ? { ...u, isActive: newStatus } : u
            )
        )

        setUpdatingIds(prev => new Set(prev).add(userId))

        try {
            const token = auth?.token
            if (!token) throw new Error('Not authenticated')
            const response = await updateUserApi({ token, id: userId, isActive: newStatus })
            console.log('Toggle status response:', response)
            // Update the deactivated users list for frontend blocking
            if (newStatus === false) {
                console.log('🔒 Adding user to deactivated list:', userId)
                addDeactivatedUser(userId)
            } else {
                console.log('🔓 Removing user from deactivated list:', userId)
                removeDeactivatedUser(userId)
            }
            // No need to refresh since we updated optimistically
        } catch (error) {
            console.error('Error toggling user status:', error)
            // Revert optimistic update on error
            setUsers(prevUsers =>
                prevUsers.map(u =>
                    u.id === userId ? { ...u, isActive: user.isActive } : u
                )
            )
            console.error('Full error details:', error)
            const errorMessage = error?.data?.message || error?.message || 'Failed to toggle user status'
            alert(`Error: ${errorMessage}`)
        } finally {
            setUpdatingIds(prev => {
                const s = new Set(prev)
                s.delete(userId)
                return s
            })
        }
    }

    const getRoleBadge = (role) => {
        const roleColors = {
            user: 'primary',
            admin: 'danger'
        }
        return `badge bg-${roleColors[role] || 'secondary'}`
    }

    const getStatusBadge = (isVerified) => {
        return isVerified ? 'badge bg-success' : 'badge bg-warning'
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatLastLogin = (dateString) => {
        if (!dateString) return 'Never'
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now - date)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays === 0) return 'Today'
        if (diffDays === 1) return 'Yesterday'
        if (diffDays < 7) return `${diffDays} days ago`
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    return (
        <>
            <MetaData title="User Management" />

            <div className="d-flex">
                {/* Sidebar */}
                <div className="col-md-3 col-lg-2 p-0">
                    <SideBar />
                </div>

                {/* Main Content */}
                <div className="col-md-9 col-lg-10 p-0">
                    <div className="container-fluid" style={{ minHeight: '100vh', paddingTop: '2rem', paddingBottom: '2rem', backgroundColor: '#f8f9fa' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2>User Management</h2>
                            <Link to="/admin" className="btn btn-outline-secondary">
                                <i className="fa fa-arrow-left mr-2"></i>Back to Dashboard
                            </Link>
                        </div>

                        {error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : loading ? (
                            <div className="text-center">
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            <div style={{ height: 600, width: '100%' }}>
                                <DataGrid
                                    rows={users || []}
                                    disableSelectionOnClick
                                    loading={loading}
                                    columns={[
                                        {
                                            field: 'name',
                                            headerName: 'Name',
                                            flex: 1,
                                            renderCell: (params) => {
                                                const row = params?.row || {}
                                                return (
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <Avatar src={row.avatar || undefined} sx={{ width: 32, height: 32, mr: 1 }}>
                                                            {row.name ? row.name.charAt(0) : ''}
                                                        </Avatar>
                                                        <strong>{row.name || ''}</strong>
                                                    </div>
                                                )
                                            }
                                        },
                                        { field: 'email', headerName: 'Email', flex: 1.2 },
                                        { field: 'role', headerName: 'Role', width: 120 },
                                        { 
                                            field: 'isActive', 
                                            headerName: 'Status', 
                                            width: 100, 
                                            renderCell: (params) => (
                                                <span style={{ 
                                                    color: params.value ? '#2e7d32' : '#d32f2f',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {params.value ? '✓ Active' : '✗ Inactive'}
                                                </span>
                                            )
                                        },
                                        { 
                                            field: 'createdAt', 
                                            headerName: 'Joined', 
                                            width: 150, 
                                            valueGetter: (p) => {
                                                try {
                                                    const row = p && p.row ? p.row : {}
                                                    const dateVal = row.createdAt || p?.value
                                                    if (!dateVal) return ''
                                                    const d = new Date(dateVal)
                                                    if (isNaN(d.getTime())) return ''
                                                    return d.toLocaleDateString()
                                                } catch (e) {
                                                    return ''
                                                }
                                            }
                                        },
                                        {
                                            field: 'actions',
                                            headerName: 'Actions',
                                            width: 240,
                                            sortable: false,
                                            renderCell: (params) => {
                                                const row = params?.row || {}
                                                return (
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        {row.role === 'user' ? (
                                                            <Button size="small" variant="contained" onClick={() => updateUserRole(row.id, 'admin')} disabled={updatingIds.has(row.id)}>
                                                                {updatingIds.has(row.id) ? 'Updating…' : 'Make Admin'}
                                                            </Button>
                                                        ) : (
                                                            <Button size="small" variant="outlined" onClick={() => updateUserRole(row.id, 'user')} disabled={updatingIds.has(row.id)}>
                                                                {updatingIds.has(row.id) ? 'Updating…' : 'Make User'}
                                                            </Button>
                                                        )}
                                                        <Button 
                                                            size="small" 
                                                            color={row.isActive ? 'error' : 'success'}
                                                            variant="contained" 
                                                            onClick={() => toggleUserStatus(row.id)} 
                                                            disabled={updatingIds.has(row.id)}
                                                            sx={{ minWidth: '90px' }}
                                                        >
                                                            {updatingIds.has(row.id) ? 'Updating…' : (row.isActive ? 'Deactivate' : 'Activate')}
                                                        </Button>
                                                    </div>
                                                )
                                            }
                                        }
                                    ]}
                                />
                            </div>
                        )}

                        <div className="mt-4">
                            <div className="row">
                                <div className="col-md-3">
                                    <div className="card text-center">
                                        <div className="card-body">
                                            <h5 className="card-title">{users.length}</h5>
                                            <p className="card-text text-muted">Total Users</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card text-center">
                                        <div className="card-body">
                                            <h5 className="card-title">{users.filter(u => u.role === 'admin').length}</h5>
                                            <p className="card-text text-muted">Admins</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card text-center">
                                        <div className="card-body">
                                            <h5 className="card-title">{users.filter(u => u.isVerified).length}</h5>
                                            <p className="card-text text-muted">Verified Users</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card text-center">
                                        <div className="card-body">
                                            <h5 className="card-title">{users.filter(u => !u.isVerified).length}</h5>
                                            <p className="card-text text-muted">Pending Verification</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}