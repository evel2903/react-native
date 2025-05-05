// src/Common/Infrastructure/Models/SupplierDto.ts
import { Expose } from 'class-transformer'
import ResponseDto from '@/src/Core/Infrastructure/Models/ResponseDto'
import { SupplierEntity } from '../../Domain/Entities/SupplierEntity'

export class SupplierDto extends ResponseDto<SupplierEntity> {
    @Expose()
    id!: string

    @Expose()
    code!: string

    @Expose()
    name!: string

    @Expose()
    legalName?: string

    @Expose()
    taxId?: string

    @Expose()
    address?: string

    @Expose()
    city?: string

    @Expose()
    country?: string

    @Expose()
    postalCode?: string

    @Expose()
    phone?: string

    @Expose()
    email?: string

    @Expose()
    website?: string

    @Expose()
    description?: string

    @Expose()
    paymentTerms?: string

    @Expose()
    creditLimit?: string

    @Expose()
    contactPerson?: string

    @Expose()
    isActive!: boolean

    @Expose()
    isDeleted!: boolean

    toDomain(): SupplierEntity {
        return {
            id: this.id,
            code: this.code,
            name: this.name,
            legalName: this.legalName,
            taxId: this.taxId,
            address: this.address,
            city: this.city,
            country: this.country,
            postalCode: this.postalCode,
            phone: this.phone,
            email: this.email,
            website: this.website,
            description: this.description,
            paymentTerms: this.paymentTerms,
            creditLimit: this.creditLimit,
            contactPerson: this.contactPerson,
            isActive: this.isActive,
            isDeleted: this.isDeleted,
        }
    }
}
