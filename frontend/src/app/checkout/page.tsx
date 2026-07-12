'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { orderSchema, type OrderInput } from '@/lib/validations'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, cn } from '@/lib/utils'
import { useCartStore } from '@/store/cart'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  CreditCard, Truck, Shield, User, Mail, MapPin, 
  Phone, Lock, CheckCircle, ArrowRight, ArrowLeft,
  ChevronDown, ChevronUp, RotateCcw, ShoppingCart, Gift, ClipboardCheck, ClipboardCheck as ClipboardCheckIcon,
  ChevronLeft, ChevronRight
} from 'lucide-react'

const shippingCost = 99
const freeShippingThreshold = 999

const paymentMethods = [
  { id: 'razorpay', name: 'Razorpay', description: 'UPI, Cards, Net Banking, Wallets', icon: CreditCard },
  { id: 'stripe', name: 'Stripe', description: 'International Cards, Apple Pay, Google Pay', icon: CreditCard },
  { id: 'cod', name: 'Cash on Delivery', description: 'Pay when you receive your order', icon: Truck },
]

const steps = [
  { number: 1, title: 'Shipping', description: 'Delivery address' },
  { number: 2, title: 'Payment', description: 'Choose payment method' },
  { number: 3, title: 'Review', description: 'Confirm your order' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, getSubtotal, getItemCount, getStandardItems, getPersonalizedItems } = useCartStore()
  
  const [step, setStep] = useState(1)
  const [selectedPayment, setSelectedPayment] = useState<'razorpay' | 'stripe' | 'cod'>('razorpay')
  const [shippingAddress, setShippingAddress] = useState<any>(null)
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)

  const subtotal = getSubtotal()
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingCost
  const total = subtotal + shipping

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrderInput>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        frameOptionId: item.frameOptionId,
        customizationData: item.customizationData,
        previewImage: item.previewImage,
      })),
      shippingAddress: session?.user ? {
        name: session.user.name || '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
      } : {
        name: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
      },
      billingAddress: {
        name: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
      },
      paymentMethod: 'razorpay',
      couponCode: '',
      notes: '',
    },
  })

  useEffect(() => {
    setValue('items', items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      frameOptionId: item.frameOptionId,
      customizationData: item.customizationData,
      previewImage: item.previewImage,
    })))
  }, [items, setValue])

  const onSubmit = async (data: OrderInput) => {
    if (!session?.user) {
      router.push('/auth/signin?callbackUrl=/checkout')
      return
    }

    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            frameOptionId: item.frameOptionId,
            customizationData: item.customizationData,
            previewImage: item.previewImage,
          })),
        }),
      })

      const result = await response.json()
      
      if (response.ok) {
        const orderId = result.order._id || result.order.id
        router.push(`/orders/${orderId}?success=true`)
      } else {
        alert(result.error || 'Failed to place order')
      }
    } catch (error) {
      alert('Something went wrong. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center p-12">
          <CardContent className="pt-6">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <ShoppingCart className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Cart is Empty</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Add some items to your cart before checking out.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/personalized">
                <Button size="lg" className="w-full sm:w-auto">
                  <Gift className="w-5 h-5 mr-2" />
                  Create Personalized Gift
                </Button>
              </Link>
              <Link href="/frames">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Browse Ready Frames
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const standardItems = getStandardItems()
  const personalizedItems = getPersonalizedItems()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="heading-2 text-gray-900 dark:text-white">Checkout</h1>
          <p className="body text-gray-600 dark:text-gray-400 mt-1">
            {items.length} item{items.length !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        <div className="mb-8">
          <div className="relative flex justify-between">
            {steps.map((s, index) => (
              <div key={s.number} className="flex flex-col items-center">
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-all',
                  step > index ? 'bg-primary-600 text-white' : 
                  step === index + 1 ? 'bg-primary-600 text-white ring-4 ring-primary-200 dark:ring-primary-900' :
                  'bg-gray-200 dark:bg-gray-700 text-gray-500'
                )}>
                  {step > index ? <CheckCircle className="w-6 h-6" /> : s.number}
                </div>
                <div className="mt-2 text-center">
                  <p className={cn('font-medium text-sm', step >= index + 1 ? 'text-gray-900 dark:text-white' : 'text-gray-500')}>
                    {s.title}
                  </p>
                  <p className="text-xs text-gray-500">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {step === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {session?.user && shippingAddress && !showAddressForm ? (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{shippingAddress.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{shippingAddress.phone}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {shippingAddress.addressLine1}
                              {shippingAddress.addressLine2 && `, ${shippingAddress.addressLine2}`}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" type="button" onClick={() => setShowAddressForm(true)}>
                            Change
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <Input {...register('shippingAddress.name')} label="Full Name" error={errors.shippingAddress?.name?.message} placeholder="John Doe" />
                          <Input {...register('shippingAddress.phone')} label="Phone Number" error={errors.shippingAddress?.phone?.message} placeholder="9876543210" type="tel" />
                        </div>
                        <Input {...register('shippingAddress.addressLine1')} label="Address Line 1" error={errors.shippingAddress?.addressLine1?.message} placeholder="House No., Building, Street" />
                        <Input {...register('shippingAddress.addressLine2')} label="Address Line 2 (Optional)" placeholder="Landmark, Area" />
                        <div className="grid sm:grid-cols-3 gap-4">
                          <Input {...register('shippingAddress.city')} label="City" error={errors.shippingAddress?.city?.message} placeholder="Mumbai" />
                          <Input {...register('shippingAddress.state')} label="State" error={errors.shippingAddress?.state?.message} placeholder="Maharashtra" />
                          <Input {...register('shippingAddress.postalCode')} label="PIN Code" error={errors.shippingAddress?.postalCode?.message} placeholder="400001" />
                        </div>
                        <Input {...register('shippingAddress.country')} label="Country" defaultValue="India" disabled />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {step === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {paymentMethods.map((method) => (
                        <label
                          key={method.id}
                          className={cn(
                            'relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all',
                            selectedPayment === method.id
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                          )}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={selectedPayment === method.id}
                            onChange={(e) => {
                              const value = e.target.value as 'razorpay' | 'stripe' | 'cod'
                              setSelectedPayment(value)
                              setValue('paymentMethod', value)
                            }}
                            className="sr-only"
                          />
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                              <method.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">{method.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{method.description}</p>
                            </div>
                            <div className={cn(
                              'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                              selectedPayment === method.id
                                ? 'border-primary-500 bg-primary-500'
                                : 'border-gray-300 dark:border-gray-600'
                            )}>
                              {selectedPayment === method.id && (
                                <div className="w-2.5 h-2.5 rounded-full bg-white" />
                              )}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardCheckIcon className="w-5 h-5" />
                      Review & Confirm
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <p className="font-medium mb-2">Shipping Address</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {watch('shippingAddress.name')}<br />
                          {watch('shippingAddress.phone')}<br />
                          {watch('shippingAddress.addressLine1')}
                          {watch('shippingAddress.addressLine2') && `, ${watch('shippingAddress.addressLine2')}`}<br />
                          {watch('shippingAddress.city')}, {watch('shippingAddress.state')} - {watch('shippingAddress.postalCode')}
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <p className="font-medium mb-2">Payment Method</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {paymentMethods.find(m => m.id === watch('paymentMethod'))?.name}
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <p className="font-medium mb-2">Items ({getItemCount()})</p>
                        <div className="space-y-2 text-sm">
                          {personalizedItems.map(item => (
                            <div key={item.id} className="flex justify-between">
                              <span className="truncate pr-2">{item.name} × {item.quantity}</span>
                              <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                          {standardItems.map(item => (
                            <div key={item.id} className="flex justify-between">
                              <span className="truncate pr-2">{item.name} × {item.quantity}</span>
                              <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <Card className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-900/10 border-primary-200 dark:border-primary-800">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">Subtotal ({getItemCount()} items)</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">Shipping</span>
                        <span className="font-medium">
                          {shipping === 0 ? (
                            <span className="text-green-600 dark:text-green-400">FREE</span>
                          ) : (
                            formatPrice(shipping)
                          )}
                        </span>
                      </div>
                      <div className="border-t dark:border-gray-700 pt-3 flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                    </div>

                    {shipping > 0 && subtotal < freeShippingThreshold && (
                      <div className="p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 text-center text-sm text-primary-600 dark:text-primary-400">
                        Add {formatPrice(freeShippingThreshold - subtotal)} more for FREE shipping!
                      </div>
                    )}

                    <div className="pt-4 border-t dark:border-gray-700 grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                        <Shield className="w-4 h-4 mx-auto text-primary-600 dark:text-primary-400 mb-1" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">Secure</p>
                      </div>
                      <div className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                        <Truck className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">Fast Delivery</p>
                      </div>
                      <div className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                        <RotateCcw className="w-4 h-4 mx-auto text-purple-500 mb-1" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">Easy Returns</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>



                <div className="flex gap-3">
                  {step > 1 && (
                    <Button variant="outline" type="button" onClick={() => setStep(step - 1)} className="flex-1">
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  )}
                  {step < 3 ? (
                    <Button type="button" onClick={() => setStep(step + 1)} className="flex-1" disabled={isProcessing}>
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button type="submit" className="flex-1" size="lg" disabled={isProcessing} isLoading={isProcessing}>
                      Place Order
                      <Lock className="w-5 h-5 ml-2" />
                    </Button>
                  )}
                </div>

                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  By placing this order, you agree to our{' '}
                  <a href="/terms" className="underline hover:text-primary-600">Terms of Service</a>{' '}
                  and{' '}
                  <a href="/privacy" className="underline hover:text-primary-600">Privacy Policy</a>.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}