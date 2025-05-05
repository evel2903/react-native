import { Expose } from 'class-transformer'

export class SupplierDto {
    @Expose()
    id!: string

    @Expose()
    code!: string

    @Expose()
    name!: string

    @Expose()
    isActive!: boolean

    @Expose()
    isDeleted!: boolean
}
