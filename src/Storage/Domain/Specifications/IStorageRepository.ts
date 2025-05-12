import StorageVoucherEntity, { StorageVoucherItemEntity } from '../Entities/StorageVoucherEntity'

export const IStorageRepositoryToken = Symbol('IStorageRepository')

export interface GetStorageVouchersPayload {
    page: number
    pageSize: number
    code?: string
    status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
    priority?: number
    assignedTo?: string
    storageDateStart?: string
    storageDateEnd?: string
    search?: string
}

export interface IStorageRepository {
    getStorageVouchers: (data: GetStorageVouchersPayload) => Promise<{
        results: StorageVoucherEntity[]
        count: number
    }>

    getStorageVoucherById: (id: string) => Promise<StorageVoucherEntity>

    updateStorageVoucherStatus: (
        id: string,
        status: StorageVoucherEntity['status']
    ) => Promise<StorageVoucherEntity>

    createStorageVoucher: (data: any) => Promise<StorageVoucherEntity>

    updateStorageVoucher: (
        id: string,
        data: any
    ) => Promise<StorageVoucherEntity>

    createOrUpdateStorageVoucherItem: (data: any) => Promise<StorageVoucherItemEntity>

    // Optional methods
    deleteStorageVoucher?: (id: string) => Promise<boolean>
}