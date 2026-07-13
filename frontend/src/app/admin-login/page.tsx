'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Shield, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password.trim()) {
      toast.error('Please enter the administrator password.')
      return
    }

    setIsLoading(true)

    try {
      const res = await signIn('credentials', {
        email: 'admin@shopuncle.com',
        password: password,
        redirect: false,
      })

      if (res?.error) {
        toast.error('Access Denied. Incorrect administrator password.')
      } else {
        toast.success('Successfully authenticated as administrator!')
        router.push('/admin')
        router.refresh()
      }
    } catch (err) {
      console.error(err)
      toast.error('An error occurred during authentication.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0E0C0A] px-4 relative overflow-hidden">
      {/* Decorative backdrop gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-950/20 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-950/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <Card className="max-w-md w-full border border-gray-800 bg-[#161310]/95 backdrop-blur shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <CardContent className="p-8 sm:p-10 space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary-500/20 border border-primary-400/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-white tracking-wide">Admin Portal</h1>
            <p className="text-xs text-gray-400 font-medium">
              Enter your secure password to access the store management system.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-widest">
                Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Lock className="w-4 h-4" />
                </div>
                
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full bg-[#1F1B18] border-gray-800 text-white placeholder-gray-600 pl-10 pr-10 py-3 rounded-xl focus:border-primary-500 focus:ring-primary-500/20"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              isLoading={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-primary-500/10 flex items-center justify-center gap-2 transition-all group"
            >
              Sign In
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </form>

          {/* Footer Back Link */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-xs text-gray-500 hover:text-gray-300 font-medium transition-colors"
            >
              ← Back to Shop
            </button>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
