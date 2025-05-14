import React, { useEffect, useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import {
    Surface,
    Text,
    Divider,
    Button,
    Chip,
    ProgressBar,
    TextInput,
    Portal,
    Modal,
    IconButton,
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

interface LocationDetailsProps {
    warehouseName: string
    areaName: string
    rowName: string
    shelfName: string
    level: number
    position: number
}

const LocationDetails: React.FC<LocationDetailsProps> = ({
    warehouseName,
    areaName,
    rowName,
    shelfName,
    level,
    position
}) => (
    <View style={styles.locationDetails}>
        <Text style={styles.locationText}>Warehouse: {warehouseName}</Text>
        <Text style={styles.locationText}>Area: {areaName}</Text>
        <Text style={styles.locationText}>Row: {rowName}</Text>
        <Text style={styles.locationText}>Shelf: {shelfName}</Text>
        <Text style={styles.locationText}>Level: {level} Position: {position}</Text>
    </View>
)

// Popup modal for showing and editing products at a location
interface LocationProductsModalProps {
    visible: boolean
    onClose: () => void
    location: GroupedPickingItems
    onUpdateQuantity: (itemId: string, quantity: number) => void
    pendingUpdates: Map<string, number>
}

const LocationProductsModal: React.FC<LocationProductsModalProps> = ({
    visible,
    onClose,
    location,
    onUpdateQuantity,
    pendingUpdates
}) => {
    // Track temporarily edited values before submitting
    const [inputValues, setInputValues] = useState<Map<string, string>>(new Map())

    // Get current quantity to display
    const getCurrentQuantity = (item: PickingOrderProcessItemEntity) => {
        return item.updatedQuantityPicked !== undefined ? 
            item.updatedQuantityPicked : item.quantityPicked
    }

    // Handle input change for a specific item
    const handleInputChange = (id: string, value: string) => {
        const newInputValues = new Map(inputValues)
        newInputValues.set(id, value)
        setInputValues(newInputValues)
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
        const currentQuantity = getCurrentQuantity(item)
            
        if (finalQuantity !== currentQuantity) {
            onUpdateQuantity(item.id, finalQuantity)
            
            // Keep the input value matching what we sent to the API
            const newInputValues = new Map(inputValues)
            newInputValues.set(item.id, finalQuantity.toString())
            setInputValues(newInputValues)
        }
    }

    // Synchronize input values when item props change
    useEffect(() => {
        // Update input values if the item's quantity has changed externally
        if (location && location.items) {
            location.items.forEach(item => {
                const currentQuantity = getCurrentQuantity(item)
                // Only update if we don't have a pending edit
                if (!inputValues.has(item.id)) {
                    const newInputValues = new Map(inputValues)
                    newInputValues.set(item.id, currentQuantity.toString())
                    setInputValues(newInputValues)
                }
            })
        }
    }, [location?.items])

    return (
        <Portal>
            <Modal 
                visible={visible} 
                onDismiss={onClose}
                contentContainerStyle={styles.modalContainer}
            >
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                        Products at {location?.warehouseName} - {location?.shelfName}
                    </Text>
                    <IconButton icon="close" size={20} onPress={onClose} />
                </View>
                
                <Divider />
                
                <ScrollView style={styles.modalContent}>
                    {/* Location Details */}
                    <LocationDetails 
                        warehouseName={location?.warehouseName || ''}
                        areaName={location?.areaName || ''}
                        rowName={location?.rowName || ''}
                        shelfName={location?.shelfName || ''}
                        level={location?.level || 0}
                        position={location?.position || 0}
                    />
                    
                    <Divider style={styles.divider} />
                    
                    {/* Items in this location */}
                    {location && location.items.map((item, index) => {
                        // Get current display quantity
                        const currentQuantity = getCurrentQuantity(item)
                        
                        // Calculate max pickable quantity
                        const maxPickable = Math.min(item.requestedQuantity, item.quantityCanPicked)
                        
                        // Check if item is fully picked
                        const isFullyPicked = currentQuantity >= maxPickable
                        
                        // Calculate progress percentage
                        const progressPercentage = maxPickable > 0 ? 
                            Math.min(currentQuantity / maxPickable, 1) : 0
                        
                        // Get color based on pick status
                        const getProgressColor = () => {
                            if (progressPercentage === 0) return '#f44336' // Red for not started
                            if (progressPercentage < 1) return '#ff9800' // Orange for in progress
                            return '#4caf50' // Green for complete
                        }
                        
                        return (
                            <Surface 
                                key={item.id} 
                                style={styles.productItem}
                                elevation={1}
                            >
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
                                
                                {/* Progress section */}
                                <View style={styles.progressSection}>
                                    <View style={styles.progressHeader}>
                                        <Text style={styles.progressLabel}>Picking Progress</Text>
                                        <Text style={styles.progressText}>
                                            {Math.round(progressPercentage * 100)}%
                                        </Text>
                                    </View>
                                    <ProgressBar
                                        progress={progressPercentage}
                                        color={getProgressColor()}
                                        style={styles.progressBar}
                                    />
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
                            </Surface>
                        )
                    })}
                </ScrollView>
                
                <Divider />
                
                <View style={styles.modalFooter}>
                    <Button mode="outlined" onPress={onClose}>
                        Close
                    </Button>
                </View>
            </Modal>
        </Portal>
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
    const [selectedLocation, setSelectedLocation] = useState<GroupedPickingItems | null>(null)
    const [modalVisible, setModalVisible] = useState(false)
    
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
    
    // Get color based on progress
    const getProgressColor = (progress: number) => {
        if (progress === 0) return '#f44336' // Red for not started
        if (progress < 1) return '#ff9800' // Orange for in progress
        return '#4caf50' // Green for complete
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
                <Text style={styles.emptyText}>No picking locations available</Text>
            ) : (
                <>
                    {groupedLocations.map((location) => (
                        <Surface key={location.locationKey} style={styles.locationCard} elevation={1}>
                            <View style={styles.locationCardHeader}>
                                <View style={styles.locationInfo}>
                                    <Text style={styles.locationName}>
                                        {location.warehouseName} - {location.shelfName}
                                    </Text>
                                    <Text style={styles.locationSubtext}>
                                        {location.areaName}, Row {location.rowName}
                                    </Text>
                                    <Text style={styles.locationPosition}>
                                        Level: {location.level} Position: {location.position}
                                    </Text>
                                </View>
                                <Chip 
                                    style={{ backgroundColor: getProgressColor(location.progress) }}
                                    textStyle={styles.progressChip}
                                >
                                    {Math.round(location.progress * 100)}%
                                </Chip>
                            </View>
                            
                            <View style={styles.locationSummary}>
                                <Text style={styles.summaryText}>
                                    {location.items.length} product{location.items.length !== 1 ? 's' : ''}
                                </Text>
                                <ProgressBar
                                    progress={location.progress}
                                    color={getProgressColor(location.progress)}
                                    style={styles.summaryProgressBar}
                                />
                            </View>
                            
                            <Button 
                                mode="contained" 
                                onPress={() => openLocationModal(location)}
                                style={styles.viewProductsButton}
                            >
                                View Products
                            </Button>
                        </Surface>
                    ))}
                    
                    {/* Products Modal */}
                    {selectedLocation && (
                        <LocationProductsModal
                            visible={modalVisible}
                            onClose={closeLocationModal}
                            location={selectedLocation}
                            onUpdateQuantity={onUpdateQuantity}
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
    locationCard: {
        marginBottom: 12,
        borderRadius: 8,
        padding: 12,
    },
    locationCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    locationInfo: {
        flex: 1,
    },
    locationName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    locationSubtext: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    locationPosition: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    progressChip: {
        color: 'white',
        fontSize: 12,
    },
    locationSummary: {
        marginTop: 8,
        marginBottom: 12,
    },
    summaryText: {
        fontSize: 14,
        marginBottom: 4,
    },
    summaryProgressBar: {
        height: 6,
        borderRadius: 3,
    },
    viewProductsButton: {
        borderRadius: 4,
    },
    
    // Modal styles
    modalContainer: {
        backgroundColor: 'white',
        margin: 20,
        borderRadius: 8,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalContent: {
        padding: 16,
        maxHeight: '80%',
    },
    modalFooter: {
        padding: 16,
        alignItems: 'flex-end',
    },
    
    // Location details styles
    locationDetails: {
        padding: 8,
        backgroundColor: '#f5f5f5',
        borderRadius: 4,
        marginBottom: 12,
    },
    locationText: {
        fontSize: 14,
        marginBottom: 2,
    },
    
    // Product styles
    productItem: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
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
    progressSection: {
        marginVertical: 8,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    progressLabel: {
        fontSize: 12,
        color: '#757575',
    },
    progressText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
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
    pendingText: {
        color: '#2196F3',
        fontStyle: 'italic',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
    },
    divider: {
        marginVertical: 12,
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        padding: 16,
        fontStyle: 'italic',
    },
})

export default PickingLocationManager