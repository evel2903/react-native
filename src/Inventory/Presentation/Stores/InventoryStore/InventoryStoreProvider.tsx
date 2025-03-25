import { PropsWithChildren } from 'react'
import { InventoryStoreContext } from './InventoryStoreContext'
import { InventoryStore } from './InventoryStore'
import { inventoryModuleContainer } from '@/src/Inventory/InventoryModule'

export const InventoryStoreProvider = ({ children }: PropsWithChildren) => {
    return (
        <InventoryStoreContext.Provider
            value={inventoryModuleContainer.get(InventoryStore)}
        >
            {children}
        </InventoryStoreContext.Provider>
    )
}
