import { v2 as cloudinary } from 'cloudinary'

// Fail loudly at startup if Cloudinary env vars are missing
const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

if (!cloudName || !apiKey || !apiSecret) {
  // Log a warning rather than crashing during build-time imports
  console.warn(
    '[cloudinary] CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be set as environment variables.'
  )
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
})

/**
 * Uploads a base64 encoded image or DataURL to Cloudinary.
 * @param base64Data Raw base64 string or DataURL (e.g. data:image/png;base64,...)
 * @param folder Target folder inside Cloudinary
 */
export async function uploadImage(base64Data: string, folder = 'shopuncle/orders') {
  try {
    const uploadResponse = await cloudinary.uploader.upload(base64Data, {
      folder,
      resource_type: 'image',
    })
    return {
      publicId: uploadResponse.public_id,
      secureUrl: uploadResponse.secure_url,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error('Failed to upload image to Cloudinary')
  }
}

/**
 * Deletes an image from Cloudinary using its public_id.
 * @param publicId Cloudinary public_id
 */
export async function deleteImage(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId)
    return true
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw new Error('Failed to delete image from Cloudinary')
  }
}
