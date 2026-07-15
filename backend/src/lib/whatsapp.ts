/**
 * WhatsApp Business API utility
 * Sends automatic order notifications to the shop owner via Meta's WhatsApp Cloud API.
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/messages/text-messages
 */

const WHATSAPP_API_URL = 'https://graph.facebook.com/v19.0'

/**
 * Sends a text message to a WhatsApp number using the Meta Cloud API.
 * @param to   Recipient phone number in E.164 format without '+' (e.g. '918019822006')
 * @param text Message body text
 */
export async function sendWhatsAppTextMessage(to: string, text: string): Promise<boolean> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!accessToken || !phoneNumberId) {
    console.warn('[WhatsApp] Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID. Skipping API send.')
    return false
  }

  try {
    const res = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('[WhatsApp] API error:', JSON.stringify(data))
      return false
    }

    console.log('[WhatsApp] Message sent successfully. ID:', data?.messages?.[0]?.id)
    return true
  } catch (err) {
    console.error('[WhatsApp] Failed to send message:', err)
    return false
  }
}

/**
 * Builds and sends an order notification message to the shop owner.
 */
export async function notifyShopOwnerNewOrder(params: {
  orderId: string
  otp: string
  customerName: string
  customerPhone: string
  address: string
  notes?: string
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
    previewImage?: string
  }>
  totalAmount: number
}): Promise<boolean> {
  // Strip +, spaces and non-digit chars so the API call always gets a clean number
  const shopOwnerNumber = (process.env.SHOP_OWNER_NUMBER || '918019822006').replace(/\D/g, '')

  const { orderId, otp, customerName, customerPhone, address, notes, items, totalAmount } = params

  const itemListText = items.map((item) => {
    let line = `▪ ${item.name} × ${item.quantity} — ₹${item.unitPrice * item.quantity}`
    if (item.previewImage) {
      line += `\n   📎 Image: ${item.previewImage}`
    }
    return line
  }).join('\n')

  const message = [
    `🛒 *New Order Received!*`,
    ``,
    `📦 *Order ID:* ${orderId}`,
    `🔐 *Verification OTP:* ${otp}`,
    ``,
    `👤 *Customer Details*`,
    `   Name   : ${customerName}`,
    `   Phone  : ${customerPhone}`,
    `   Address: ${address || 'N/A'}`,
    notes ? `   Notes  : ${notes}` : null,
    ``,
    `🧾 *Items Ordered*`,
    itemListText,
    ``,
    `💰 *Total Amount: ₹${totalAmount}*`,
    ``,
    `_Please confirm or update the order status from your dashboard._`,
  ].filter(line => line !== null).join('\n')

  return sendWhatsAppTextMessage(shopOwnerNumber, message)
}
