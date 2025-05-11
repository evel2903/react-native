// src/Common/Presentation/Stores/MasterDataStore/MasterDataStore.ts
import { injectable, inject } from 'inversiland'
import { makeAutoObservable, runInAction } from 'mobx'
import MasterDataStoreState from '../../Types/MasterDataStoreState'
import { GetCategoriesUseCase } from '@/src/Common/Application/UseCases/GetCategoriesUseCase'
import { GetUnitsUseCase } from '@/src/Common/Application/UseCases/GetUnitsUseCase'
import { GetSuppliersUseCase } from '@/src/Common/Application/UseCases/GetSuppliersUseCase'
import { GetGoodsUseCase } from '@/src/Common/Application/UseCases/GetGoodsUseCase'
import { GetGoodsByCodeUseCase } from '@/src/Common/Application/UseCases/GetGoodsByCodeUseCase'
import { GetWarehousesUseCase } from '@/src/Common/Application/UseCases/GetWarehousesUseCase'
import { GetAreasUseCase } from '@/src/Common/Application/UseCases/GetAreasUseCase'
import { GetRowsUseCase } from '@/src/Common/Application/UseCases/GetRowsUseCase'
import { GetShelfsUseCase } from '@/src/Common/Application/UseCases/GetShelfsUseCase'

import { CategoryEntity } from '@/src/Common/Domain/Entities/CategoryEntity'
import { UnitEntity } from '@/src/Common/Domain/Entities/UnitEntity'
import { SupplierEntity } from '@/src/Common/Domain/Entities/SupplierEntity'
import { GoodsEntity } from '@/src/Common/Domain/Entities/GoodsEntity'
import { WarehouseEntity } from '@/src/Common/Domain/Entities/WarehouseEntity'
import { AreaEntity } from '@/src/Common/Domain/Entities/AreaEntity'
import { RowEntity } from '@/src/Common/Domain/Entities/RowEntity'
import { ShelfEntity } from '@/src/Common/Domain/Entities/ShelfEntity'

@injectable()
export class MasterDataStore implements MasterDataStoreState {
    categories = {
        isLoading: false,
        data: [] as CategoryEntity[],
        error: null as string | null,
    }

    units = {
        isLoading: false,
        data: [] as UnitEntity[],
        error: null as string | null,
    }

    suppliers = {
        isLoading: false,
        data: [] as SupplierEntity[],
        error: null as string | null,
    }

    goods = {
        isLoading: false,
        data: [] as GoodsEntity[],
        error: null as string | null,
    }

    warehouses = {
        isLoading: false,
        data: [] as WarehouseEntity[],
        error: null as string | null,
    }

    areas = {
        isLoading: false,
        data: [] as AreaEntity[],
        error: null as string | null,
    }

    rows = {
        isLoading: false,
        data: [] as RowEntity[],
        error: null as string | null,
    }

    shelfs = {
        isLoading: false,
        data: [] as ShelfEntity[],
        error: null as string | null,
    }

    constructor(
        @inject(GetCategoriesUseCase)
        private readonly getCategoriesUseCase: GetCategoriesUseCase,
        @inject(GetUnitsUseCase)
        private readonly getUnitsUseCase: GetUnitsUseCase,
        @inject(GetSuppliersUseCase)
        private readonly getSuppliersUseCase: GetSuppliersUseCase,
        @inject(GetGoodsUseCase)
        private readonly getGoodsUseCase: GetGoodsUseCase,
        @inject(GetGoodsByCodeUseCase)
        private readonly getGoodsByCodeUseCase: GetGoodsByCodeUseCase,
        @inject(GetWarehousesUseCase)
        private readonly getWarehousesUseCase: GetWarehousesUseCase,
        @inject(GetAreasUseCase)
        private readonly getAreasUseCase: GetAreasUseCase,
        @inject(GetRowsUseCase)
        private readonly getRowsUseCase: GetRowsUseCase,
        @inject(GetShelfsUseCase)
        private readonly getShelfsUseCase: GetShelfsUseCase
    ) {
        makeAutoObservable(this)
    }

    // Categories methods
    async loadCategories() {
        if (this.categories.data.length > 0) return // Already loaded

        this.categories.isLoading = true
        this.categories.error = null

        try {
            const categories = await this.getCategoriesUseCase.execute()

            runInAction(() => {
                this.categories.data = categories
                this.categories.isLoading = false
            })
        } catch (error) {
            runInAction(() => {
                this.categories.error =
                    error instanceof Error
                        ? error.message
                        : 'Failed to load categories'
                this.categories.isLoading = false
            })
        }
    }

    getCategoryById(id: string): CategoryEntity | undefined {
        return this.categories.data.find(item => item.id === id)
    }

    // Units methods
    async loadUnits() {
        if (this.units.data.length > 0) return // Already loaded

        this.units.isLoading = true
        this.units.error = null

        try {
            const units = await this.getUnitsUseCase.execute()

            runInAction(() => {
                this.units.data = units
                this.units.isLoading = false
            })
        } catch (error) {
            runInAction(() => {
                this.units.error =
                    error instanceof Error
                        ? error.message
                        : 'Failed to load units'
                this.units.isLoading = false
            })
        }
    }

    getUnitById(id: string): UnitEntity | undefined {
        return this.units.data.find(item => item.id === id)
    }

    // Suppliers methods
    async loadSuppliers() {
        if (this.suppliers.data.length > 0) return // Already loaded

        this.suppliers.isLoading = true
        this.suppliers.error = null

        try {
            const suppliers = await this.getSuppliersUseCase.execute()

            runInAction(() => {
                this.suppliers.data = suppliers
                this.suppliers.isLoading = false
            })
        } catch (error) {
            runInAction(() => {
                this.suppliers.error =
                    error instanceof Error
                        ? error.message
                        : 'Failed to load suppliers'
                this.suppliers.isLoading = false
            })
        }
    }

    getSupplierById(id: string): SupplierEntity | undefined {
        return this.suppliers.data.find(item => item.id === id)
    }

    // Goods methods
    async loadGoods() {
        if (this.goods.data.length > 0) return // Already loaded

        this.goods.isLoading = true
        this.goods.error = null

        try {
            const goods = await this.getGoodsUseCase.execute()

            runInAction(() => {
                this.goods.data = goods
                this.goods.isLoading = false
            })
        } catch (error) {
            runInAction(() => {
                this.goods.error =
                    error instanceof Error
                        ? error.message
                        : 'Failed to load goods'
                this.goods.isLoading = false
            })
        }
    }

    getGoodsById(id: string): GoodsEntity | undefined {
        return this.goods.data.find(item => item.id === id)
    }

    async getGoodsByCode(code: string): Promise<GoodsEntity | null> {
        try {
            return await this.getGoodsByCodeUseCase.execute(code)
        } catch (error) {
            console.error(`Error fetching goods with code ${code}:`, error)
            return null
        }
    }

    // Warehouses methods
    async loadWarehouses() {
        if (this.warehouses.data.length > 0) return // Already loaded

        this.warehouses.isLoading = true
        this.warehouses.error = null

        try {
            const warehouses = await this.getWarehousesUseCase.execute()

            runInAction(() => {
                this.warehouses.data = warehouses
                this.warehouses.isLoading = false
            })
        } catch (error) {
            runInAction(() => {
                this.warehouses.error =
                    error instanceof Error
                        ? error.message
                        : 'Failed to load warehouses'
                this.warehouses.isLoading = false
            })
        }
    }

    getWarehouseById(id: string): WarehouseEntity | undefined {
        return this.warehouses.data.find(item => item.id === id)
    }

    // Areas methods
    async loadAreas() {
        if (this.areas.data.length > 0) return // Already loaded

        this.areas.isLoading = true
        this.areas.error = null

        try {
            const areas = await this.getAreasUseCase.execute()

            runInAction(() => {
                this.areas.data = areas
                this.areas.isLoading = false
            })
        } catch (error) {
            runInAction(() => {
                this.areas.error =
                    error instanceof Error
                        ? error.message
                        : 'Failed to load areas'
                this.areas.isLoading = false
            })
        }
    }

    getAreaById(id: string): AreaEntity | undefined {
        return this.areas.data.find(item => item.id === id)
    }

    // Rows methods
    async loadRows() {
        if (this.rows.data.length > 0) return // Already loaded

        this.rows.isLoading = true
        this.rows.error = null

        try {
            const rows = await this.getRowsUseCase.execute()

            runInAction(() => {
                this.rows.data = rows
                this.rows.isLoading = false
            })
        } catch (error) {
            runInAction(() => {
                this.rows.error =
                    error instanceof Error
                        ? error.message
                        : 'Failed to load rows'
                this.rows.isLoading = false
            })
        }
    }

    getRowById(id: string): RowEntity | undefined {
        return this.rows.data.find(item => item.id === id)
    }

    // Shelfs methods
    async loadShelfs() {
        if (this.shelfs.data.length > 0) return // Already loaded

        this.shelfs.isLoading = true
        this.shelfs.error = null

        try {
            const shelfs = await this.getShelfsUseCase.execute()

            runInAction(() => {
                this.shelfs.data = shelfs
                this.shelfs.isLoading = false
            })
        } catch (error) {
            runInAction(() => {
                this.shelfs.error =
                    error instanceof Error
                        ? error.message
                        : 'Failed to load shelfs'
                this.shelfs.isLoading = false
            })
        }
    }

    getShelfById(id: string): ShelfEntity | undefined {
        return this.shelfs.data.find(item => item.id === id)
    }

    // Helper method to load all master data at once
    async loadAllMasterData() {
        await Promise.all([
            this.loadCategories(),
            this.loadUnits(),
            this.loadSuppliers(),
            this.loadWarehouses(),
            // Note: We might want to load these only when needed to avoid performance issues
            // this.loadAreas(),
            // this.loadRows(), 
            // this.loadShelfs(),
        ])
    }

    // For refreshing data when needed
    async refreshAllMasterData() {
        this.categories.data = []
        this.units.data = []
        this.suppliers.data = []
        this.goods.data = []
        this.warehouses.data = []
        this.areas.data = []
        this.rows.data = []
        this.shelfs.data = []

        await this.loadAllMasterData()
    }
}