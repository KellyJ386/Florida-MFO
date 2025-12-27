import Link from 'next/link'
import { Snowflake, ClipboardList, Settings, ArrowRight, Gauge, CalendarDays } from 'lucide-react'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

export default function Home() {
  const modules = [
    {
      title: 'Ice Depth Management',
      description: 'Monitor and track ice thickness with digital measurements, visual heat maps, and instant PDF reports',
      icon: Snowflake,
      href: '/ice-depth',
      gradient: 'from-seahawks-navy to-seahawks-navy-light',
      iconBg: 'bg-white/10',
      features: ['Digital Measurements', 'Heat Map View', 'PDF Reports']
    },
    {
      title: 'Daily Reports',
      description: 'Create comprehensive shift reports with photos, custom fields, and easy calendar access',
      icon: ClipboardList,
      href: '/daily-reports',
      gradient: 'from-seahawks-green to-seahawks-green-dark',
      iconBg: 'bg-white/10',
      features: ['Photo Upload', 'Custom Forms', 'Calendar View']
    },
    {
      title: 'Employee Schedule',
      description: 'Manage staff scheduling, shift assignments, and track employee availability',
      icon: CalendarDays,
      href: '/schedule',
      gradient: 'from-purple-600 to-purple-800',
      iconBg: 'bg-white/10',
      features: ['Shift Planning', 'Swap Requests', 'Availability']
    },
    {
      title: 'Admin Control',
      description: 'Powerful admin dashboard for user management, template configuration, and system analytics',
      icon: Settings,
      href: '/admin',
      gradient: 'from-seahawks-grey-dark to-seahawks-grey',
      iconBg: 'bg-white/10',
      features: ['User Management', 'Templates', 'Analytics']
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100
                     dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full
                         bg-seahawks-navy/10 dark:bg-seahawks-green/20 border border-seahawks-navy/20
                         dark:border-seahawks-green/30">
            <Gauge className="w-4 h-4 text-seahawks-navy dark:text-seahawks-green" />
            <span className="text-sm font-semibold text-seahawks-navy dark:text-seahawks-green">
              Professional Ice Rink Management
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-seahawks-navy
                         to-seahawks-navy-light dark:from-white dark:to-seahawks-grey-light
                         bg-clip-text text-transparent">
            MAX Facility Operations
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Comprehensive ice rink management system with real-time monitoring,
            detailed reporting, and powerful administrative tools
          </p>
        </div>

        {/* Large Module Buttons */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto mb-12">
          {modules.map((module) => {
            const Icon = module.icon
            return (
              <Link
                key={module.href}
                href={module.href}
                className="group relative overflow-hidden rounded-2xl shadow-seahawks
                           hover:shadow-seahawks-lg transition-all duration-300
                           hover:scale-[1.02] active:scale-[0.98]"
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient}
                                opacity-100 dark:opacity-90 transition-opacity`} />

                {/* Content */}
                <div className="relative p-8 md:p-10 h-full flex flex-col">
                  {/* Icon */}
                  <div className={`${module.iconBg} backdrop-blur-sm rounded-2xl p-5 mb-6
                                  w-fit transition-transform group-hover:scale-110 duration-300`}>
                    <Icon className="w-10 h-10 md:w-12 md:h-12 text-white" />
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    {module.title}
                  </h2>

                  {/* Description */}
                  <p className="text-white/90 text-base md:text-lg mb-6 flex-grow">
                    {module.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {module.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-white/80">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                        <span className="text-sm font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Arrow Button */}
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <span>Open Module</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                  </div>
                </div>

                {/* Shine Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                                translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              </Link>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mb-12">
          <div className="text-center p-6 rounded-xl bg-white/60 dark:bg-slate-800/60
                         backdrop-blur-sm border border-slate-200 dark:border-slate-700">
            <div className="text-3xl font-bold text-seahawks-navy dark:text-seahawks-green mb-1">
              24/7
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Available
            </div>
          </div>
          <div className="text-center p-6 rounded-xl bg-white/60 dark:bg-slate-800/60
                         backdrop-blur-sm border border-slate-200 dark:border-slate-700">
            <div className="text-3xl font-bold text-seahawks-navy dark:text-seahawks-green mb-1">
              PWA
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Mobile Ready
            </div>
          </div>
          <div className="text-center p-6 rounded-xl bg-white/60 dark:bg-slate-800/60
                         backdrop-blur-sm border border-slate-200 dark:border-slate-700">
            <div className="text-3xl font-bold text-seahawks-navy dark:text-seahawks-green mb-1">
              Offline
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Capable
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-xl font-bold text-lg
                       bg-seahawks-green hover:bg-seahawks-green-dark text-white
                       shadow-green hover:shadow-green-lg
                       transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </main>
  )
}
