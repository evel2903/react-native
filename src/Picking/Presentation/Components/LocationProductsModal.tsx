import React, { useEffect, useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import {
    Text,
    Divider,
    Button,
    Portal,
    Modal,
    IconButton,
    ProgressBar,
} from 'react-native-paper'
import { PickingOrderProcessItemEntity } from '@/src/Picking/Domain/Entities/PickingOrderProcessEntity'
import { GroupedPickingItems, LocationDetails } from './types'
import ProductItem from './ProductItem'

// Component for displaying location details
const LocationDetailsView: React.FC<LocationDetails> = ({
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

    // Handle update button click (to be passed to ProductItem)
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

    // Get input value for an item
    const getInputValue = (itemId: string) => {
        return inputValues.has(itemId) ? 
            inputValues.get(itemId)! : 
            getCurrentQuantity(location.items.find(i => i.id === itemId) || location.items[0]).toString()
    }

    return (
        <Portal>
            <Modal 
                visible={visible} 
                onDismiss={onClose}
                contentContainerStyle={styles.modalContainer}
            >
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                        Picking Products
                    </Text>
                    <IconButton icon="close" size={20} onPress={onClose} />
                </View>
                
                <Divider />
                
                <ScrollView style={styles.modalContent}>
                    {/* Location Details */}
                    <LocationDetailsView 
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
                            <ProductItem
                                key={item.id}
                                item={item}
                                index={index}
                                onUpdateQuantity={onUpdateQuantity}
                                isPendingUpdate={pendingUpdates.has(item.id)}
                                inputValue={getInputValue(item.id)}
                                onInputChange={(value) => handleInputChange(item.id, value)}
                            />
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

const styles = StyleSheet.create({
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
    
    // Progress styles
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
    
    // Product styles
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
    completedText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    
    divider: {
        marginVertical: 12,
    },
})

export default LocationProductsModal