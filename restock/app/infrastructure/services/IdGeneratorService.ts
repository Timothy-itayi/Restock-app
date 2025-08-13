/**
 * INFRASTRUCTURE SERVICE: IdGeneratorService
 * 
 * Provides ID generation for domain entities
 * Abstracts the ID generation strategy from domain logic
 */

/**
 * IdGeneratorService handles ID generation for entities
 * 
 * Currently uses crypto.randomUUID() but could be swapped for:
 * - UUIDs from a different source
 * - Database-generated IDs
 * - Sequential IDs
 * - Custom ID formats
 */
export class IdGeneratorService {
  /**
   * Generate a new unique identifier
   */
  generateId(): string {
    // Use the built-in crypto.randomUUID() for web-standard UUID v4
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback for environments without crypto.randomUUID
    return this.generateUUIDv4Fallback();
  }

  /**
   * Generate a session ID with optional prefix
   */
  generateSessionId(): string {
    return `session_${this.generateId()}`;
  }

  /**
   * Generate a product ID with optional prefix
   */
  generateProductId(): string {
    return `product_${this.generateId()}`;
  }

  /**
   * Generate a supplier ID with optional prefix
   */
  generateSupplierId(): string {
    return `supplier_${this.generateId()}`;
  }

  /**
   * Generate a restock item ID
   */
  generateRestockItemId(): string {
    return `item_${this.generateId()}`;
  }

  /**
   * Validate that an ID has the expected format
   */
  isValidId(id: string): boolean {
    // Basic UUID v4 validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    // Check if it's a plain UUID
    if (uuidRegex.test(id)) {
      return true;
    }
    
    // Check if it's a prefixed UUID (e.g., "session_uuid")
    const prefixedRegex = /^[a-z]+_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return prefixedRegex.test(id);
  }

  /**
   * Extract the UUID part from a prefixed ID
   */
  extractUUID(prefixedId: string): string {
    const parts = prefixedId.split('_');
    if (parts.length === 2) {
      return parts[1];
    }
    return prefixedId; // Return as-is if no prefix
  }

  /**
   * Fallback UUID v4 generator for environments without crypto.randomUUID
   */
  private generateUUIDv4Fallback(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Generate a short ID for display purposes (first 8 characters)
   */
  generateShortId(): string {
    return this.generateId().substring(0, 8);
  }

  /**
   * Generate a timestamp-based ID for ordering
   */
  generateTimestampId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `${timestamp}_${randomPart}`;
  }
}
