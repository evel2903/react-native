// src/Common/Infrastructure/Models/UnitDto.ts
import { Expose } from 'class-transformer';
import ResponseDto from '@/src/Core/Infrastructure/Models/ResponseDto';
import { UnitEntity } from '../../Domain/Entities/UnitEntity';

export class UnitDto extends ResponseDto<UnitEntity> {
    @Expose()
    id!: string;

    @Expose()
    name!: string;

    @Expose()
    description?: string | null;

    @Expose()
    isActive!: boolean;

    @Expose()
    isDeleted!: boolean;

    toDomain(): UnitEntity {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            isActive: this.isActive,
            isDeleted: this.isDeleted
        };
    }
}