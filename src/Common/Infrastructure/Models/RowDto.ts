// src/Common/Infrastructure/Models/RowDto.ts
import { Expose, Type } from 'class-transformer'
import ResponseDto from '@/src/Core/Infrastructure/Models/ResponseDto'
import { RowEntity } from '../../Domain/Entities/RowEntity'

export class RowAreaWarehouseDto {
    @Expose()
    isActive!: boolean

    @Expose()
    isDeleted!: boolean

    @Expose()
    id!: string

    @Expose()
    updatedAt!: string

    @Expose()
    createdAt!: string

    @Expose()
    code!: string

    @Expose()
    name!: string

    @Expose()
    location!: string

    @Expose()
    description!: string
}

export class RowAreaDto {
    @Expose()
    isActive!: boolean

    @Expose()
    isDeleted!: boolean

    @Expose()
    code!: string

    @Expose()
    name!: string

    @Expose()
    warehouseId!: string

    @Expose()
    @Type(() => RowAreaWarehouseDto)
    warehouse?: RowAreaWarehouseDto
}

export class RowDto extends ResponseDto<RowEntity> {
    @Expose()
    id!: string

    @Expose()
    code!: string

    @Expose()
    name!: string

    @Expose()
    areaId!: string

    @Expose()
    @Type(() => RowAreaDto)
    area?: RowAreaDto

    @Expose()
    isActive!: boolean

    @Expose()
    isDeleted!: boolean

    toDomain(): RowEntity {
        return {
            id: this.id,
            code: this.code,
            name: this.name,
            areaId: this.areaId,
            area: this.area,
            isActive: this.isActive,
            isDeleted: this.isDeleted,
        }
    }
}
