// src/Common/Infrastructure/Implementations/MasterDataRepository.ts
import { injectable, inject } from 'inversiland'
import { IMasterDataRepository } from '../../Domain/Specifications/IMasterDataRepository'
import { CategoryEntity } from '../../Domain/Entities/CategoryEntity'
import { UnitEntity } from '../../Domain/Entities/UnitEntity'
import { SupplierEntity } from '../../Domain/Entities/SupplierEntity'
import { GoodsEntity } from '../../Domain/Entities/GoodsEntity'
import IHttpClient, {
    IHttpClientToken,
} from '@/src/Core/Domain/Specifications/IHttpClient'
import { plainToInstance } from 'class-transformer'
import { CategoryDto } from '../Models/CategoryDto'
import { UnitDto } from '../Models/UnitDto'
import { SupplierDto } from '../Models/SupplierDto'
import { GoodsDto } from '../Models/GoodsDto'

@injectable()
class MasterDataRepository implements IMasterDataRepository {
    constructor(
        @inject(IHttpClientToken) private readonly httpClient: IHttpClient
    ) {}

    public async getCategories(): Promise<CategoryEntity[]> {
        try {
            const response: any = await this.httpClient.get('/api/categories')

            if (!response.data || !Array.isArray(response.data)) {
                throw new Error('Unexpected API response format for categories')
            }

            return response.data.map((item: any) =>
                plainToInstance(CategoryDto, item).toDomain()
            )
        } catch (error) {
            console.error('Error fetching categories:', error)
            throw error
        }
    }

    public async getUnits(): Promise<UnitEntity[]> {
        try {
            const response: any = await this.httpClient.get('/api/units')

            if (!response.data || !Array.isArray(response.data)) {
                throw new Error('Unexpected API response format for units')
            }

            return response.data.map((item: any) =>
                plainToInstance(UnitDto, item).toDomain()
            )
        } catch (error) {
            console.error('Error fetching units:', error)
            throw error
        }
    }

    public async getSuppliers(): Promise<SupplierEntity[]> {
        try {
            const response: any = await this.httpClient.get('/api/suppliers')

            if (!response.data || !Array.isArray(response.data)) {
                throw new Error('Unexpected API response format for suppliers')
            }

            return response.data.map((item: any) =>
                plainToInstance(SupplierDto, item).toDomain()
            )
        } catch (error) {
            console.error('Error fetching suppliers:', error)
            throw error
        }
    }

    public async getGoods(): Promise<GoodsEntity[]> {
        try {
            const response: any = await this.httpClient.get('/api/goods')

            if (!response.data || !Array.isArray(response.data)) {
                throw new Error('Unexpected API response format for goods')
            }

            return response.data.map((item: any) =>
                plainToInstance(GoodsDto, item).toDomain()
            )
        } catch (error) {
            console.error('Error fetching goods:', error)
            throw error
        }
    }

    // Implement the new method to fetch goods by code
    public async getGoodsByCode(code: string): Promise<GoodsEntity | null> {
        try {
            const response: any = await this.httpClient.get(
                `/api/goods?code=${encodeURIComponent(code)}`
            )

            if (
                !response.data ||
                !Array.isArray(response.data) ||
                response.data.length === 0
            ) {
                return null
            }

            // Return the first item from the response data array
            return plainToInstance(GoodsDto, response.data[0]).toDomain()
        } catch (error) {
            console.error(`Error fetching goods with code ${code}:`, error)
            return null
        }
    }

    public async getCategoryById(id: string): Promise<CategoryEntity | null> {
        try {
            const response: any = await this.httpClient.get(
                `/api/categories/${id}`
            )

            if (!response.data) {
                return null
            }

            return plainToInstance(CategoryDto, response.data).toDomain()
        } catch (error) {
            console.error(`Error fetching category with ID ${id}:`, error)
            return null
        }
    }

    public async getUnitById(id: string): Promise<UnitEntity | null> {
        try {
            const response: any = await this.httpClient.get(`/api/units/${id}`)

            if (!response.data) {
                return null
            }

            return plainToInstance(UnitDto, response.data).toDomain()
        } catch (error) {
            console.error(`Error fetching unit with ID ${id}:`, error)
            return null
        }
    }

    public async getSupplierById(id: string): Promise<SupplierEntity | null> {
        try {
            const response: any = await this.httpClient.get(
                `/api/suppliers/${id}`
            )

            if (!response.data) {
                return null
            }

            return plainToInstance(SupplierDto, response.data).toDomain()
        } catch (error) {
            console.error(`Error fetching supplier with ID ${id}:`, error)
            return null
        }
    }

    public async getGoodsById(id: string): Promise<GoodsEntity | null> {
        try {
            const response: any = await this.httpClient.get(`/api/goods/${id}`)

            if (!response.data) {
                return null
            }

            return plainToInstance(GoodsDto, response.data).toDomain()
        } catch (error) {
            console.error(`Error fetching goods with ID ${id}:`, error)
            return null
        }
    }
}

export default MasterDataRepository
