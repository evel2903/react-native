import { Expose } from 'class-transformer'
import { PickingOrderItemEntity } from '../../Domain/Entities/PickingOrderEntity'

export default class PickingOrderItemDto {
    @Expose()
    id!: string

    @Expose()
    updatedAt!: string

    @Expose()
    createdAt!: string

    @Expose()
    isDeleted!: boolean

    @Expose()
    pickingOrderDetailId!: string

    @Expose()
    stockId!: string

    @Expose()
    shelfId!: string

    @Expose()
    rowId!: string

    @Expose()
    areaId!: string

    @Expose()
    warehouseId!: string

    @Expose()
    shelfName!: string

    @Expose()
    rowName!: string

    @Expose()
    areaName!: string

    @Expose()
    warehouseName!: string

    @Expose()
    quantity!: number

    @Expose()
    level!: number

    @Expose()
    position!: number

    @Expose()
    status!: string

    toDomain(): PickingOrderItemEntity {
        return {
            id: this.id,
            updatedAt: this.updatedAt,
            createdAt: this.createdAt,
            isDeleted: this.isDeleted,
            pickingOrderDetailId: this.pickingOrderDetailId,
            stockId: this.stockId,
            shelfId: this.shelfId,
            rowId: this.rowId,
            areaId: this.areaId,
            warehouseId: this.warehouseId,
            shelfName: this.shelfName,
            rowName: this.rowName,
            areaName: this.areaName,
            warehouseName: this.warehouseName,
            quantity: this.quantity,
            level: this.level,
            position: this.position,
            status: this.status,
        }
    }
}