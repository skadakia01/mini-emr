"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Stethoscope, Lock, Eye, EyeOff, Loader2, Shield } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push("/admin")
        router.refresh()
      } else {
        setError("Incorrect admin password. Please try again.")
      }
    } catch {
      setError("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-lg">Mini EMR</span>
            <span className="text-xs bg-indigo-500/30 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/30">
              Admin
            </span>
          </div>
        </div>

        <div>
          <div className="w-16 h-16 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Admin Portal</h2>
          <p className="text-indigo-200 text-base leading-relaxed max-w-sm">
            Secure access to manage patients, appointments, and prescriptions across your practice.
          </p>

          <div className="mt-8 space-y-3">
            {[
              "Manage all patient records",
              "Schedule & edit appointments",
              "Track prescription refills",
              "Monitor patient health data",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0" />
                <span className="text-indigo-200 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-indigo-500 text-xs">Protected admin access · Mini EMR</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Mini EMR Admin</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin sign in</h1>
            <p className="text-gray-400 text-sm">Enter your admin password to access the dashboard</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  autoFocus
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all bg-gray-50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-sm shadow-indigo-200"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in to Admin"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              For patient access,{" "}
              <a href="/" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                go to the patient portal
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
