'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { Settings, FileText, Snowflake, Users, BarChart, Home, Shield, TrendingUp, Activity, ArrowRight, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

export default function AdminPage() {
  const { profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!profile || (profile.role !== 'admin' && profile.role !== 'manager'))) {
      router.push('/')
    }
  }, [profile, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800
                      flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-seahawks-green/20 border-t-seahawks-green"></div>
          <p className="text-seahawks-navy dark:text-seahawks-green font-semibold">Loading Admin Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!profile || (profile.role !== 'admin' && profile.role !== 'manager')) {
    return null
  }

  const stats = [
    { label: 'Active Users', value: '12', icon: Users, color: 'text-seahawks-green' },
    { label: 'Templates', value: '8', icon: FileText, color: 'text-seahawks-navy dark:text-white' },
    { label: 'Reports Today', value: '24', icon: Activity, color: 'text-seahawks-green' },
    { label: 'System Status', value: 'Excellent', icon: Zap, color: 'text-seahawks-navy dark:text-white' },
  ]

  const adminCards = [
    {
      title: 'Ice Depth Templates',
      description: 'Create and manage custom rink diagrams with measurement points and heat map configurations',
      icon: Snowflake,
      href: '/ice-depth/templates',
      gradient: 'from-blue-500 to-blue-600',
      darkGradient: 'dark:from-blue-600 dark:to-blue-700',
      iconBg: 'bg-blue-50 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      badge: 'Templates',
    },
    {
      title: 'Report Templates',
      description: 'Configure customizable daily report forms with tabs, fields, and validation rules',
      icon: FileText,
      href: '/admin/templates/daily-reports',
      gradient: 'from-seahawks-green to-seahawks-green-dark',
      darkGradient: 'dark:from-seahawks-green-dark dark:to-green-800',
      iconBg: 'bg-green-50 dark:bg-green-900/30',
      iconColor: 'text-seahawks-green dark:text-seahawks-green-light',
      badge: 'Forms',
    },
    {
      title: 'User Management',
      description: 'Manage user accounts, assign roles, control permissions, and monitor staff activity',
      icon: Users,
      href: '/admin/users',
      gradient: 'from-seahawks-navy to-seahawks-navy-light',
      darkGradient: 'dark:from-seahawks-navy-light dark:to-blue-900',
      iconBg: 'bg-purple-50 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      badge: 'Admin Only',
      adminOnly: true,
    },
    {
      title: 'Analytics Dashboard',
      description: 'View comprehensive system statistics, usage trends, and performance metrics',
      icon: BarChart,
      href: '/admin/analytics',
      gradient: 'from-orange-500 to-orange-600',
      darkGradient: 'dark:from-orange-600 dark:to-orange-700',
      iconBg: 'bg-orange-50 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      badge: 'Insights',
    },
    {
      title: 'System Settings',
      description: 'Configure application preferences, security settings, and system-wide defaults',
      icon: Settings,
      href: '/admin/settings',
      gradient: 'from-seahawks-grey-dark to-seahawks-grey',
      darkGradient: 'dark:from-slate-600 dark:to-slate-500',
      iconBg: 'bg-slate-50 dark:bg-slate-800/30',
      iconColor: 'text-slate-600 dark:text-slate-400',
      badge: 'Admin Only',
      adminOnly: true,
    },
  ]

  const filteredCards = adminCards.filter(card => !card.adminOnly || profile.role === 'admin')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100
                     dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Fixed Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800
                           hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="font-medium text-sm">Home</span>
              </Link>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-seahawks-navy/5 dark:bg-seahawks-green/10">
                <Shield className="w-4 h-4 text-seahawks-navy dark:text-seahawks-green" />
                <span className="font-semibold text-sm text-seahawks-navy dark:text-seahawks-green capitalize">
                  {profile.role}
                </span>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-seahawks-navy to-seahawks-navy-light
                           dark:from-seahawks-green dark:to-seahawks-green-dark shadow-seahawks">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-seahawks-navy to-seahawks-navy-light
                             dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Admin Control Center
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg mt-1">
                Manage system settings, templates, and user access
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200
                           dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {stat.label}
                </div>
              </div>
            )
          })}
        </div>

        {/* Admin Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl
                           border border-slate-200 dark:border-slate-700
                           shadow-lg hover:shadow-2xl transition-all duration-300
                           hover:scale-[1.02] active:scale-[0.98]"
              >
                {/* Card Content */}
                <div className="p-8">
                  {/* Icon & Badge */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={`${card.iconBg} rounded-2xl p-4 transition-transform
                                    group-hover:scale-110 duration-300`}>
                      <Icon className={`w-8 h-8 ${card.iconColor}`} />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700
                                   text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {card.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 dark:text-slate-400 mb-6 line-clamp-2">
                    {card.description}
                  </p>

                  {/* Action */}
                  <div className="flex items-center gap-2 text-seahawks-navy dark:text-seahawks-green font-semibold">
                    <span>Manage</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                  </div>
                </div>

                {/* Gradient Border on Hover */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}
                                ${card.darkGradient} transform scale-x-0 group-hover:scale-x-100
                                transition-transform duration-300`} />
              </Link>
            )
          })}
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-seahawks-navy to-seahawks-navy-light
                       dark:from-seahawks-green dark:to-seahawks-green-dark">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-white">
              <h3 className="text-xl font-bold mb-1">Need Help?</h3>
              <p className="text-white/80">Check the documentation or contact support</p>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm
                               rounded-lg text-white font-semibold transition-all">
                Documentation
              </button>
              <button className="px-6 py-3 bg-white text-seahawks-navy dark:text-seahawks-green
                               hover:bg-white/90 rounded-lg font-semibold transition-all">
                Get Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
