import { Expose } from 'class-transformer'

export class StockInProductItemDto {
    @Expose()
    productId!: string

    @Expose()
    productName!: string

    @Expose()
    quantity!: number

    @Expose()
    unit!: string

    @Expose()
    price?: number
}
