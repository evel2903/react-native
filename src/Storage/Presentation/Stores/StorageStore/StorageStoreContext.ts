import { createContext } from 'react'
import { StorageStore } from './StorageStore'

export const StorageStoreContext = createContext<StorageStore | null>(null)

StorageStoreContext.displayName = 'StorageStoreContext'