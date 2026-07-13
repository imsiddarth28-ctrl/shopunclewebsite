import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Calendar, Mail, Shield, User, Phone } from 'lucide-react'

export default async function AccountPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="heading-3 text-gray-900 dark:text-white">Profile Details</h2>
        <p className="body-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage your personal information and account settings.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start p-6 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-150 dark:border-gray-800">
        <Avatar
          src={session.user.image || undefined}
          name={session.user.name || undefined}
          size="lg"
        />
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="heading-4 text-gray-900 dark:text-white">{session.user.name}</h3>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <Badge variant="info">
              <Shield className="w-3.5 h-3.5 mr-1" />
              {session.user.role || 'CUSTOMER'}
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
                <span className="font-medium text-gray-950 dark:text-white">{session.user.name}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">Email Address</span>
                <span className="font-medium text-gray-950 dark:text-white">{session.user.email}</span>
              </div>
            </div>

            {session.user.phone && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 block">Phone Number</span>
                  <span className="font-medium text-gray-950 dark:text-white">{session.user.phone}</span>
                </div>
              </div>
            )}
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
