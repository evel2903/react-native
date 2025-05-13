import { PropsWithChildren } from 'react'
import { PickingStoreContext } from './PickingStoreContext'
import { PickingStore } from './PickingStore'
import { pickingModuleContainer } from '@/src/Picking/PickingModule'

export const PickingStoreProvider = ({ children }: PropsWithChildren) => {
    return (
        <PickingStoreContext.Provider
            value={pickingModuleContainer.get(PickingStore)}
        >
            {children}
        </PickingStoreContext.Provider>
    )
}