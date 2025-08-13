/**
 * INFRASTRUCTURE MAPPER: SessionMapper
 * 
 * Converts between domain RestockSession entities and database records
 * Handles the complexity of mapping domain's single entity to multiple DB tables
 */

import { RestockSession, SessionValue, RestockItemValue, SessionStatus } from '../../../domain/entities/RestockSession';
import type { 
  RestockSession as DbSession,
  RestockItem as DbRestockItem,
  RestockSessionProduct as DbSessionProduct,
  RestockSessionSupplier as DbSessionSupplier
} from '../../../../backend/types/database';

export interface DbSessionWithRelations {
  session: DbSession;
  items: Array<DbRestockItem & {
    products: { id: string; name: string; default_quantity: number; default_supplier_id?: string };
    suppliers: { id: string; name: string; email: string; phone?: string };
  }>;
  sessionProducts?: DbSessionProduct[];
  sessionSuppliers?: DbSessionSupplier[];
}

export interface DbSessionForSave {
  sessionRecord: {
    user_id: string;
    status: 'draft' | 'email_generated' | 'sent';
    name?: string;
  };
  itemRecords: Array<{
    session_id: string;
    product_id: string;
    supplier_id: string;
    quantity: number;
    notes?: string;
  }>;
}

export interface DbSessionForUpdate {
  sessionRecord: {
    id: string;
    status?: 'draft' | 'email_generated' | 'sent';
    name?: string;
  };
  itemRecords: Array<{
    id?: string;
    session_id: string;
    product_id: string;
    supplier_id: string;
    quantity: number;
    notes?: string;
  }>;
}

/**
 * SessionMapper handles conversion between domain and database formats
 * 
 * Domain Model: Single RestockSession with embedded items
 * Database Model: Separate tables (restock_sessions + restock_items)
 */
export class SessionMapper {
  /**
   * Convert database records to domain RestockSession entity
   */
  static toDomain(dbData: DbSessionWithRelations): RestockSession {
    const { session, items } = dbData;
    
    // Convert database status to domain enum
    const domainStatus = this.mapStatusToDomain(session.status);
    
    // Convert database items to domain items
    const domainItems: RestockItemValue[] = items.map(item => ({
      productId: item.product_id,
      productName: item.products.name,
      quantity: item.quantity,
      supplierId: item.supplier_id,
      supplierName: item.suppliers.name,
      supplierEmail: item.suppliers.email,
      notes: item.notes
    }));

    const sessionValue: SessionValue = {
      id: session.id,
      userId: session.user_id,
      name: session.name,
      status: domainStatus,
      items: domainItems,
      createdAt: new Date(session.created_at),
      updatedAt: undefined // Database doesn't track updates yet
    };

    return RestockSession.fromValue(sessionValue);
  }

  /**
   * Convert domain RestockSession to database format for saving new sessions
   */
  static toDatabase(session: RestockSession): DbSessionForSave {
    const value = session.toValue();
    
    const sessionRecord = {
      user_id: value.userId,
      status: this.mapStatusToDatabase(value.status),
      name: value.name
    };

    const itemRecords = value.items.map(item => ({
      session_id: value.id, // This will be set after session creation
      product_id: item.productId,
      supplier_id: item.supplierId,
      quantity: item.quantity,
      notes: item.notes
    }));

    return {
      sessionRecord,
      itemRecords
    };
  }

  /**
   * Convert domain RestockSession to database format for updates
   */
  static toDatabaseForUpdate(session: RestockSession): DbSessionForUpdate {
    const value = session.toValue();
    
    const sessionRecord = {
      id: value.id,
      status: this.mapStatusToDatabase(value.status),
      name: value.name
    };

    const itemRecords = value.items.map(item => ({
      session_id: value.id,
      product_id: item.productId,
      supplier_id: item.supplierId,
      quantity: item.quantity,
      notes: item.notes
    }));

    return {
      sessionRecord,
      itemRecords
    };
  }

  /**
   * Map database status to domain enum
   */
  private static mapStatusToDomain(dbStatus: 'draft' | 'email_generated' | 'sent'): SessionStatus {
    switch (dbStatus) {
      case 'draft':
        return SessionStatus.DRAFT;
      case 'email_generated':
        return SessionStatus.EMAIL_GENERATED;
      case 'sent':
        return SessionStatus.SENT;
      default:
        throw new Error(`Unknown database status: ${dbStatus}`);
    }
  }

  /**
   * Map domain status to database format
   */
  private static mapStatusToDatabase(domainStatus: SessionStatus): 'draft' | 'email_generated' | 'sent' {
    switch (domainStatus) {
      case SessionStatus.DRAFT:
        return 'draft';
      case SessionStatus.EMAIL_GENERATED:
        return 'email_generated';
      case SessionStatus.SENT:
        return 'sent';
      default:
        throw new Error(`Unknown domain status: ${domainStatus}`);
    }
  }

  /**
   * Create minimal session data for listing (without items)
   */
  static toDomainSummary(dbSession: DbSession): {
    id: string;
    userId: string;
    name?: string;
    status: SessionStatus;
    createdAt: Date;
  } {
    return {
      id: dbSession.id,
      userId: dbSession.user_id,
      name: dbSession.name,
      status: this.mapStatusToDomain(dbSession.status),
      createdAt: new Date(dbSession.created_at)
    };
  }
}
