/**
 * Lemon Squeezy API Integration
 * 
 * This module provides a client for interacting with the Lemon Squeezy API
 * to fetch product data and images, as well as checkout functionality.
 */

export { LemonSqueezyClient, LemonSqueezyApiError } from './client';
export type { LemonSqueezyProduct } from './client';
export { generateCheckoutUrl, openCheckoutOverlay, createCheckoutHandler } from './checkout';
