import React, { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import {
    Surface,
    Text,
    Divider,
    List,
    Chip,
    Button,
    ProgressBar,
    TextInput,
} from 'react-native-paper'
import { PickingOrderProcessItemEntity } from '@/src/Picking/Domain/Entities/PickingOrderProcessEntity'

// Group picking items by location for better organization
interface GroupedPickingItems {
    warehouseName: string
    areaName: string
    rowName: string
    shelfName: string
    level: number
    position: number
    locationKey: string  // unique identifier for the location
    items: PickingOrderProcessItemEntity[]
    progress: number     // overall picking progress for this location
}

interface PickingLocationGroupProps {
    groupedItems: GroupedPickingItems
    onUpdateQuantity: (itemId: string, quantity: number) => void
    pendingUpdates: Map<string, number>
}

const PickingLocationGroup: React.FC<PickingLocationGroupProps> = ({
    groupedItems,
    onUpdateQuantity,
    pendingUpdates
}) => {
    const [expanded, setExpanded] = useState(false)
    // Track temporarily edited values before submitting
    const [inputValues, setInputValues] = useState<Map<string, string>>(new Map())

    // Get color based on progress
    const getProgressColor = (progress: number) => {
        if (progress === 0) return '#f44336' // Red for not started
        if (progress < 1) return '#ff9800' // Orange for in progress
        return '#4caf50' // Green for complete
    }

    // Handle input change for a specific item
    const handleInputChange = (id: string, value: string) => {
        const newInputValues = new Map(inputValues)
        newInputValues.set(id, value)
        setInputValues(newInputValues)
    }

    // Get current quantity to display
    const getCurrentQuantity = (item: PickingOrderProcessItemEntity) => {
        return item.updatedQuantityPicked !== undefined ? 
            item.updatedQuantityPicked : item.quantityPicked
    }

    // Handle update button click
    const handleUpdate = (item: PickingOrderProcessItemEntity) => {
        const inputValue = inputValues.get(item.id)
        if (!inputValue) return // No input value to update

        const newQuantity = parseInt(inputValue, 10)
        if (isNaN(newQuantity)) return // Not a valid number

        // Validate bounds
        const maxPickable = Math.min(item.requestedQuantity, item.quantityCanPicked)
        const finalQuantity = Math.max(0, Math.min(newQuantity, maxPickable))

        // Only update if different from current value
        const currentQuantity = item.updatedQuantityPicked !== undefined ? 
            item.updatedQuantityPicked : item.quantityPicked
            
        if (finalQuantity !== currentQuantity) {
            onUpdateQuantity(item.id, finalQuantity)
            
            // Keep the input value matching what we sent to the API
            // This ensures the input field keeps showing the updated value
            const newInputValues = new Map(inputValues)
            newInputValues.set(item.id, finalQuantity.toString())
            setInputValues(newInputValues)
        }
    }

    // Synchronize input values when item props change
    useEffect(() => {
        // Update input values if the item's quantity has changed externally
        // (e.g., from a successful API update)
        groupedItems.items.forEach(item => {
            const currentQuantity = getCurrentQuantity(item)
            // Only update if we don't have a pending edit
            if (!inputValues.has(item.id)) {
                const newInputValues = new Map(inputValues)
                newInputValues.set(item.id, currentQuantity.toString())
                setInputValues(newInputValues)
            }
        })
    }, [groupedItems.items])

    return (
        <Surface style={styles.locationCard} elevation={1}>
            <List.Accordion
                title={
                    <View style={styles.locationHeader}>
                        <Text style={styles.locationName}>
                            {groupedItems.warehouseName} - {groupedItems.shelfName}
                        </Text>
                        <Chip 
                            style={{ 
                                backgroundColor: getProgressColor(groupedItems.progress),
                                marginLeft: 8
                            }}
                            textStyle={styles.progressChip}
                        >
                            {Math.round(groupedItems.progress * 100)}%
                        </Chip>
                    </View>
                }
                expanded={expanded}
                onPress={() => setExpanded(!expanded)}
                style={styles.accordion}
            >
                {/* Location Details */}
                <View style={styles.locationDetails}>
                    <Text style={styles.locationText}>Warehouse: {groupedItems.warehouseName}</Text>
                    <Text style={styles.locationText}>Area: {groupedItems.areaName}</Text>
                    <Text style={styles.locationText}>Row: {groupedItems.rowName}</Text>
                    <Text style={styles.locationText}>Shelf: {groupedItems.shelfName}</Text>
                    <Text style={styles.locationText}>
                        Level: {groupedItems.level} Position: {groupedItems.position}
                    </Text>
                </View>
                
                <Divider style={styles.divider} />
                
                {/* Items in this location */}
                {groupedItems.items.map((item, index) => {
                    // Get current display quantity
                    const currentQuantity = getCurrentQuantity(item)
                    
                    // Calculate max pickable quantity
                    const maxPickable = Math.min(item.requestedQuantity, item.quantityCanPicked)
                    
                    // Check if item is fully picked
                    const isFullyPicked = currentQuantity >= maxPickable
                    
                    return (
                        <View key={item.id} style={styles.productItem}>
                            <View style={styles.productHeader}>
                                <Text style={styles.productId}>Product {index + 1}</Text>
                                {isFullyPicked && (
                                    <Chip 
                                        style={{ backgroundColor: '#4caf50' }}
                                        textStyle={styles.statusChip}
                                    >
                                        Complete
                                    </Chip>
                                )}
                            </View>
                            
                            <View style={styles.quantityRow}>
                                <Text style={styles.quantityLabel}>Requested:</Text>
                                <Text style={styles.quantityValue}>{item.requestedQuantity}</Text>
                            </View>
                            <View style={styles.quantityRow}>
                                <Text style={styles.quantityLabel}>Available:</Text>
                                <Text style={styles.quantityValue}>{item.quantityCanPicked}</Text>
                            </View>
                            <View style={styles.quantityRow}>
                                <Text style={styles.quantityLabel}>Picked:</Text>
                                <Text style={styles.quantityValue}>{currentQuantity}</Text>
                            </View>
                            
                            {/* Quantity input and update controls */}
                            <View style={styles.quantityInputContainer}>
                                <TextInput
                                    mode="outlined"
                                    label="Quantity"
                                    value={inputValues.has(item.id) ? 
                                        inputValues.get(item.id) : 
                                        currentQuantity.toString()}
                                    onChangeText={(text) => handleInputChange(item.id, text)}
                                    keyboardType="number-pad"
                                    style={styles.quantityInput}
                                    disabled={pendingUpdates.has(item.id)}
                                    dense
                                />
                                <Button
                                    mode="contained"
                                    onPress={() => handleUpdate(item)}
                                    disabled={pendingUpdates.has(item.id)}
                                    style={styles.updateButton}
                                >
                                    Update
                                </Button>
                            </View>
                            
                            {pendingUpdates.has(item.id) && (
                                <Text style={styles.pendingText}>Updating...</Text>
                            )}
                            
                            {index < groupedItems.items.length - 1 && (
                                <Divider style={styles.itemDivider} />
                            )}
                        </View>
                    )
                })}
            </List.Accordion>
        </Surface>
    )
}

interface PickingLocationManagerProps {
    items: PickingOrderProcessItemEntity[]
    onUpdateQuantity: (itemId: string, quantity: number) => void
    pendingUpdates: Map<string, number>
}

const PickingLocationManager: React.FC<PickingLocationManagerProps> = ({
    items,
    onUpdateQuantity,
    pendingUpdates
}) => {
    const [groupedLocations, setGroupedLocations] = useState<GroupedPickingItems[]>([])
    
    // Group items by location
    useEffect(() => {
        const locationMap = new Map<string, GroupedPickingItems>()
        
        items.forEach(item => {
            // Create a unique key for this location
            const locationKey = `${item.warehouseId || ''}-${item.areaId || ''}-${item.rowId || ''}-${item.shelfId || ''}-${item.level}-${item.position}`
            
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
                    progress: 0
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
                const maxPickable = Math.min(item.requestedQuantity, item.quantityCanPicked)
                totalRequested += maxPickable
                
                const pendingQuantity = pendingUpdates.get(item.id)
                const pickedQuantity = pendingQuantity !== undefined ? 
                    pendingQuantity : item.quantityPicked
                
                totalPicked += Math.min(pickedQuantity, maxPickable)
            })
            
            location.progress = totalRequested > 0 ? totalPicked / totalRequested : 0
        })
        
        // Convert map to array and sort by warehouse and shelf name
        const sortedLocations = Array.from(locationMap.values()).sort((a, b) => {
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
        
        setGroupedLocations(sortedLocations)
    }, [items, pendingUpdates])
    
    return (
        <View style={styles.container}>
            {groupedLocations.length === 0 ? (
                <Text style={styles.emptyText}>No picking locations available</Text>
            ) : (
                groupedLocations.map(location => (
                    <PickingLocationGroup
                        key={location.locationKey}
                        groupedItems={location}
                        onUpdateQuantity={onUpdateQuantity}
                        pendingUpdates={pendingUpdates}
                    />
                ))
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    locationCard: {
        marginBottom: 12,
        borderRadius: 8,
        overflow: 'hidden',
    },
    accordion: {
        padding: 0,
    },
    locationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    locationName: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    progressChip: {
        color: 'white',
        fontSize: 12,
    },
    locationDetails: {
        padding: 12,
        backgroundColor: '#f5f5f5',
    },
    locationText: {
        fontSize: 14,
        marginBottom: 2,
    },
    divider: {
        marginVertical: 8,
    },
    itemDivider: {
        marginTop: 12,
    },
    productItem: {
        padding: 12,
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    productId: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    statusChip: {
        color: 'white',
        fontSize: 12,
    },
    quantityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    quantityLabel: {
        color: '#666',
    },
    quantityValue: {
        fontWeight: 'bold',
    },
    quantityControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    quantityInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
        gap: 12,
    },
    quantityInput: {
        flex: 1,
    },
    updateButton: {
        borderRadius: 4,
    },
    currentQuantity: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    pendingText: {
        color: '#2196F3',
        fontStyle: 'italic',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        padding: 16,
        fontStyle: 'italic',
    },
})

export default PickingLocationManager