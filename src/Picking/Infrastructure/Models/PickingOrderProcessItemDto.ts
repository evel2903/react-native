import { Expose } from 'class-transformer'
import { PickingOrderProcessItemEntity } from '../../Domain/Entities/PickingOrderProcessEntity'

export default class PickingOrderProcessItemDto {
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
    pickingOrderDetailId!: string

    @Expose()
    stockLocationId!: string

    @Expose()
    requestedQuantity!: number

    @Expose()
    quantityCanPicked!: number

    @Expose()
    quantityPicked!: number

    @Expose()
    warehouseName!: string

    @Expose()
    areaName!: string

    @Expose()
    rowName!: string

    @Expose()
    shelfName!: string

    @Expose()
    level!: number

    @Expose()
    position!: number

    @Expose()
    isActive!: boolean

    // New fields for goods information
    @Expose()
    goodsId!: string

    @Expose()
    goodsCode!: string

    @Expose()
    goodsName!: string

    toDomain(): PickingOrderProcessItemEntity {
        return {
            id: this.id,
            updatedAt: this.updatedAt,
            createdAt: this.createdAt,
            isDeleted: this.isDeleted,
            pickingOrderId: this.pickingOrderId,
            pickingOrderDetailId: this.pickingOrderDetailId,
            stockLocationId: this.stockLocationId,
            requestedQuantity: this.requestedQuantity,
            quantityCanPicked: this.quantityCanPicked,
            quantityPicked: this.quantityPicked,
            warehouseName: this.warehouseName,
            areaName: this.areaName,
            rowName: this.rowName,
            shelfName: this.shelfName,
            level: this.level,
            position: this.position,
            isActive: this.isActive,
            // Map new fields
            goodsId: this.goodsId,
            goodsCode: this.goodsCode,
            goodsName: this.goodsName,
            updatedQuantityPicked: this.quantityPicked, // Initialize with current picked quantity
        }
    }
}
