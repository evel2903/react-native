// src/Tracking/Infrastructure/Models/LocationTrackingDto.ts
import { Expose } from 'class-transformer'
import ResponseDto from '@/src/Core/Infrastructure/Models/ResponseDto'
import { LocationTrackingEntity } from '../../Domain/Entities/LocationTrackingEntity'

export class LocationTrackingDto extends ResponseDto<LocationTrackingEntity> {
    @Expose()
    goodsCode!: string

    @Expose()
    goodsName!: string

    @Expose()
    quantity!: string

    @Expose()
    lockQuantity!: string

    @Expose()
    availableQuantity!: string

    toDomain(): LocationTrackingEntity {
        return {
            goodsCode: this.goodsCode,
            goodsName: this.goodsName,
            quantity: this.quantity,
            lockQuantity: this.lockQuantity,
            availableQuantity: this.availableQuantity,
        }
    }
}
