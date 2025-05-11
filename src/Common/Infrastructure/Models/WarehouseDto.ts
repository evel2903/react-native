// src/Common/Infrastructure/Models/WarehouseDto.ts
import { Expose } from 'class-transformer'
import ResponseDto from '@/src/Core/Infrastructure/Models/ResponseDto'
import { WarehouseEntity } from '../../Domain/Entities/WarehouseEntity'

export class WarehouseDto extends ResponseDto<WarehouseEntity> {
    @Expose()
    id!: string

    @Expose()
    code!: string

    @Expose()
    name!: string

    @Expose()
    location?: string

    @Expose()
    description?: string

    @Expose()
    isActive!: boolean

    @Expose()
    isDeleted!: boolean

    toDomain(): WarehouseEntity {
        return {
            id: this.id,
            code: this.code,
            name: this.name,
            location: this.location,
            description: this.description,
            isActive: this.isActive,
            isDeleted: this.isDeleted,
        }
    }
}