import { PickingOrderProcessItemEntity } from '@/src/Picking/Domain/Entities/PickingOrderProcessEntity'

// Group picking items by location for better organization
export interface GroupedPickingItems {
    warehouseName: string
    areaName: string
    rowName: string
    shelfName: string
    level: number
    position: number
    locationKey: string // unique identifier for the location
    items: PickingOrderProcessItemEntity[]
    progress: number // overall picking progress for this location
}

// Common interface for location details
export interface LocationDetails {
    warehouseName: string
    areaName: string
    rowName: string
    shelfName: string
    level: number
    position: number
}
