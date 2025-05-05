import { Expose, Type } from 'class-transformer'
import { GoodsDto } from './GoodsDto'

export class StockInDetailItemDto {
    @Expose()
    id!: string

    @Expose()
    goodsId!: string

    @Expose()
    quantity!: number

    @Expose()
    price!: string

    @Expose()
    expiryDate?: string

    @Expose()
    notes?: string

    @Expose()
    @Type(() => GoodsDto)
    goods?: GoodsDto | null
}
