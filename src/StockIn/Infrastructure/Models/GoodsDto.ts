import { Expose } from 'class-transformer';

export class GoodsDto {
    @Expose()
    id!: string;

    @Expose()
    name!: string;
    
    // Add other properties as needed
}