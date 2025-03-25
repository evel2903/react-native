import { Expose } from 'class-transformer'

export class StockOutProductItemDto {
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
