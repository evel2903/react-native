// src/Common/Infrastructure/Implementations/MasterDataRepository.ts
import { injectable, inject } from 'inversiland'
import { IMasterDataRepository } from '../../Domain/Specifications/IMasterDataRepository'
import { CategoryEntity } from '../../Domain/Entities/CategoryEntity'
import { UnitEntity } from '../../Domain/Entities/UnitEntity'
import { SupplierEntity } from '../../Domain/Entities/SupplierEntity'
import { GoodsEntity } from '../../Domain/Entities/GoodsEntity'
import { WarehouseEntity } from '../../Domain/Entities/WarehouseEntity'
import { AreaEntity } from '../../Domain/Entities/AreaEntity'
import { RowEntity } from '../../Domain/Entities/RowEntity'
import { ShelfEntity } from '../../Domain/Entities/ShelfEntity'
import IHttpClient, {
    IHttpClientToken,
} from '@/src/Core/Domain/Specifications/IHttpClient'
import { plainToInstance } from 'class-transformer'
import { CategoryDto } from '../Models/CategoryDto'
import { UnitDto } from '../Models/UnitDto'
import { SupplierDto } from '../Models/SupplierDto'
import { GoodsDto } from '../Models/GoodsDto'
import { WarehouseDto } from '../Models/WarehouseDto'
import { AreaDto } from '../Models/AreaDto'
import { RowDto } from '../Models/RowDto'
import { ShelfDto } from '../Models/ShelfDto'

@injectable()
class MasterDataRepository implements IMasterDataRepository {
    constructor(
        @inject(IHttpClientToken) private readonly httpClient: IHttpClient
    ) {}

    // Existing methods
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

    // New methods for Warehouses, Areas, Rows, and Shelfs
    public async getWarehouses(): Promise<WarehouseEntity[]> {
        try {
            const response: any = await this.httpClient.get('/api/warehouses')

            if (!response.data || !Array.isArray(response.data)) {
                throw new Error('Unexpected API response format for warehouses')
            }

            return response.data.map((item: any) =>
                plainToInstance(WarehouseDto, item).toDomain()
            )
        } catch (error) {
            console.error('Error fetching warehouses:', error)
            throw error
        }
    }

    public async getAreas(): Promise<AreaEntity[]> {
        try {
            const response: any = await this.httpClient.get('/api/areas')

            if (!response.data || !Array.isArray(response.data)) {
                throw new Error('Unexpected API response format for areas')
            }

            return response.data.map((item: any) =>
                plainToInstance(AreaDto, item).toDomain()
            )
        } catch (error) {
            console.error('Error fetching areas:', error)
            throw error
        }
    }

    public async getRows(): Promise<RowEntity[]> {
        try {
            const response: any = await this.httpClient.get('/api/rows')

            if (!response.data || !Array.isArray(response.data)) {
                throw new Error('Unexpected API response format for rows')
            }

            return response.data.map((item: any) =>
                plainToInstance(RowDto, item).toDomain()
            )
        } catch (error) {
            console.error('Error fetching rows:', error)
            throw error
        }
    }

    public async getShelfs(): Promise<ShelfEntity[]> {
        try {
            const response: any = await this.httpClient.get('/api/shelfs')

            if (!response.data || !Array.isArray(response.data)) {
                throw new Error('Unexpected API response format for shelfs')
            }

            return response.data.map((item: any) =>
                plainToInstance(ShelfDto, item).toDomain()
            )
        } catch (error) {
            console.error('Error fetching shelfs:', error)
            throw error
        }
    }

    public async getWarehouseById(id: string): Promise<WarehouseEntity | null> {
        try {
            const response: any = await this.httpClient.get(
                `/api/warehouses/${id}`
            )

            if (!response.data) {
                return null
            }

            return plainToInstance(WarehouseDto, response.data).toDomain()
        } catch (error) {
            console.error(`Error fetching warehouse with ID ${id}:`, error)
            return null
        }
    }

    public async getAreaById(id: string): Promise<AreaEntity | null> {
        try {
            const response: any = await this.httpClient.get(`/api/areas/${id}`)

            if (!response.data) {
                return null
            }

            return plainToInstance(AreaDto, response.data).toDomain()
        } catch (error) {
            console.error(`Error fetching area with ID ${id}:`, error)
            return null
        }
    }

    public async getRowById(id: string): Promise<RowEntity | null> {
        try {
            const response: any = await this.httpClient.get(`/api/rows/${id}`)

            if (!response.data) {
                return null
            }

            return plainToInstance(RowDto, response.data).toDomain()
        } catch (error) {
            console.error(`Error fetching row with ID ${id}:`, error)
            return null
        }
    }

    public async getShelfById(id: string): Promise<ShelfEntity | null> {
        try {
            const response: any = await this.httpClient.get(`/api/shelfs/${id}`)

            if (!response.data) {
                return null
            }

            return plainToInstance(ShelfDto, response.data).toDomain()
        } catch (error) {
            console.error(`Error fetching shelf with ID ${id}:`, error)
            return null
        }
    }
}

export default MasterDataRepository