import { createContext } from 'react'
import { GetInventoryStore } from './GetInventoryStore'

export const GetInventoryStoreContext = createContext<GetInventoryStore | null>(
    null
)

GetInventoryStoreContext.displayName = 'GetInventoryStoreContext'
