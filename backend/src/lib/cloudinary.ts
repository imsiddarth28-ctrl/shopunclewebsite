import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '765828438969651',
  api_key: process.env.CLOUDINARY_API_KEY || '765828438969651',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'lkezWHJAg9ALRU9DTMKdPYTN-Mw',
})

/**
 * Uploads a base64 encoded image to Cloudinary.
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
