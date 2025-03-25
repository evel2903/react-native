import { createContext } from 'react'
import { InventoryStore } from './InventoryStore'

export const InventoryStoreContext = createContext<InventoryStore | null>(null)

InventoryStoreContext.displayName = 'InventoryStoreContext'
