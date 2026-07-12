import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAddresses } from '@/lib/models'
import { getObjectId, serializeDocs } from '@/lib/mongodb'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { MapPin, Plus, Trash2 } from 'lucide-react'

export const revalidate = 0 // Dynamic server rendering

export default async function AddressesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null

  const userId = getObjectId(session.user.id)
  const addresses = await getAddresses(userId)
  const serializedAddresses = serializeDocs<any>(addresses)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="heading-3 text-gray-900 dark:text-white">Shipping Addresses</h2>
          <p className="body-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your default shipping addresses for checkout.
          </p>
        </div>
        <Button size="sm" className="sm:w-auto self-start">
          <Plus className="w-4 h-4 mr-2" />
          Add Address
        </Button>
      </div>

      {serializedAddresses.length === 0 ? (
        <Card className="p-12 text-center max-w-md mx-auto">
          <CardContent>
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="heading-4 mb-2">No Addresses Found</h3>
            <p className="body-sm">
              You haven't saved any addresses yet. Add a new address to speed up checkout.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {serializedAddresses.map((address) => (
            <Card key={address.id} className="relative flex flex-col justify-between">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-gray-950 dark:text-white flex items-center gap-2">
                      {address.name}
                      {address.isDefault && (
                        <Badge variant="success" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{address.phone}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500 p-1.5 h-auto">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1 leading-relaxed">
                  <p>{address.addressLine1}</p>
                  {address.addressLine2 && <p>{address.addressLine2}</p>}
                  <p>{address.city}, {address.state} - {address.postalCode}</p>
                  <p className="text-gray-500">{address.country}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
