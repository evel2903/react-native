// src/Common/Presentation/Stores/MasterDataStore/MasterDataStore.ts
import { injectable, inject } from 'inversiland'
import { makeAutoObservable, runInAction } from 'mobx'
import MasterDataStoreState from '../../Types/MasterDataStoreState'
import { GetCategoriesUseCase } from '@/src/Common/Application/UseCases/GetCategoriesUseCase'
import { GetUnitsUseCase } from '@/src/Common/Application/UseCases/GetUnitsUseCase'
import { GetSuppliersUseCase } from '@/src/Common/Application/UseCases/GetSuppliersUseCase'
import { GetGoodsUseCase } from '@/src/Common/Application/UseCases/GetGoodsUseCase'
import { CategoryEntity } from '@/src/Common/Domain/Entities/CategoryEntity'
import { UnitEntity } from '@/src/Common/Domain/Entities/UnitEntity'
import { SupplierEntity } from '@/src/Common/Domain/Entities/SupplierEntity'
import { GoodsEntity } from '@/src/Common/Domain/Entities/GoodsEntity'

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

    constructor(
        @inject(GetCategoriesUseCase)
        private readonly getCategoriesUseCase: GetCategoriesUseCase,
        @inject(GetUnitsUseCase)
        private readonly getUnitsUseCase: GetUnitsUseCase,
        @inject(GetSuppliersUseCase)
        private readonly getSuppliersUseCase: GetSuppliersUseCase,
        @inject(GetGoodsUseCase)
        private readonly getGoodsUseCase: GetGoodsUseCase
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

    // Helper method to load all master data at once
    async loadAllMasterData() {
        await Promise.all([
            this.loadCategories(),
            this.loadUnits(),
            this.loadSuppliers(),
            this.loadGoods(),
        ])
    }

    // For refreshing data when needed
    async refreshAllMasterData() {
        this.categories.data = []
        this.units.data = []
        this.suppliers.data = []
        this.goods.data = []

        await this.loadAllMasterData()
    }
}
