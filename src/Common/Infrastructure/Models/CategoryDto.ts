// src/Common/Infrastructure/Models/CategoryDto.ts
import { Expose } from 'class-transformer'
import ResponseDto from '@/src/Core/Infrastructure/Models/ResponseDto'
import { CategoryEntity } from '../../Domain/Entities/CategoryEntity'

export class CategoryDto extends ResponseDto<CategoryEntity> {
    @Expose()
    id!: string

    @Expose()
    code!: string

    @Expose()
    name!: string

    @Expose()
    description?: string

    @Expose()
    isActive!: boolean

    @Expose()
    isDeleted!: boolean

    toDomain(): CategoryEntity {
        return {
            id: this.id,
            code: this.code,
            name: this.name,
            description: this.description,
            isActive: this.isActive,
            isDeleted: this.isDeleted,
        }
    }
}
