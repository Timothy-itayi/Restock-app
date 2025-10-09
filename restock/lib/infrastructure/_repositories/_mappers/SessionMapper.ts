/**
 * INFRASTRUCTURE MAPPER: SessionMapper
 * 
 * Converts between domain RestockSession entities and database records
 * Handles the complexity of mapping domain's single entity to multiple DB tables
 */

import { RestockSession, SessionValue, RestockItemValue, SessionStatus } from '../../../domain/_entities/RestockSession';
import type { 
  RestockSession as DbSession,
  RestockItem as DbRestockItem,
  Product as DbProduct,
  Supplier as DbSupplier
} from '../../../../backend/_types/database';

export interface DbSessionWithRelations {
  session: DbSession;
  items: Array<DbRestockItem>;
}

export interface DbSessionForSave {
  sessionRecord: {
    user_id: string;
    status: 'draft' | 'email_generated' | 'sent';
    name?: string;
  };
  itemRecords: Array<{
    session_id: string;
    product_name: string;
    supplier_name: string;
    supplier_email: string;
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
    product_name: string;
    supplier_name: string;
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
  static toDomain(dbSession: DbSession): RestockSession {
    // Convert database status to domain enum
    
    const domainStatus = this.mapStatusToDomain(dbSession.status);
    
    // For now, create session without items - items will be loaded separately
    const sessionValue: SessionValue = {
      id: dbSession.id,
      userId: dbSession.user_id,
      name: dbSession.name,
      status: domainStatus,
      items: [], // Items will be loaded separately in the repository
      createdAt: new Date(dbSession.created_at),
      // 🔧 REMOVED: updatedAt since database doesn't have updated_at column
    };

    return RestockSession.fromValue(sessionValue);
  }

  /**
   * Convert database session and items to domain RestockSession entity with items
   */
  static toDomainWithItems(dbSession: DbSession, dbItems: DbRestockItem[]): RestockSession {
    console.log('🔍 SessionMapper: dbSession data:', dbSession);
    console.log('🔍 SessionMapper: dbItems data:', dbItems);
    // Convert database status to domain enum
    const domainStatus = this.mapStatusToDomain(dbSession.status);
    
    // Convert database items to domain items
    const domainItems: RestockItemValue[] = dbItems.map((item: DbRestockItem) => ({
      productId: item.id,
      productName: item.product_name,
      quantity: item.quantity,
      supplierId: item.supplier_name, // Use supplier_name as ID since supplier_id doesn't exist in RestockItem
      supplierName: item.supplier_name,
      supplierEmail: item.supplier_email,
      notes: item.notes
    }));

    const sessionValue: SessionValue = {
      id: dbSession.id,
      userId: dbSession.user_id,
      name: dbSession.name,
      status: domainStatus,
      items: domainItems,
      createdAt: new Date(dbSession.created_at),
      // 🔧 REMOVED: updatedAt since database doesn't have updated_at column
    };

    return RestockSession.fromValue(sessionValue);
  }

  /**
   * Convert domain RestockSession to database insert format
   */
  static toDatabaseInsert(session: RestockSession): any {
    const value = session.toValue();
    
    return {
      user_id: value.userId,
      status: this.mapStatusToDatabase(value.status),
      name: value.name
    };
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
      product_name: item.productName,
      supplier_name: item.supplierName,
      supplier_email: item.supplierEmail,
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
      product_name: item.productName, // Use product_name instead of product_id
      supplier_name: item.supplierName, // Use supplier_name instead of supplier_id
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
