/**
 * Cloudinary Upload Utility
 * Handles file uploads to Cloudinary via backend proxy
 */

import Cookies from 'js-cookie'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

/**
 * Upload a file to Cloudinary
 * @param file File to upload
 * @param onProgress Optional progress callback (0-100)
 * @returns Cloudinary URL
 */
export async function uploadToCloudinary(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)

    const xhr = new XMLHttpRequest()

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = Math.round((e.loaded / e.total) * 100)
        onProgress(progress)
      }
    })

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText)
          console.log('Cloudinary upload response:', response)

          // Backend returns "publicUrl" not "url"
          if (response.success && response.data?.publicUrl) {
            resolve(response.data.publicUrl)
          } else {
            console.error('Upload failed - invalid response:', response)
            reject(new Error(response.error || 'Upload failed'))
          }
        } catch (error) {
          console.error('Failed to parse upload response:', xhr.responseText)
          reject(new Error('Invalid response from server'))
        }
      } else {
        try {
          const response = JSON.parse(xhr.responseText)
          console.error('Upload failed with error response:', response)
          reject(new Error(response.error || `Upload failed with status ${xhr.status}`))
        } catch {
          console.error('Upload failed with status:', xhr.status)
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      }
    })

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'))
    })

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'))
    })

    xhr.addEventListener('timeout', () => {
      reject(new Error('Upload timeout'))
    })

    // Configure and send request
    xhr.open('POST', `${baseURL}/uploads/cloudinary/direct`)
    xhr.timeout = 120000 // 2 minute timeout

    // Add auth token
    const accessToken = Cookies.get('accessToken')
    if (accessToken) {
      xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`)
    }

    xhr.send(formData)
  })
}

/**
 * Upload multiple files to Cloudinary
 * @param files Files to upload
 * @param onProgress Optional progress callback for each file
 * @returns Array of Cloudinary URLs
 */
export async function uploadMultipleToCloudinary(
  files: File[],
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<string[]> {
  const urls: string[] = []

  for (let i = 0; i < files.length; i++) {
    const url = await uploadToCloudinary(files[i], (progress) => {
      onProgress?.(i, progress)
    })
    urls.push(url)
  }

  return urls
}
