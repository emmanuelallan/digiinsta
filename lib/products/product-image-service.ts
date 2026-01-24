/**
 * Product Image Service
 * Handles uploading and managing product images in Cloudflare R2
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

const MAX_IMAGES_PER_PRODUCT = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Initialize R2 client
 */
function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 credentials not configured');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

/**
 * Get R2 bucket name
 */
function getBucketName(): string {
  const bucketName = process.env.R2_BUCKET_NAME;
  if (!bucketName) {
    throw new Error('R2_BUCKET_NAME not configured');
  }
  return bucketName;
}

/**
 * Get R2 public URL
 */
function getPublicUrl(): string {
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!publicUrl) {
    throw new Error('R2_PUBLIC_URL not configured');
  }
  return publicUrl;
}

/**
 * Validate image file
 */
export function validateProductImage(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid image format. Allowed formats: JPEG, PNG, WebP',
    };
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `Image size must be less than ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

/**
 * Upload product image to R2
 */
export async function uploadProductImage(
  productId: string,
  file: File
): Promise<string> {
  // Validate image
  const validation = validateProductImage(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const client = getR2Client();
  const bucketName = getBucketName();
  const publicUrl = getPublicUrl();

  // Generate unique filename
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const fileName = `products/${productId}/${randomUUID()}.${fileExtension}`;

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload to R2
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: buffer,
    ContentType: file.type,
  });

  await client.send(command);

  // Return public URL
  return `${publicUrl}/${fileName}`;
}

/**
 * Upload multiple product images
 */
export async function uploadProductImages(
  productId: string,
  files: File[]
): Promise<{ urls: string[]; errors: string[] }> {
  if (files.length > MAX_IMAGES_PER_PRODUCT) {
    throw new Error(`Maximum ${MAX_IMAGES_PER_PRODUCT} images allowed per product`);
  }

  const urls: string[] = [];
  const errors: string[] = [];

  for (const file of files) {
    try {
      const url = await uploadProductImage(productId, file);
      urls.push(url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Failed to upload ${file.name}: ${errorMessage}`);
    }
  }

  return { urls, errors };
}

/**
 * Delete product image from R2
 */
export async function deleteProductImage(imageUrl: string): Promise<void> {
  const publicUrl = getPublicUrl();
  
  // Extract the key from the URL
  if (!imageUrl.startsWith(publicUrl)) {
    throw new Error('Invalid image URL');
  }

  const key = imageUrl.replace(`${publicUrl}/`, '');

  const client = getR2Client();
  const bucketName = getBucketName();

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await client.send(command);
}

/**
 * Delete multiple product images
 */
export async function deleteProductImages(imageUrls: string[]): Promise<void> {
  const deletePromises = imageUrls.map(url => deleteProductImage(url));
  await Promise.all(deletePromises);
}
