import { Expose, Type } from 'class-transformer'
import { PickingOrderDetailEntity } from '../../Domain/Entities/PickingOrderEntity'
import PickingOrderItemDto from './PickingOrderItemDto'

export default class PickingOrderDetailDto {
    @Expose()
    id!: string

    @Expose()
    updatedAt!: string

    @Expose()
    createdAt!: string

    @Expose()
    isDeleted!: boolean

    @Expose()
    pickingOrderId!: string

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
    price!: string

    @Expose()
    quantity!: number

    @Expose()
    notes!: string

    @Expose()
    status!: string

    @Expose()
    @Type(() => PickingOrderItemDto)
    pickingOrderItems!: PickingOrderItemDto[]

    toDomain(): PickingOrderDetailEntity {
        return {
            id: this.id,
            updatedAt: this.updatedAt,
            createdAt: this.createdAt,
            isDeleted: this.isDeleted,
            pickingOrderId: this.pickingOrderId,
            stockId: this.stockId,
            code: this.code,
            name: this.name,
            supplier: this.supplier,
            lotNumber: this.lotNumber,
            expiryDate: this.expiryDate,
            price: this.price,
            quantity: this.quantity,
            notes: this.notes,
            status: this.status,
            pickingOrderItems: this.pickingOrderItems.map(item => item.toDomain()),
        }
    }
}