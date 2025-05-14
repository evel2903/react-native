import { Expose, Type } from 'class-transformer'
import StorageVoucherItemDto from './StorageVoucherItemDto'
import { StorageVoucherDetailEntity } from '../../Domain/Entities/StorageVoucherEntity'

export default class StorageVoucherDetailDto {
    @Expose()
    id!: string

    @Expose()
    updatedAt!: string

    @Expose()
    createdAt!: string

    @Expose()
    isDeleted!: boolean

    @Expose()
    storageVoucherId!: string

    @Expose()
    stockId!: string

    @Expose()
    code!: string

    @Expose()
    name!: string

    @Expose()
    supplier!: string

    @Expose()
    lotNumber!: string

    @Expose()
    expiryDate!: string

    @Expose()
    cost!: string

    @Expose()
    quantity!: number

    @Expose()
    notes!: string

    @Expose()
    status!: string

    @Expose()
    @Type(() => StorageVoucherItemDto)
    storageVoucherItems!: StorageVoucherItemDto[]

    toDomain(): StorageVoucherDetailEntity {
        return {
            id: this.id,
            updatedAt: this.updatedAt,
            createdAt: this.createdAt,
            isDeleted: this.isDeleted,
            storageVoucherId: this.storageVoucherId,
            stockId: this.stockId,
            code: this.code,
            name: this.name,
            supplier: this.supplier,
            lotNumber: this.lotNumber,
            expiryDate: this.expiryDate,
            cost: this.cost,
            quantity: this.quantity,
            notes: this.notes,
            status: this.status,
            storageVoucherItems: this.storageVoucherItems.map(item =>
                item.toDomain()
            ),
        }
    }
}
