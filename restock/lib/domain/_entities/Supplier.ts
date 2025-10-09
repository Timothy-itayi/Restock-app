/**
 * DOMAIN ENTITY: Supplier
 * 
 * Pure business logic - NO external dependencies
 * Represents a supplier that provides products
 */

export interface SupplierValue {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly notes?: string;
  readonly createdAt: Date;
}

export class Supplier {
  private constructor(private readonly value: SupplierValue) {}

  // Factory methods
  static create(params: {
    id: string;
    userId: string;
    name: string;
    email: string;
    phone?: string;
    notes?: string;
    createdAt?: Date;
  }): Supplier {
    // Business rule: Name must not be empty
    if (!params.name.trim()) {
      throw new Error('Supplier name cannot be empty');
    }

    // Business rule: Email must be valid
    if (!params.email.trim() || !Supplier.isValidEmail(params.email)) {
      throw new Error('Supplier email must be valid');
    }

    return new Supplier({
      id: params.id,
      userId: params.userId,
      name: params.name.trim(),
      email: params.email.trim().toLowerCase(),
      phone: params.phone?.trim(),
      notes: params.notes?.trim(),
      createdAt: params.createdAt || new Date(),
    });
  }

  static fromValue(value: SupplierValue): Supplier {
    return new Supplier(value);
  }

  // Getters
  get id(): string { return this.value.id; }
  get userId(): string { return this.value.userId; }
  get name(): string { return this.value.name; }
  get email(): string { return this.value.email; }
  get phone(): string | undefined { return this.value.phone; }
  get notes(): string | undefined { return this.value.notes; }
  get createdAt(): Date { return this.value.createdAt; }

  // Business logic methods
  updateName(name: string): Supplier {
    if (!name.trim()) {
      throw new Error('Supplier name cannot be empty');
    }

    return new Supplier({
      ...this.value,
      name: name.trim(),
    });
  }

  updateEmail(email: string): Supplier {
    if (!email.trim() || !Supplier.isValidEmail(email)) {
      throw new Error('Supplier email must be valid');
    }

    return new Supplier({
      ...this.value,
      email: email.trim().toLowerCase(),
    });
  }

  updatePhone(phone?: string): Supplier {
    return new Supplier({
      ...this.value,
      phone: phone?.trim(),
    });
  }

  updateNotes(notes?: string): Supplier {
    return new Supplier({
      ...this.value,
      notes: notes?.trim(),
    });
  }

  // Query methods
  matches(searchTerm: string): boolean {
    const term = searchTerm.toLowerCase();
    return (
      this.value.name.toLowerCase().includes(term) ||
      this.value.email.toLowerCase().includes(term) ||
      (this.value.phone ? this.value.phone.includes(term) : false)
    );
  }

  hasPhone(): boolean {
    return !!this.value.phone;
  }

  hasNotes(): boolean {
    return !!this.value.notes;
  }

  // Validation helpers
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Export for persistence
  toValue(): SupplierValue {
    return { ...this.value };
  }
}
