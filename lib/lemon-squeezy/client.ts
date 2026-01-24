/**
 * Lemon Squeezy API Client
 * 
 * This client handles all interactions with the Lemon Squeezy API,
 * including authentication, product fetching, and error handling.
 */

const LEMONSQUEEZY_API_BASE_URL = 'https://api.lemonsqueezy.com/v1';

/**
 * Lemon Squeezy Product as returned by the API
 * Following JSON:API specification
 */
export interface LemonSqueezyProduct {
  type: 'products';
  id: string;
  attributes: {
    store_id: number;
    name: string;
    slug: string;
    description: string;
    status: 'draft' | 'published';
    status_formatted: string;
    thumb_url: string | null;
    large_thumb_url: string | null;
    price: number;
    price_formatted: string;
    from_price: number | null;
    to_price: number | null;
    pay_what_you_want: boolean;
    buy_now_url: string;
    created_at: string;
    updated_at: string;
    test_mode: boolean;
  };
  relationships: {
    store: {
      links: {
        related: string;
        self: string;
      };
    };
    variants: {
      links: {
        related: string;
        self: string;
      };
    };
  };
  links: {
    self: string;
  };
}

/**
 * API Response structure following JSON:API spec
 */
interface LemonSqueezyApiResponse<T> {
  meta?: {
    page?: {
      currentPage: number;
      from: number;
      lastPage: number;
      perPage: number;
      to: number;
      total: number;
    };
  };
  jsonapi: {
    version: string;
  };
  links?: {
    first?: string;
    last?: string;
    prev?: string;
    next?: string;
  };
  data: T;
}

/**
 * Error response from Lemon Squeezy API
 */
interface LemonSqueezyErrorResponse {
  errors: Array<{
    status: string;
    detail: string;
    title?: string;
  }>;
}

/**
 * Custom error class for Lemon Squeezy API errors
 */
export class LemonSqueezyApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: string
  ) {
    super(message);
    this.name = 'LemonSqueezyApiError';
  }
}

/**
 * Lemon Squeezy API Client
 */
export class LemonSqueezyClient {
  private apiKey: string;
  private storeId: string;

  constructor() {
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;

    if (!apiKey) {
      throw new Error('LEMONSQUEEZY_API_KEY environment variable is not set');
    }

    if (!storeId) {
      throw new Error('LEMONSQUEEZY_STORE_ID environment variable is not set');
    }

    this.apiKey = apiKey;
    this.storeId = storeId;
  }

  /**
   * Make an authenticated request to the Lemon Squeezy API
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${LEMONSQUEEZY_API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
          'Authorization': `Bearer ${this.apiKey}`,
          ...options.headers,
        },
      });

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        throw new LemonSqueezyApiError(
          'Rate limit exceeded. Please try again later.',
          429,
          retryAfter ? `Retry after ${retryAfter} seconds` : undefined
        );
      }

      // Handle other error responses
      if (!response.ok) {
        let errorMessage = `API request failed with status ${response.status}`;
        let errorDetails: string | undefined;

        try {
          const errorData: LemonSqueezyErrorResponse = await response.json();
          if (errorData.errors && errorData.errors.length > 0) {
            errorMessage = errorData.errors[0].detail || errorMessage;
            errorDetails = errorData.errors.map(e => e.detail).join(', ');
          }
        } catch {
          // If we can't parse the error response, use the default message
        }

        throw new LemonSqueezyApiError(errorMessage, response.status, errorDetails);
      }

      return await response.json();
    } catch (error) {
      // Re-throw LemonSqueezyApiError as-is
      if (error instanceof LemonSqueezyApiError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new LemonSqueezyApiError(
          'Network error: Unable to reach Lemon Squeezy API. Please check your internet connection.',
          undefined,
          error.message
        );
      }

      // Handle other unexpected errors
      throw new LemonSqueezyApiError(
        'An unexpected error occurred while communicating with Lemon Squeezy API',
        undefined,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  /**
   * Fetch all products from the store
   * Handles pagination automatically to retrieve all products
   */
  async fetchAllProducts(): Promise<LemonSqueezyProduct[]> {
    const allProducts: LemonSqueezyProduct[] = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const response = await this.makeRequest<LemonSqueezyApiResponse<LemonSqueezyProduct[]>>(
        `/products?filter[store_id]=${this.storeId}&page[number]=${currentPage}&page[size]=100`
      );

      allProducts.push(...response.data);

      // Check if there are more pages
      if (response.meta?.page) {
        hasMorePages = currentPage < response.meta.page.lastPage;
        currentPage++;
      } else {
        hasMorePages = false;
      }
    }

    return allProducts;
  }

  /**
   * Fetch product thumbnail image
   * Returns only the large_thumb_url (highest quality thumbnail)
   */
  async fetchProductImages(productId: string): Promise<string[]> {
    try {
      const response = await this.makeRequest<LemonSqueezyApiResponse<LemonSqueezyProduct>>(
        `/products/${productId}`
      );

      const { large_thumb_url } = response.data.attributes;

      // Return only the large thumbnail if available
      return large_thumb_url ? [large_thumb_url] : [];
    } catch (error) {
      console.error(`Error fetching image for product ${productId}:`, error);
      return [];
    }
  }

  /**
   * Fetch a single product by ID
   */
  async fetchProduct(productId: string): Promise<LemonSqueezyProduct> {
    const response = await this.makeRequest<LemonSqueezyApiResponse<LemonSqueezyProduct>>(
      `/products/${productId}`
    );

    return response.data;
  }
}
