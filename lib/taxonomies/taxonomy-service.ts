import { TaxonomyRepository, SimpleTaxonomy, ComplexTaxonomy, TaxonomyType } from './taxonomy-repository';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

export interface ComplexTaxonomyInput {
  title: string;
  description: string;
  image: File;
}

export class TaxonomyService {
  private repository: TaxonomyRepository;
  private s3Client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    this.repository = new TaxonomyRepository();
    
    // Initialize Cloudflare R2 client
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    
    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error('R2 credentials are not configured');
    }

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.bucketName = process.env.R2_BUCKET_NAME || 'digiinsta';
    this.publicUrl = process.env.R2_PUBLIC_URL || 'https://assets.digiinsta.store';
  }

  /**
   * Create a simple taxonomy (Product Type or Format)
   */
  async createSimpleTaxonomy(
    type: 'product_type' | 'format',
    title: string
  ): Promise<SimpleTaxonomy> {
    // Validate title
    if (!title || title.trim().length === 0) {
      throw new Error('Title is required');
    }

    return await this.repository.createSimpleTaxonomy(type, title.trim());
  }

  /**
   * Create a complex taxonomy (Occasion or Collection)
   */
  async createComplexTaxonomy(
    type: 'occasion' | 'collection',
    data: ComplexTaxonomyInput
  ): Promise<ComplexTaxonomy> {
    // Validate required fields
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Title is required');
    }
    if (!data.description || data.description.trim().length === 0) {
      throw new Error('Description is required');
    }
    if (!data.image) {
      throw new Error('Image is required');
    }

    // Upload image to R2
    const imageUrl = await this.uploadTaxonomyImage(data.image);

    // Create taxonomy in database
    return await this.repository.createComplexTaxonomy(type, {
      title: data.title.trim(),
      description: data.description.trim(),
      imageUrl,
    });
  }

  /**
   * Upload an image to Cloudflare R2
   * Returns the public URL of the uploaded image
   */
  async uploadTaxonomyImage(file: File): Promise<string> {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid image format. Only JPEG, PNG, and WebP are allowed.');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('Image size must be less than 5MB');
    }

    // Generate unique filename
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `taxonomies/${randomUUID()}.${extension}`;

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
    });

    await this.s3Client.send(command);

    // Return public URL
    return `${this.publicUrl}/${filename}`;
  }

  /**
   * Get all taxonomies of a specific type
   */
  async getTaxonomiesByType(type: TaxonomyType) {
    return await this.repository.getTaxonomiesByType(type);
  }

  /**
   * Get a taxonomy by ID
   */
  async getTaxonomyById(type: TaxonomyType, id: string) {
    return await this.repository.getTaxonomyById(type, id);
  }
}
