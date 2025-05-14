import React, { useMemo } from 'react'
import { View, StyleSheet } from 'react-native'
import { Surface, Text, Button, ProgressBar } from 'react-native-paper'
import { GroupedPickingItems } from './types'

interface LocationCardProps {
    location: GroupedPickingItems
    onViewProducts: (location: GroupedPickingItems) => void
}

const LocationCard: React.FC<LocationCardProps> = ({
    location,
    onViewProducts,
}) => {
    // Progress color logic
    const getProgressColor = (progress: number) => {
        if (progress === 0) return '#f44336' // Red for not started
        if (progress < 1) return '#ff9800' // Orange for in progress
        return '#4caf50' // Green for complete
    }

    // Get a sample product from the location for display
    const sampleProduct =
        location.items && location.items.length > 0 ? location.items[0] : null

    // Calculate total quantities for this location
    const quantityInfo = useMemo(() => {
        let totalToPick = 0;
        let totalPicked = 0;
        
        location.items.forEach(item => {
            const maxPickable = Math.min(
                item.requestedQuantity,
                item.quantityCanPicked
            );
            totalToPick += maxPickable;
            
            const pickedQty = item.updatedQuantityPicked !== undefined 
                ? item.updatedQuantityPicked 
                : item.quantityPicked;
                
            totalPicked += Math.min(pickedQty, maxPickable);
        });
        
        return { totalPicked, totalToPick };
    }, [location.items]);

    // Ensure progress is valid - fall back to 0 if undefined or NaN
    const safeProgress = Number.isFinite(location.progress) ? location.progress : 0
    
    // Calculate progress percentage for display
    const progressPercentage = Math.round(safeProgress * 100)

    return (
        <Surface style={styles.locationCard} elevation={1}>
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
            </View>

            {/* Display product information if available */}
            {sampleProduct && sampleProduct.goodsName && (
                <View style={styles.productInfoSection}>
                    <Text style={styles.productInfoText}>
                        {sampleProduct.goodsName}
                    </Text>
                    {sampleProduct.goodsCode && (
                        <Text style={styles.productCodeText}>
                            Code: {sampleProduct.goodsCode}
                        </Text>
                    )}
                </View>
            )}

            <View style={styles.locationSummary}>
                <View style={styles.progressHeader}>
                    <Text style={styles.summaryText}>
                        {location.items.length} product{location.items.length !== 1 ? 's' : ''}
                    </Text>
                    <Text
                        style={[
                            styles.percentageText,
                            { color: getProgressColor(safeProgress) },
                        ]}
                    >
                        {progressPercentage}%
                    </Text>
                </View>
                <ProgressBar
                    progress={safeProgress}
                    color={getProgressColor(safeProgress)}
                    style={styles.summaryProgressBar}
                />
                <Text style={styles.quantityText}>
                    {quantityInfo.totalPicked} of {quantityInfo.totalToPick} items picked
                </Text>
            </View>

            <Button
                mode="contained"
                onPress={() => onViewProducts(location)}
                style={styles.viewProductsButton}
            >
                View Products
            </Button>
        </Surface>
    )
}

const styles = StyleSheet.create({
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
    // New styles for product information
    productInfoSection: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    productInfoText: {
        fontSize: 14,
        fontWeight: '500',
    },
    productCodeText: {
        fontSize: 12,
        color: '#666',
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    percentageText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    locationSummary: {
        marginTop: 8,
        marginBottom: 12,
    },
    summaryText: {
        fontSize: 14,
    },
    summaryProgressBar: {
        height: 6,
        borderRadius: 3,
    },
    quantityText: {
        fontSize: 12,
        color: '#666',
        marginTop: 6,
        textAlign: 'right',
    },
    viewProductsButton: {
        borderRadius: 4,
    },
})

export default LocationCard