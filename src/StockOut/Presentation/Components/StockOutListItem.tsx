// src/StockOut/Presentation/Components/StockOutListItem.tsx
import React from 'react'
import { View, StyleSheet } from 'react-native'
import {
    Card,
    Text,
    Divider,
    Button,
    IconButton,
    Chip,
} from 'react-native-paper'
import StockOutEntity from '../../Domain/Entities/StockOutEntity'
import {
    Status,
    getStatusColor,
    getStatusDisplayName,
} from '@/src/Common/Domain/Enums/Status'
import { formatDate, formatDateTime } from '@/src/Core/Utils'
import {
    PRIORITY,
    getPriorityColor,
    getPriorityDisplayName,
} from '@/src/Common/Domain/Enums/Priority'
import { useAuthStore } from '@/src/Auth/Presentation/Stores/AuthStore/UseAuthStore'

interface StockOutListItemProps {
    item: StockOutEntity
    onApprove: (id: string) => void
    onReject: (id: string) => void
    onRequestApproval: (id: string) => void
    onView: (id: string) => void
    onEdit: (id: string) => void
    onDelete: (id: string) => void
}

const StockOutListItem: React.FC<StockOutListItemProps> = ({
    item,
    onApprove,
    onReject,
    onRequestApproval,
    onView,
    onEdit,
    onDelete,
}) => {
    const authStore = useAuthStore()

    // Use the Status enum for type safety
    const getStatusDetails = (statusStr: string) => {
        // Cast the string to our Status enum type
        const status = statusStr as Status

        return {
            color: getStatusColor(status),
            displayName: getStatusDisplayName(status),
        }
    }

    // Safely handle priority (which can be null in the API response)
    const renderPriorityChip = () => {
        if (item.priority === null || item.priority === undefined) {
            return null
        }
        
        return (
            <Chip
                style={{
                    backgroundColor: getPriorityColor(item.priority),
                }}
                textStyle={styles.priorityChip}
            >
                {getPriorityDisplayName(item.priority)}
            </Chip>
        )
    }

    return (
        <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
                {/* Header section with code and status */}
                <View style={styles.headerRow}>
                    <View style={styles.codeContainer}>
                        <Text style={styles.codeText}>{item.code}</Text>
                        {renderPriorityChip()}
                    </View>
                </View>

                {/* Stock information */}
                <Text style={styles.infoText}>
                    Stock out date: {formatDate(item.outDate)}
                </Text>

                {/* Details row with quantity */}
                <View style={styles.detailsRow}>
                    <Text>Items: {item.count}</Text>
                </View>

                {/* Timestamps & status */}
                <View style={styles.metadataContainer}>
                    <View style={styles.timestampsContainer}>
                        <Text variant="bodySmall" style={styles.timestamp}>
                            Created: {formatDateTime(item.createdAt)}
                        </Text>
                        <Text variant="bodySmall" style={styles.timestamp}>
                            Updated: {formatDateTime(item.updatedAt)}
                        </Text>
                    </View>
                    <Chip
                        style={[
                            styles.statusChip,
                            {
                                backgroundColor: getStatusDetails(item.status)
                                    .color,
                            },
                        ]}
                        textStyle={styles.statusText}
                    >
                        {getStatusDetails(item.status).displayName}
                    </Chip>
                </View>

                <Divider style={styles.divider} />

                {/* Action buttons */}
                <View style={styles.actionsRow}>
                    <View style={styles.iconButtons}>
                        {/* View button - available to anyone with view permission */}
                        {authStore.hasPermission('stockOut:read') && (
                            <IconButton
                                icon="eye"
                                size={20}
                                onPress={() => onView(item.id)}
                            />
                        )}

                        {/* Only show edit for draft status and if user has edit permission */}
                        {item.status === Status.Draft &&
                            authStore.hasPermission('stockOut:update') && (
                                <IconButton
                                    icon="pencil"
                                    size={20}
                                    onPress={() => onEdit(item.id)}
                                />
                            )}

                        {/* Only show delete for draft status and if user has delete permission */}
                        {item.status === Status.Draft &&
                            authStore.hasPermission('stockOut:delete') && (
                                <IconButton
                                    icon="delete"
                                    size={20}
                                    onPress={() => onDelete(item.id)}
                                />
                            )}
                    </View>
                    <View style={styles.actionButtons}>
                        {/* Request Approval button - only show for Draft status */}
                        {item.status === Status.Draft &&
                            authStore.hasPermission(
                                'approval_requests:create'
                            ) && (
                                <Button
                                    mode="outlined"
                                    style={styles.requestButton}
                                    onPress={() => onRequestApproval(item.id)}
                                >
                                    Request Approval
                                </Button>
                            )}

                        {/* Approval buttons removed since isValidForApprovalRequest is no longer in the entity */}
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
        overflow: 'hidden',
    },
    cardContent: {
        paddingBottom: 8,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignContent: 'center',
    },
    codeContainer: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'space-between',
    },
    codeText: {
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 8,
    },
    priorityChip: {
        color: 'white',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16,
    },
    infoText: {
        marginBottom: 4,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    metadataContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: 12,
        marginBottom: 4,
    },
    timestampsContainer: {
        flexDirection: 'column',
    },
    timestamp: {
        color: '#666',
        fontSize: 11,
        marginBottom: 2,
    },
    statusChip: {
        borderRadius: 4,
        height: 28,
        alignSelf: 'flex-start',
    },
    divider: {
        marginVertical: 8,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 0,
        marginTop: 8,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
    approveButton: {
        borderRadius: 4,
        borderWidth: 1,
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16,
    },
    rejectButton: {
        borderRadius: 4,
        borderWidth: 1,
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16,
    },
    requestButton: {
        borderRadius: 4,
        borderWidth: 1,
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16,
    },
    iconButtons: {
        flexDirection: 'row',
    },
})

export default StockOutListItem