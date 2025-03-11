import { createContext } from 'react'
import { StockOutStore } from './StockOutStore'

export const StockOutStoreContext = createContext<StockOutStore | null>(null)

StockOutStoreContext.displayName = 'StockOutStoreContext'
