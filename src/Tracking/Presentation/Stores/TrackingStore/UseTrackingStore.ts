// src/Tracking/Presentation/Stores/TrackingStore/UseTrackingStore.ts
import { useContextStore } from '@/src/Core/Presentation/Hooks/UseContextStore'
import { TrackingStore } from './TrackingStore'
import { TrackingStoreContext } from './TrackingStoreContext'

export const useTrackingStore = (): TrackingStore => {
    const store = useContextStore(TrackingStoreContext)
    return store
}
