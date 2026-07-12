'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Shield, Mail, Calendar, User } from 'lucide-react'

export default function AdminProfilePage() {
  const { data: session } = useSession()

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="heading-3 text-gray-900 dark:text-white">Admin Profile</h2>
        <p className="body-sm text-gray-600 dark:text-gray-400 mt-1">
          View your administrative account credentials and system privileges.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
        <Avatar
          src={session.user.image || undefined}
          name={session.user.name || undefined}
          size="lg"
        />
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="heading-4 text-gray-900 dark:text-white">{session.user.name ?? 'Admin User'}</h3>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <Badge variant="info">
              <Shield className="w-3.5 h-3.5 mr-1" />
              {session.user.role || 'ADMIN'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">Full Name</span>
                <span className="font-medium text-gray-950 dark:text-white">{session.user.name ?? 'Admin User'}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">Email Address</span>
                <span className="font-medium text-gray-950 dark:text-white">{session.user.email ?? ''}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">Member Since</span>
                <span className="font-medium text-gray-950 dark:text-white">January 2024</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
