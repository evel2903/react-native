// src/Common/Domain/Entities/SupplierEntity.ts
export interface SupplierEntity {
    id: string;
    code: string;
    name: string;
    legalName?: string;
    taxId?: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    phone?: string;
    email?: string;
    website?: string;
    description?: string;
    paymentTerms?: string;
    creditLimit?: string;
    contactPerson?: string;
    isActive: boolean;
    isDeleted: boolean;
}