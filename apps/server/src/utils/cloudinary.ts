import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import type { UploadApiResponse } from 'cloudinary';

// Configure once at import time
cloudinary.config({
  cloud_name:  env.CLOUDINARY_CLOUD_NAME,
  api_key:     env.CLOUDINARY_API_KEY,
  api_secret:  env.CLOUDINARY_API_SECRET,
  secure:      true,
});

export type UploadResult = {
  url:          string;
  thumbnailUrl: string;
  publicId:     string;
  mediaType:    'photo' | 'video';
  width?:       number;
  height?:      number;
  duration?:    number; // seconds, videos only
};

export function getCloudinaryUrls(publicId: string, mediaType: 'photo' | 'video') {
  const url = cloudinary.url(publicId, {
    resource_type: mediaType === 'video' ? 'video' : 'image',
    secure: true,
  });
  const thumbnailUrl = mediaType === 'video'
    ? cloudinary.url(publicId, {
        resource_type: 'video',
        transformation: [
          { fetch_format: 'jpg', quality: 'auto' },
        ],
        secure: true,
      })
    : cloudinary.url(publicId, {
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        secure: true,
      });

  return { url, thumbnailUrl };
}

/**
 * Upload a file buffer to Cloudinary.
 * - Photos go into the `portfolio/gallery` folder, transformation: auto quality + format
 * - Videos go into `portfolio/gallery/videos`, limited to 60s clips
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<UploadResult> {
  const isVideo = mimeType.startsWith('video/');
  const folder  = isVideo ? 'portfolio/gallery/videos' : 'portfolio/gallery';

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: isVideo ? 'video' : 'image',
        // Auto quality + format for images; limit video to 60s
        ...(isVideo
          ? { eager: [{ duration: '60' }] }
          : { transformation: [{ quality: 'auto', fetch_format: 'auto' }] }),
        public_id: `${Date.now()}-${originalName.replace(/\.[^/.]+$/, '').replace(/\s+/g, '-')}`,
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload failed'));
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });

  // Generate a thumbnail URL for videos (first frame poster)
  const thumbnailUrl = isVideo
    ? cloudinary.url(result.public_id, {
        resource_type: 'video',
        transformation: [
          { fetch_format: 'jpg', quality: 'auto' },
        ],
      })
    : cloudinary.url(result.public_id, {
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      });

  return {
    url:         result.secure_url,
    thumbnailUrl,
    publicId:    result.public_id,
    mediaType:   isVideo ? 'video' : 'photo',
    width:       result.width,
    height:      result.height,
    duration:    result.duration,
  };
}

/**
 * Delete a resource from Cloudinary by its public_id.
 */
export async function deleteFromCloudinary(
  publicId: string,
  mediaType: 'photo' | 'video'
): Promise<void> {
  await cloudinary.uploader.destroy(publicId, {
    resource_type: mediaType === 'video' ? 'video' : 'image',
  });
}
