// src/Tracking/Infrastructure/Models/GoodsTrackingDto.ts
import { Expose } from 'class-transformer'
import ResponseDto from '@/src/Core/Infrastructure/Models/ResponseDto'
import { GoodsTrackingEntity } from '../../Domain/Entities/GoodsTrackingEntity'

export class GoodsTrackingDto extends ResponseDto<GoodsTrackingEntity> {
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
    quantity!: string

    @Expose()
    lockQuantity!: string

    @Expose()
    availableQuantity!: string

    toDomain(): GoodsTrackingEntity {
        return {
            warehouseName: this.warehouseName,
            areaName: this.areaName,
            rowName: this.rowName,
            shelfName: this.shelfName,
            level: this.level,
            position: this.position,
            quantity: this.quantity,
            lockQuantity: this.lockQuantity,
            availableQuantity: this.availableQuantity,
        }
    }
}
