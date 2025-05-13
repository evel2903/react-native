import React from 'react'
import { View, StyleSheet } from 'react-native'
import {
    Surface,
    Text,
    TouchableRipple,
    List,
    Button,
    Chip,
    ProgressBar,
} from 'react-native-paper'
import { PickingOrderProcessItemEntity } from '@/src/Picking/Domain/Entities/PickingOrderProcessEntity'

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

interface PickingProcessItemProps {
    item: PickingOrderProcessItemEntity
    onUpdateQuantity: (id: string, quantity: number) => void
    isPendingUpdate: boolean
}

const PickingProcessItem: React.FC<PickingProcessItemProps> = ({ 
    item,
    onUpdateQuantity,
    isPendingUpdate
}) => {
    // Get displayed quantity (either pending update or current value)
    const currentQuantity = item.updatedQuantityPicked !== undefined
        ? item.updatedQuantityPicked
        : item.quantityPicked
    
    // Check if fully picked
    const isFullyPicked = currentQuantity >= item.requestedQuantity || 
                          currentQuantity >= item.quantityCanPicked
    
    // Calculate progress percentage
    const maxPickable = Math.min(item.requestedQuantity, item.quantityCanPicked)
    const progressPercentage = maxPickable > 0 ? Math.min(currentQuantity / maxPickable, 1) : 0
    
    // Get color based on pick status
    const getProgressColor = () => {
        if (progressPercentage === 0) return '#f44336' // Red for not started
        if (progressPercentage < 1) return '#ff9800' // Orange for in progress
        return '#4caf50' // Green for complete
    }
    
    // Status display
    const getStatusInfo = () => {
        if (progressPercentage === 0) {
            return { color: '#f44336', text: 'Not Started' }
        }
        if (progressPercentage < 1) {
            return { color: '#ff9800', text: 'In Progress' }
        }
        return { color: '#4caf50', text: 'Complete' }
    }

    const statusInfo = getStatusInfo()
    
    // Handle increment/decrement of quantity
    const incrementQuantity = () => {
        const maxAllowed = Math.min(item.requestedQuantity, item.quantityCanPicked)
        if (currentQuantity < maxAllowed) {
            onUpdateQuantity(item.id, currentQuantity + 1)
        }
    }
    
    const decrementQuantity = () => {
        if (currentQuantity > 0) {
            onUpdateQuantity(item.id, currentQuantity - 1)
        }
    }

    return (
        <Surface style={styles.itemCard} elevation={1}>
            <View style={styles.itemHeader}>
                <View style={styles.locationHeader}>
                    <Text style={styles.locationName}>Location {item.warehouseName}</Text>
                    <Chip 
                        style={{ backgroundColor: statusInfo.color }}
                        textStyle={styles.statusChipText}
                    >
                        {statusInfo.text}
                    </Chip>
                </View>
            </View>

            {/* Location details */}
            <LocationDetails 
                warehouseName={item.warehouseName}
                areaName={item.areaName}
                rowName={item.rowName}
                shelfName={item.shelfName}
                level={item.level}
                position={item.position}
            />
            
            {/* Quantity information */}
            <View style={styles.quantitySection}>
                <View style={styles.quantityRow}>
                    <Text style={styles.quantityLabel}>Requested Quantity:</Text>
                    <Text style={styles.quantityValue}>{item.requestedQuantity}</Text>
                </View>
                <View style={styles.quantityRow}>
                    <Text style={styles.quantityLabel}>Available Quantity:</Text>
                    <Text style={styles.quantityValue}>{item.quantityCanPicked}</Text>
                </View>
            </View>
            
            {/* Progress section */}
            <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Picking Progress</Text>
                    <Text style={styles.progressText}>{Math.round(progressPercentage * 100)}%</Text>
                </View>
                <ProgressBar
                    progress={progressPercentage}
                    color={getProgressColor()}
                    style={styles.progressBar}
                />
                <Text style={styles.progressDetail}>
                    {currentQuantity} of {maxPickable} items picked
                </Text>
            </View>
            
            {/* Quantity adjustment controls */}
            <View style={styles.quantityControls}>
                <Button 
                    mode="outlined" 
                    onPress={decrementQuantity}
                    disabled={currentQuantity <= 0 || isPendingUpdate}
                    style={styles.quantityButton}
                >
                    -
                </Button>
                <Text style={styles.currentQuantity}>{currentQuantity}</Text>
                <Button 
                    mode="outlined" 
                    onPress={incrementQuantity}
                    disabled={currentQuantity >= maxPickable || isPendingUpdate}
                    style={styles.quantityButton}
                >
                    +
                </Button>
            </View>
            
            {isPendingUpdate && (
                <Text style={styles.pendingUpdateText}>Updating...</Text>
            )}
        </Surface>
    )
}

const styles = StyleSheet.create({
    itemCard: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    itemHeader: {
        marginBottom: 8,
    },
    locationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    locationName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    statusChipText: {
        color: 'white',
        fontSize: 12,
    },
    locationDetails: {
        marginVertical: 8,
    },
    locationText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 2,
    },
    quantitySection: {
        marginVertical: 8,
    },
    quantityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    quantityLabel: {
        fontSize: 14,
        color: '#757575',
    },
    quantityValue: {
        fontSize: 14,
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
    progressDetail: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        textAlign: 'right',
    },
    quantityControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    quantityButton: {
        width: 50,
        borderRadius: 4,
    },
    currentQuantity: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    pendingUpdateText: {
        fontSize: 12,
        color: '#2196F3',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 8,
    },
})

export default PickingProcessItem