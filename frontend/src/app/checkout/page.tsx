'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cart'
import Link from 'next/link'
import { 
  ShoppingCart, Gift, ArrowLeft, CheckCircle2, 
  Copy, Phone, MapPin, NotepadText, Send, Check, X
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getSubtotal, getItemCount, clearCart } = useCartStore()

  // Form states
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  
  // App states
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderResult, setOrderResult] = useState<{ orderId: string; otp: string; whatsappLink: string } | null>(null)
  const [copiedOrderId, setCopiedOrderId] = useState(false)
  const [copiedOtp, setCopiedOtp] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const subtotal = getSubtotal()
  const shipping = subtotal >= 999 ? 0 : 99
  const total = subtotal + shipping

  // Clear states when component unmounts
  useEffect(() => {
    return () => {
      setOrderResult(null)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      toast.error('Please fill in all required fields.')
      return
    }

    setShowConfirmModal(true)
  }

  const executeOrderPlacement = async () => {
    setShowConfirmModal(false)
    setIsProcessing(true)

    try {
      // Compile order items format
      const orderItems = items.map(item => {
        const customDetails = [
          item.size ? `Size: ${item.size}` : '',
          item.material ? `Mat: ${item.material}` : ''
        ].filter(Boolean).join(', ')

        return {
          name: item.name + (customDetails ? ` (${customDetails})` : ''),
          qty: item.quantity,
          price: item.price
        }
      })

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: fullName,
          customerPhone: phone,
          items: orderItems,
          address,
          notes
        })
      })

      const result = await response.json()

      if (response.ok) {
        setOrderResult({
          orderId: result.orderId,
          otp: result.otp,
          whatsappLink: result.whatsappLink
        })
        
        toast.success('Order placed! Redirecting to WhatsApp...')
        clearCart() // Clear the shopping cart since order has been created

        // Attempt to open the WhatsApp link in a new tab immediately
        try {
          const newTab = window.open(result.whatsappLink, '_blank')
          if (!newTab) {
            toast.success('WhatsApp link generated. Please click the button below to send.')
          }
        } catch (popupError) {
          console.warn('Failed to auto-open WhatsApp tab:', popupError)
        }
      } else {
        toast.error(result.error || 'Failed to place order.')
      }
    } catch (err) {
      console.error(err)
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCopy = (text: string, type: 'order' | 'otp') => {
    navigator.clipboard.writeText(text)
    if (type === 'order') {
      setCopiedOrderId(true)
      setTimeout(() => setCopiedOrderId(false), 2000)
    } else {
      setCopiedOtp(true)
      setTimeout(() => setCopiedOtp(false), 2000)
    }
    toast.success('Copied to clipboard!')
  }

  // Render Checkout Success Screen
  if (orderResult) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-20 flex items-center justify-center px-4">
        <Card className="max-w-xl w-full border border-green-200 dark:border-green-950 shadow-xl overflow-hidden rounded-2xl">
          {/* Decorative Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-8 text-center text-white relative">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30 backdrop-blur-md">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Order Received!</h2>
            <p className="text-emerald-100 mt-1 text-sm">Follow the step below to manually confirm your order.</p>
          </div>

          <CardContent className="p-8 space-y-6">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900/30 rounded-xl text-center">
              <p className="text-sm text-yellow-800 dark:text-yellow-400 font-medium">
                ⚠️ IMPORTANT: Save the credentials below to check your order status later. They are required since we do not use accounts.
              </p>
            </div>

            {/* Credentials Card */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-4 relative group border dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mb-1">Order ID</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-gray-900 dark:text-white text-lg">{orderResult.orderId}</span>
                  <button 
                    onClick={() => handleCopy(orderResult.orderId, 'order')}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors"
                  >
                    {copiedOrderId ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-4 relative group border dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mb-1">Verification OTP</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-lg tracking-wider">{orderResult.otp}</span>
                  <button 
                    onClick={() => handleCopy(orderResult.otp, 'otp')}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors"
                  >
                    {copiedOtp ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Section */}
            <div className="space-y-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your order is currently in <Badge variant="warning">pending</Badge> status.
                To complete your order, click the button below to send your invoice and verification code on WhatsApp:
              </p>

              <a 
                href={orderResult.whatsappLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block w-full"
              >
                <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/20 transition-all">
                  <Phone className="w-5 h-5" />
                  Send Order via WhatsApp
                  <Send className="w-4 h-4" />
                </Button>
              </a>
              
              <p className="text-xs text-gray-400">
                If the WhatsApp tab did not open automatically, click the button above.
              </p>
            </div>

            <div className="border-t dark:border-gray-800 pt-6 flex justify-between">
              <Link href="/track-order">
                <Button variant="outline" size="sm">
                  Track Order Status
                </Button>
              </Link>
              <Link href="/frames">
                <Button variant="ghost" size="sm">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render empty cart state
  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center p-12 rounded-2xl border dark:border-gray-800">
          <CardContent className="pt-6">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <ShoppingCart className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Cart is Empty</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Add products or designs to your cart before proceeding to checkout.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/personalized">
                <Button size="lg" className="w-full sm:w-auto">
                  <Gift className="w-5 h-5 mr-2" />
                  Personalized Gifts
                </Button>
              </Link>
              <Link href="/frames">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Browse Frames
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/cart">
            <button className="p-2 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl border dark:border-gray-800 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Manual Checkout</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Confirm details and send your order to the shop owner on WhatsApp.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Input Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="rounded-2xl border dark:border-gray-800 overflow-hidden shadow-sm">
                <CardHeader className="bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-800">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-500" />
                    Customer & Shipping Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        placeholder="e.g. John Doe" 
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        required
                        className="py-3 px-4 rounded-xl border dark:border-gray-800 bg-white dark:bg-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        WhatsApp Phone Number <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        placeholder="e.g. 9876543210" 
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        required
                        className="py-3 px-4 rounded-xl border dark:border-gray-800 bg-white dark:bg-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Shipping / Delivery Address <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      placeholder="Enter house no., building, street, city, state, pincode"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      required
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                      <NotepadText className="w-4 h-4 text-gray-400" />
                      Order Notes (Optional)
                    </label>
                    <textarea 
                      placeholder="Add any specific instructions for framing, custom message, etc."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Items Card */}
              <Card className="rounded-2xl border dark:border-gray-800 overflow-hidden shadow-sm">
                <CardHeader className="bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-800">
                  <CardTitle className="text-lg font-bold">Review Items</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y dark:divide-gray-800">
                    {items.map((item) => (
                      <div key={item.id} className="p-4 flex items-center gap-4">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-16 h-16 rounded-xl object-cover border dark:border-gray-800 bg-gray-50"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-950 dark:text-white truncate text-sm">{item.name}</h4>
                          <div className="flex gap-2 mt-1">
                            {item.size && (
                              <Badge variant="default" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5">
                                Size: {item.size}
                              </Badge>
                            )}
                            {item.material && (
                              <Badge variant="default" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5">
                                Material: {item.material}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-950 dark:text-white text-sm">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <Card className="rounded-2xl border border-primary-200 dark:border-primary-950 bg-gradient-to-br from-primary-50/50 to-primary-100/30 dark:from-primary-950/20 dark:to-primary-950/5 overflow-hidden shadow-sm">
                  <CardHeader className="border-b border-primary-100 dark:border-primary-950/50 py-4">
                    <CardTitle className="text-base font-bold text-gray-950 dark:text-white">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>Items Subtotal</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {shipping === 0 ? <span className="text-emerald-600 dark:text-emerald-400">FREE</span> : formatPrice(shipping)}
                        </span>
                      </div>
                      <div className="border-t dark:border-gray-800 pt-3 flex justify-between text-base font-extrabold text-gray-950 dark:text-white">
                        <span>Total Price</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-xl shadow-lg transition-all"
                      disabled={isProcessing}
                      isLoading={isProcessing}
                    >
                      Place WhatsApp Order
                    </Button>

                    <div className="text-[11px] text-center text-gray-400 space-y-1">
                      <p>
                        Manual confirmation. No advance online payment required!
                      </p>
                      <p>
                        By continuing, you agree to submit details to WhatsApp chat.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </form>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-b dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Confirm Your Order</h3>
              <button 
                type="button" 
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Delivery Details</h4>
                <div className="bg-gray-50 dark:bg-gray-950/40 p-4 rounded-xl space-y-2 border dark:border-gray-800 text-sm">
                  <p className="text-gray-900 dark:text-white"><strong className="font-semibold text-gray-500 dark:text-gray-400">Name:</strong> {fullName}</p>
                  <p className="text-gray-900 dark:text-white"><strong className="font-semibold text-gray-500 dark:text-gray-400">Phone:</strong> {phone}</p>
                  <p className="text-gray-900 dark:text-white"><strong className="font-semibold text-gray-500 dark:text-gray-400">Address:</strong> {address}</p>
                  {notes && (
                    <p className="text-gray-900 dark:text-white"><strong className="font-semibold text-gray-500 dark:text-gray-400">Notes:</strong> {notes}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Order Summary</h4>
                <div className="max-h-40 overflow-y-auto divide-y dark:divide-gray-800 border dark:border-gray-800 rounded-xl bg-gray-50/40 dark:bg-gray-950/20">
                  {items.map((item) => (
                    <div key={item.id} className="p-3 flex justify-between items-center text-xs">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</p>
                        <p className="text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium text-gray-950 dark:text-white shrink-0">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t dark:border-gray-800 pt-4 flex justify-between items-center font-bold text-gray-900 dark:text-white text-base">
                <span>Total Amount:</span>
                <span className="text-emerald-600 dark:text-emerald-400">{formatPrice(total)}</span>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl text-xs text-amber-800 dark:text-amber-400 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Confirming will record this order in our system and prompt you to send details via WhatsApp to complete.</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-gray-50 dark:bg-gray-950/20 px-6 py-4 border-t dark:border-gray-800 flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2.5 rounded-xl"
              >
                Go Back
              </Button>
              <Button 
                type="button" 
                onClick={executeOrderPlacement}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-emerald-500/20"
              >
                Confirm & Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}