import { createContext } from 'react'
import { AuthStore } from './AuthStore'

export const AuthStoreContext = createContext<AuthStore | null>(null)

AuthStoreContext.displayName = 'AuthStoreContext'
