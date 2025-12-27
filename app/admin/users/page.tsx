'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { Users, Shield, User, Home, Search, Filter, Crown, Edit, Trash2, Plus, Mail, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/lib/types/database'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'manager' | 'staff'>('all')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<Profile | null>(null)
  const [editFormData, setEditFormData] = useState({ full_name: '', role: 'staff' as 'admin' | 'manager' | 'staff' })

  const supabase = createClient()
  const { isAdmin, profile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAdmin) {
      router.push('/admin')
      return
    }
    fetchUsers()
  }, [isAdmin])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      alert('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'manager' | 'staff') => {
    setUpdating(userId)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
      alert('User role updated successfully')
    } catch (error: any) {
      console.error('Error updating role:', error)
      alert(error.message || 'Failed to update role')
    } finally {
      setUpdating(null)
    }
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return
    setUpdating(editingUser.id)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editFormData.full_name,
          role: editFormData.role
        })
        .eq('id', editingUser.id)

      if (error) throw error

      setUsers(users.map(u => u.id === editingUser.id
        ? { ...u, full_name: editFormData.full_name, role: editFormData.role }
        : u
      ))
      alert('User updated successfully')
      setShowEditModal(false)
      setEditingUser(null)
    } catch (error: any) {
      console.error('Error updating user:', error)
      alert(error.message || 'Failed to update user')
    } finally {
      setUpdating(null)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (userId === profile?.id) {
      alert('You cannot delete your own account!')
      return
    }

    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error
      setUsers(users.filter(u => u.id !== userId))
      alert('User deleted successfully')
    } catch (error: any) {
      console.error('Error deleting user:', error)
      alert(error.message || 'Failed to delete user')
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700'
      case 'manager':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700'
      case 'staff':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700'
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return Crown
      case 'manager':
        return Shield
      case 'staff':
        return User
      default:
        return User
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800
                      flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-seahawks-grey/20 border-t-seahawks-grey"></div>
          <p className="text-seahawks-navy dark:text-seahawks-grey-light font-semibold">Loading Users...</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      label: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'text-seahawks-navy dark:text-white'
    },
    {
      label: 'Administrators',
      value: users.filter(u => u.role === 'admin').length,
      icon: Crown,
      color: 'text-red-600 dark:text-red-400'
    },
    {
      label: 'Managers',
      value: users.filter(u => u.role === 'manager').length,
      icon: Shield,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      label: 'Staff',
      value: users.filter(u => u.role === 'staff').length,
      icon: User,
      color: 'text-blue-600 dark:text-blue-400'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200
                     dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Fixed Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800
                         hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="font-medium text-sm">Admin Home</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-seahawks-grey-dark to-seahawks-grey shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-seahawks-navy to-seahawks-grey-dark
                             dark:from-white dark:to-seahawks-grey-light bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg mt-1">
                Manage users, roles, and permissions
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700">
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">{stat.label}</div>
                  </div>
                  <div className="text-3xl font-bold text-seahawks-navy dark:text-white">
                    {stat.value}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-300 dark:border-slate-600
                           bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                           rounded-xl focus:ring-4 focus:ring-seahawks-green/20 focus:border-seahawks-green
                           transition-all"
              />
            </div>

            <div className="relative min-w-[200px]">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-300 dark:border-slate-600
                           bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                           rounded-xl focus:ring-4 focus:ring-seahawks-green/20 focus:border-seahawks-green
                           transition-all appearance-none"
              >
                <option value="all">All Roles</option>
                <option value="admin">Administrators</option>
                <option value="manager">Managers</option>
                <option value="staff">Staff</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div>
          {filteredUsers.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
              <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                {searchTerm || roleFilter !== 'all' ? 'No users match your filters' : 'No users found'}
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700
                           overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredUsers.map((user) => {
                      const RoleIcon = getRoleIcon(user.role)
                      const isCurrentUser = user.id === profile?.id

                      return (
                        <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-seahawks-navy to-seahawks-green
                                             flex items-center justify-center text-white font-bold">
                                {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-white">
                                  {user.full_name || 'No name'}
                                  {isCurrentUser && (
                                    <span className="ml-2 text-xs text-seahawks-green dark:text-seahawks-green-light">(You)</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getRoleColor(user.role)}`}>
                              <RoleIcon className="w-3 h-3" />
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-3">
                            <button
                              onClick={() => {
                                setEditingUser(user)
                                setEditFormData({ full_name: user.full_name || '', role: user.role })
                                setShowEditModal(true)
                              }}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={isCurrentUser}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Edit User</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.full_name}
                    onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600
                               bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                               rounded-xl focus:ring-4 focus:ring-seahawks-green/20 focus:border-seahawks-green
                               transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Role
                  </label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as any })}
                    className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600
                               bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                               rounded-xl focus:ring-4 focus:ring-seahawks-green/20 focus:border-seahawks-green
                               transition-all"
                  >
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleUpdateUser}
                    disabled={updating === editingUser.id}
                    className="flex-1 py-3 rounded-xl font-bold
                               bg-gradient-to-r from-seahawks-green to-seahawks-green-dark
                               hover:from-seahawks-green-dark hover:to-green-800
                               text-white shadow-green hover:shadow-green-lg
                               transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating === editingUser.id ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingUser(null)
                    }}
                    className="px-6 py-3 rounded-xl font-semibold
                               bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300
                               hover:bg-slate-200 dark:hover:bg-slate-600
                               transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
          <h3 className="font-bold text-lg text-blue-900 dark:text-blue-300 mb-3">Role Permissions</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-2 font-semibold text-red-800 dark:text-red-300 mb-2">
                <Crown className="w-4 h-4" />
                Administrator
              </div>
              <ul className="text-blue-800 dark:text-blue-300 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  Full system access
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  User management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  System settings
                </li>
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-2 font-semibold text-purple-800 dark:text-purple-300 mb-2">
                <Shield className="w-4 h-4" />
                Manager
              </div>
              <ul className="text-blue-800 dark:text-blue-300 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  Schedule management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  Report templates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  Team oversight
                </li>
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-2 font-semibold text-blue-800 dark:text-blue-300 mb-2">
                <User className="w-4 h-4" />
                Staff
              </div>
              <ul className="text-blue-800 dark:text-blue-300 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  View own schedule
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  Submit reports
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  Record measurements
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
