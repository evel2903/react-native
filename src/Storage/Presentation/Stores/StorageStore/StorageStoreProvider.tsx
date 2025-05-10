import { PropsWithChildren } from 'react'
import { StorageStoreContext } from './StorageStoreContext'
import { StorageStore } from './StorageStore'
import { storageModuleContainer } from '@/src/Storage/StorageModule'

export const StorageStoreProvider = ({ children }: PropsWithChildren) => {
    return (
        <StorageStoreContext.Provider
            value={storageModuleContainer.get(StorageStore)}
        >
            {children}
        </StorageStoreContext.Provider>
    )
}
