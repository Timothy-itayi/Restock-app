/**
 * INFRASTRUCTURE MAPPER: ProductMapper
 * 
 * Converts between domain Product entities and database records
 */

import { Product, ProductValue } from '../../../domain/entities/Product';
import type { 
  Product as DbProduct,
  InsertProduct as DbInsertProduct,
  UpdateProduct as DbUpdateProduct
} from '../../../../backend/types/database';

/**
 * ProductMapper handles conversion between domain and database formats
 */
export class ProductMapper {
  /**
   * Convert database product record to domain Product entity
   */
  static toDomain(dbProduct: DbProduct): Product {
    const productValue: ProductValue = {
      id: dbProduct.id,
      userId: dbProduct.user_id,
      name: dbProduct.name,
      defaultQuantity: dbProduct.default_quantity,
      defaultSupplierId: dbProduct.default_supplier_id,
      createdAt: new Date(dbProduct.created_at)
    };

    return Product.fromValue(productValue);
  }

  /**
   * Convert domain Product to database insert format
   */
  static toDatabaseInsert(product: Product): DbInsertProduct {
    const value = product.toValue();
    
    return {
      user_id: value.userId,
      name: value.name,
      default_quantity: value.defaultQuantity,
      default_supplier_id: value.defaultSupplierId
    };
  }

  /**
   * Convert domain Product to database update format
   */
  static toDatabaseUpdate(product: Product): DbUpdateProduct {
    const value = product.toValue();
    
    return {
      name: value.name,
      default_quantity: value.defaultQuantity,
      default_supplier_id: value.defaultSupplierId
    };
  }

  /**
   * Convert domain Product to database format with ID for full updates
   */
  static toDatabase(product: Product): DbProduct {
    const value = product.toValue();
    
    return {
      id: value.id,
      user_id: value.userId,
      name: value.name,
      default_quantity: value.defaultQuantity,
      default_supplier_id: value.defaultSupplierId,
      created_at: value.createdAt.toISOString()
    };
  }

  /**
   * Create array of domain products from database records
   */
  static toDomainArray(dbProducts: DbProduct[]): Product[] {
    return dbProducts.map(dbProduct => this.toDomain(dbProduct));
  }

  /**
   * Create minimal product data for autocomplete/selection
   */
  static toSelectOption(dbProduct: DbProduct): {
    id: string;
    name: string;
    defaultQuantity: number;
    defaultSupplierId?: string;
  } {
    return {
      id: dbProduct.id,
      name: dbProduct.name,
      defaultQuantity: dbProduct.default_quantity,
      defaultSupplierId: dbProduct.default_supplier_id
    };
  }
}
