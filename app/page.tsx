import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (session) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            SheetAPI
          </h1>
          <p className="text-2xl text-gray-600 mb-8">
            Transform Google Sheets into RESTful JSON APIs instantly
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12">
            No-code API Gateway that turns your spreadsheets into powerful REST endpoints.
            Perfect for rapid prototyping and data management.
          </p>
          <Link
            href="/login"
            className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Get Started
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Instant Setup</h3>
            <p className="text-gray-600">
              Connect your Google Sheets and get REST APIs in seconds
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Secure</h3>
            <p className="text-gray-600">
              Built-in authentication with Basic Auth and Bearer tokens
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-2">RESTful</h3>
            <p className="text-gray-600">
              Full CRUD operations with GET, POST, PUT, DELETE methods
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
