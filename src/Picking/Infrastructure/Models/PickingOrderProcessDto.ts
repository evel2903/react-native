import { Expose, Type } from 'class-transformer'
import { PickingOrderProcessEntity, PickingOrderProcessItemEntity } from '../../Domain/Entities/PickingOrderProcessEntity'
import PickingOrderProcessItemDto from './PickingOrderProcessItemDto'

export default class PickingOrderProcessDto {
    @Expose()
    pickingOrderId!: string

    @Expose()
    @Type(() => PickingOrderProcessItemDto)
    items!: PickingOrderProcessItemDto[]

    @Expose()
    approvedIsValid!: boolean

    toDomain(): PickingOrderProcessEntity {
        return {
            pickingOrderId: this.pickingOrderId,
            items: Array.isArray(this.items) ? this.items.map(item => item.toDomain()) : [],
            approvedIsValid: this.approvedIsValid
        }
    }
}