// src/Common/Infrastructure/Models/AreaDto.ts
import { Expose, Type } from 'class-transformer'
import ResponseDto from '@/src/Core/Infrastructure/Models/ResponseDto'
import { AreaEntity } from '../../Domain/Entities/AreaEntity'

export class AreaWarehouseDto {
    @Expose()
    isActive!: boolean

    @Expose()
    isDeleted!: boolean

    @Expose()
    code!: string

    @Expose()
    name!: string
}

export class AreaDto extends ResponseDto<AreaEntity> {
    @Expose()
    id!: string

    @Expose()
    code!: string

    @Expose()
    name!: string

    @Expose()
    description?: string

    @Expose()
    warehouseId!: string

    @Expose()
    @Type(() => AreaWarehouseDto)
    warehouse?: AreaWarehouseDto

    @Expose()
    isActive!: boolean

    @Expose()
    isDeleted!: boolean

    toDomain(): AreaEntity {
        return {
            id: this.id,
            code: this.code,
            name: this.name,
            description: this.description,
            warehouseId: this.warehouseId,
            warehouse: this.warehouse,
            isActive: this.isActive,
            isDeleted: this.isDeleted,
        }
    }
}
