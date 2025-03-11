import { createContext } from 'react'
import { StockInStore } from './StockInStore'

export const StockInStoreContext = createContext<StockInStore | null>(null)

StockInStoreContext.displayName = 'StockInStoreContext'
