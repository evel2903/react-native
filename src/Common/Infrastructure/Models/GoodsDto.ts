// src/Common/Infrastructure/Models/GoodsDto.ts
import { Expose, Type } from 'class-transformer';
import ResponseDto from '@/src/Core/Infrastructure/Models/ResponseDto';
import { GoodsEntity } from '../../Domain/Entities/GoodsEntity';

export class GoodsUnitDto {
    @Expose()
    name!: string;

    @Expose()
    isActive!: boolean;

    @Expose()
    isDeleted!: boolean;
}

export class GoodsCategoryDto {
    @Expose()
    code!: string;

    @Expose()
    name!: string;

    @Expose()
    isActive!: boolean;

    @Expose()
    isDeleted!: boolean;
}

export class GoodsDto extends ResponseDto<GoodsEntity> {
    @Expose()
    id!: string;

    @Expose()
    code!: string;

    @Expose()
    name!: string;

    @Expose()
    customCode?: string | null;

    @Expose()
    description?: string;

    @Expose()
    imageName?: string | null;

    @Expose()
    imageUrl?: string | null;

    @Expose()
    unitId!: string;

    @Expose()
    @Type(() => GoodsUnitDto)
    unit?: GoodsUnitDto;

    @Expose()
    categoryId!: string;

    @Expose()
    @Type(() => GoodsCategoryDto)
    category?: GoodsCategoryDto;

    @Expose()
    isActive!: boolean;

    @Expose()
    isDeleted!: boolean;

    @Expose()
    stockInAlertQuantity?: number;

    toDomain(): GoodsEntity {
        return {
            id: this.id,
            code: this.code,
            name: this.name,
            customCode: this.customCode,
            description: this.description,
            imageName: this.imageName,
            imageUrl: this.imageUrl,
            unitId: this.unitId,
            unit: this.unit,
            categoryId: this.categoryId,
            category: this.category,
            isActive: this.isActive,
            isDeleted: this.isDeleted,
            stockInAlertQuantity: this.stockInAlertQuantity
        };
    }
}