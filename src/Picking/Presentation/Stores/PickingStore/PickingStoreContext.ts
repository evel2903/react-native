import { createContext } from 'react'
import { PickingStore } from './PickingStore'

export const PickingStoreContext = createContext<PickingStore | null>(null)

PickingStoreContext.displayName = 'PickingStoreContext'