// src/Tracking/Presentation/Stores/TrackingStore/TrackingStoreProvider.tsx
import { PropsWithChildren } from 'react'
import { TrackingStoreContext } from './TrackingStoreContext'
import { TrackingStore } from './TrackingStore'
import { trackingModuleContainer } from '@/src/Tracking/TrackingModule'

export const TrackingStoreProvider = ({ children }: PropsWithChildren) => {
    return (
        <TrackingStoreContext.Provider
            value={trackingModuleContainer.get(TrackingStore)}
        >
            {children}
        </TrackingStoreContext.Provider>
    )
}
