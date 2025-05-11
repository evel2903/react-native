import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { StorageVoucherItemEntity } from '@/src/Storage/Domain/Entities/StorageVoucherEntity'

interface StorageVoucherItemsComponentProps {
    items: StorageVoucherItemEntity[]
}

const StorageVoucherItemsComponent: React.FC<StorageVoucherItemsComponentProps> = ({ items }) => {
    if (!items || items.length === 0) {
        return <Text style={styles.emptyText}>No location details available</Text>
    }

    return (
        <View style={styles.locationContainer}>
            {items.map((item, index) => (
                <View key={item.id} style={styles.locationItem}>
                    <View style={styles.locationHeader}>
                        <Text style={styles.locationTitle}>Location {index + 1}</Text>
                        <Text style={styles.locationQuantity}>Qty: {item.quantity}</Text>
                    </View>
                    <View style={styles.locationDetails}>
                        <Text style={styles.locationText}>Warehouse: {item.warehouseName}</Text>
                        <Text style={styles.locationText}>Area: {item.areaName}</Text>
                        <Text style={styles.locationText}>Row: {item.rowName}</Text>
                        <Text style={styles.locationText}>Shelf: {item.shelfName}</Text>
                        <Text style={styles.locationText}>Level: {item.level} Position: {item.position}</Text>
                    </View>
                </View>
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    locationContainer: {
        gap: 8,
    },
    locationItem: {
        backgroundColor: '#f5f5f5',
        borderRadius: 6,
        padding: 8,
    },
    locationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    locationTitle: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    locationQuantity: {
        fontSize: 14,
        color: '#2196f3',
    },
    locationDetails: {
        gap: 2,
    },
    locationText: {
        fontSize: 13,
        color: '#444',
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        padding: 8,
    },
})

export default StorageVoucherItemsComponent