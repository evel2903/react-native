// src/Common/Infrastructure/Models/ShelfDto.ts
import { Expose, Type } from 'class-transformer'
import ResponseDto from '@/src/Core/Infrastructure/Models/ResponseDto'
import { ShelfEntity } from '../../Domain/Entities/ShelfEntity'

export class ShelfRowAreaWarehouseDto {
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

export class ShelfRowAreaDto {
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
    description!: string

    @Expose()
    warehouseId!: string

    @Expose()
    @Type(() => ShelfRowAreaWarehouseDto)
    warehouse?: ShelfRowAreaWarehouseDto
}

export class ShelfRowDto {
    @Expose()
    isActive!: boolean

    @Expose()
    isDeleted!: boolean

    @Expose()
    code!: string

    @Expose()
    name!: string

    @Expose()
    @Type(() => ShelfRowAreaDto)
    area?: ShelfRowAreaDto
}

export class ShelfDto extends ResponseDto<ShelfEntity> {
    @Expose()
    id!: string

    @Expose()
    code!: string

    @Expose()
    name!: string

    @Expose()
    rowId!: string

    @Expose()
    levelCount!: number

    @Expose()
    positionsPerLevel!: number

    @Expose()
    @Type(() => ShelfRowDto)
    row?: ShelfRowDto

    @Expose()
    isActive!: boolean

    @Expose()
    isDeleted!: boolean

    toDomain(): ShelfEntity {
        return {
            id: this.id,
            code: this.code,
            name: this.name,
            rowId: this.rowId,
            levelCount: this.levelCount,
            positionsPerLevel: this.positionsPerLevel,
            row: this.row,
            isActive: this.isActive,
            isDeleted: this.isDeleted,
        }
    }
}