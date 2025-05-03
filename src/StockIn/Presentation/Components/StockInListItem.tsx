import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Card, Text, Divider, Button, IconButton, Chip } from 'react-native-paper'
import StockInEntity from '../../Domain/Entities/StockInEntity'
import { Status, getStatusColor, getStatusDisplayName } from '@/src/Common/Domain/Enums/Status'
import { useAuthStore } from '@/src/Auth/Presentation/Stores/AuthStore/UseAuthStore'

interface StockInListItemProps {
    item: StockInEntity
    onApprove: (id: string) => void
    onView: (id: string) => void
    onEdit: (id: string) => void
    onDelete: (id: string) => void
}

const StockInListItem: React.FC<StockInListItemProps> = ({
    item,
    onApprove,
    onView,
    onEdit,
    onDelete
}) => {
    const authStore = useAuthStore();
    
    // Format date to user-friendly format
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-CA').replace(/-/g, '/')
    }

    // Format currency amounts
    const formatAmount = (amount: string) => {
        return parseFloat(amount).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
            style: 'currency',
            currency: 'USD'
        })
    }

    // Use the Status enum for type safety
    const getStatusDetails = (statusStr: string) => {
        // Cast the string to our Status enum type
        const status = statusStr as Status
        
        return {
            color: getStatusColor(status),
            displayName: getStatusDisplayName(status)
        }
    }

    // Get the count of items from details array
    const itemCount = item.details?.length || 0

    return (
        <Card style={styles.card}>
            <Card.Content>
                {/* Header section with code and status */}
                <View style={styles.headerRow}>
                    <Text style={styles.codeText}>Code: {item.code}</Text>
                    <Chip
                        style={{
                            backgroundColor: getStatusDetails(item.status).color,
                        }}
                        textStyle={styles.statusText}
                    >
                        {getStatusDetails(item.status).displayName}
                    </Chip>
                </View>
                
                {/* Stock information */}
                <Text style={styles.infoText}>Lot number: {item.lotNumber || 'N/A'}</Text>
                <Text style={styles.infoText}>Stock in date: {formatDate(item.inDate)}</Text>
                <Text style={styles.infoText}>
                    Supplier: {item.supplier?.name || item.supplier?.code || 'N/A'}
                </Text>
                
                {/* Details row with quantity and cost */}
                <View style={styles.detailsRow}>
                    <Text>Items: {itemCount}</Text>
                    <Text>Total: {formatAmount(item.totalAmount)}</Text>
                </View>
                
                <Divider style={styles.divider} />
                
                {/* Action buttons */}
                <View style={styles.actionsRow}>
                    {/* Only show Approve button for pending status and if user has approval permission */}
                    {item.status === Status.Pending && 
                     authStore.hasPermission('stockIn:approve') && (
                        <Button
                            mode="contained"
                            style={styles.approveButton}
                            onPress={() => onApprove(item.id)}
                        >
                            Approve
                        </Button>
                    )}
                    
                    <View style={styles.iconButtons}>
                        {/* View button - available to anyone with view permission */}
                        {authStore.hasPermission('stockIn:read') && (
                            <IconButton
                                icon="eye"
                                size={20}
                                onPress={() => onView(item.id)}
                                tooltip="View details"
                            />
                        )}
                        
                        {/* Only show edit for draft status and if user has edit permission */}
                        {item.status === Status.Draft && 
                         authStore.hasPermission('stockIn:update') && (
                            <IconButton
                                icon="pencil"
                                size={20}
                                onPress={() => onEdit(item.id)}
                                tooltip="Edit"
                            />
                        )}
                        
                        {/* Only show delete for draft status and if user has delete permission */}
                        {item.status === Status.Draft && 
                         authStore.hasPermission('stockIn:delete') && (
                            <IconButton
                                icon="delete"
                                size={20}
                                onPress={() => onDelete(item.id)}
                                tooltip="Delete"
                            />
                        )}
                    </View>
                </View>
            </Card.Content>
        </Card>
    )
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 12,
        borderRadius: 8,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    codeText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
    },
    infoText: {
        marginBottom: 4,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    divider: {
        marginVertical: 8,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    approveButton: {
        borderRadius: 4,
    },
    iconButtons: {
        flexDirection: 'row',
    },
})

export default StockInListItem