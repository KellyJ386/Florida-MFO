import Link from 'next/link'
import { Snowflake, ClipboardList, Settings } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            MAX Facility Operations
          </h1>
          <p className="text-xl text-gray-600">
            Comprehensive Ice Rink Management System
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Link
            href="/ice-depth"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-500 rounded-full p-4 mb-4">
                <Snowflake className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Ice Depth</h2>
              <p className="text-gray-600">
                Monitor and manage ice thickness with digital measurements and
                visual reports
              </p>
            </div>
          </Link>

          <Link
            href="/daily-reports"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-green-500 rounded-full p-4 mb-4">
                <ClipboardList className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Daily Reports</h2>
              <p className="text-gray-600">
                Create and manage end-of-shift reports with customizable tabs
                and forms
              </p>
            </div>
          </Link>

          <Link
            href="/admin"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-purple-500 rounded-full p-4 mb-4">
                <Settings className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Admin</h2>
              <p className="text-gray-600">
                Configure templates, manage users, and customize system settings
              </p>
            </div>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/auth/login"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  )
}
