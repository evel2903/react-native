import React, { useEffect, useState, useMemo } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { PickingOrderProcessItemEntity } from '@/src/Picking/Domain/Entities/PickingOrderProcessEntity'
import { GroupedPickingItems } from './types'
import LocationCard from './LocationCard'
import LocationProductsModal from './LocationProductsModal'

interface PickingLocationManagerProps {
    items: PickingOrderProcessItemEntity[]
    onUpdateQuantity: (itemId: string, quantity: number) => Promise<boolean>
    pendingUpdates: Map<string, number>
}

const PickingLocationManager: React.FC<PickingLocationManagerProps> = ({
    items,
    onUpdateQuantity,
    pendingUpdates,
}) => {
    const [groupedLocations, setGroupedLocations] = useState<
        GroupedPickingItems[]
    >([])
    const [selectedLocation, setSelectedLocation] =
        useState<GroupedPickingItems | null>(null)
    const [modalVisible, setModalVisible] = useState(false)

    // Track successful updates locally for immediate UI feedback
    const [localUpdates, setLocalUpdates] = useState<Map<string, number>>(
        new Map()
    )

    // Helper function to get the most up-to-date quantity for an item
    const getCurrentQuantity = (
        item: PickingOrderProcessItemEntity
    ): number => {
        // First check local updates from this component
        if (localUpdates.has(item.id)) {
            return localUpdates.get(item.id)!
        }

        // Then check pending updates from the store
        if (pendingUpdates.has(item.id)) {
            return pendingUpdates.get(item.id)!
        }

        // Then check for updated quantity in the item itself
        if (item.updatedQuantityPicked !== undefined) {
            return item.updatedQuantityPicked
        }

        // Finally fall back to the original quantity
        return item.quantityPicked
    }

    // Group items by location - now using useMemo to optimize performance
    const computedGroupedLocations = useMemo(() => {
        const locationMap = new Map<string, GroupedPickingItems>()

        items.forEach(item => {
            // Create a unique key for this location
            const locationKey = `${item.warehouseId || ''}-${
                item.areaId || ''
            }-${item.rowId || ''}-${item.shelfId || ''}-${item.level}-${
                item.position
            }`

            if (!locationMap.has(locationKey)) {
                locationMap.set(locationKey, {
                    warehouseName: item.warehouseName,
                    areaName: item.areaName,
                    rowName: item.rowName,
                    shelfName: item.shelfName,
                    level: item.level,
                    position: item.position,
                    locationKey,
                    items: [],
                    progress: 0,
                })
            }

            // Add item to this location group
            const location = locationMap.get(locationKey)
            if (location) {
                location.items.push(item)
            }
        })

        // Calculate progress for each location
        locationMap.forEach(location => {
            let totalRequested = 0
            let totalPicked = 0

            location.items.forEach(item => {
                const maxPickable = Math.min(
                    item.requestedQuantity,
                    item.quantityCanPicked
                )
                totalRequested += maxPickable

                // Get the most up-to-date quantity
                const pickedQuantity = getCurrentQuantity(item)
                totalPicked += Math.min(pickedQuantity, maxPickable)
            })

            location.progress =
                totalRequested > 0 ? totalPicked / totalRequested : 0
        })

        // Convert map to array and sort by warehouse and shelf name
        return Array.from(locationMap.values()).sort((a, b) => {
            if (a.warehouseName !== b.warehouseName) {
                return a.warehouseName.localeCompare(b.warehouseName)
            }
            if (a.areaName !== b.areaName) {
                return a.areaName.localeCompare(b.areaName)
            }
            if (a.rowName !== b.rowName) {
                return a.rowName.localeCompare(b.rowName)
            }
            return a.shelfName.localeCompare(b.shelfName)
        })
    }, [items, pendingUpdates, localUpdates]) // Dependencies now include localUpdates

    // Update the state with the computed value
    useEffect(() => {
        setGroupedLocations(computedGroupedLocations)
    }, [computedGroupedLocations])

    // Handle quantity updates and ensure we pass through the Promise result
    const handleUpdateQuantity = async (
        itemId: string,
        quantity: number
    ): Promise<boolean> => {
        try {
            console.log(
                `PickingLocationManager: Updating item ${itemId} to quantity ${quantity}`
            )
            const result = await onUpdateQuantity(itemId, quantity)
            console.log(`PickingLocationManager: Result from parent: ${result}`)

            // Update local state immediately for UI feedback
            if (result) {
                const newLocalUpdates = new Map(localUpdates)
                newLocalUpdates.set(itemId, quantity)
                setLocalUpdates(newLocalUpdates)
            }

            return result // Make sure we explicitly return the result
        } catch (error) {
            console.error(
                'Error in PickingLocationManager.handleUpdateQuantity:',
                error
            )
            return false
        }
    }

    const openLocationModal = (location: GroupedPickingItems) => {
        setSelectedLocation(location)
        setModalVisible(true)
    }

    const closeLocationModal = () => {
        setModalVisible(false)
        // Keep selectedLocation for a smoother transition
        setTimeout(() => setSelectedLocation(null), 300)
    }

    return (
        <View style={styles.container}>
            {groupedLocations.length === 0 ? (
                <Text style={styles.emptyText}>
                    No picking locations available
                </Text>
            ) : (
                <>
                    {groupedLocations.map(location => (
                        <LocationCard
                            key={location.locationKey}
                            location={location}
                            onViewProducts={openLocationModal}
                        />
                    ))}

                    {/* Products Modal */}
                    {selectedLocation && (
                        <LocationProductsModal
                            visible={modalVisible}
                            onClose={closeLocationModal}
                            location={selectedLocation}
                            onUpdateQuantity={handleUpdateQuantity}
                            pendingUpdates={pendingUpdates}
                        />
                    )}
                </>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        padding: 16,
        fontStyle: 'italic',
    },
})

export default PickingLocationManager
