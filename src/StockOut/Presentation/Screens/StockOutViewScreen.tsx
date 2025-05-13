// src/StockOut/Presentation/Screens/StockOutViewScreen.tsx
import React, { useState, useEffect } from 'react'
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native'
import {
    Appbar,
    Button,
    Text,
    Snackbar,
    Surface,
    ActivityIndicator,
    List,
    Chip,
    Divider,
} from 'react-native-paper'
import { formatDate, formatDateTime } from '@/src/Core/Utils'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import {
    RootScreenNavigationProp,
    RootStackParamList,
} from '@/src/Core/Presentation/Navigation/Types/Index'
import { observer } from 'mobx-react'
import { useStockOutStore } from '../Stores/StockOutStore/UseStockOutStore'
import { withProviders } from '@/src/Core/Presentation/Utils/WithProviders'
import { StockOutStoreProvider } from '../Stores/StockOutStore/StockOutStoreProvider'
import { useTheme } from '@/src/Core/Presentation/Theme/ThemeProvider'
import { Status, getStatusDisplayName, getStatusColor } from '@/src/Common/Domain/Enums/Status'
import { useAuthStore } from '@/src/Auth/Presentation/Stores/AuthStore/UseAuthStore'
import { AuthStoreProvider } from '@/src/Auth/Presentation/Stores/AuthStore/AuthStoreProvider'
import {
    PRIORITY,
    getPriorityDisplayName,
    getPriorityColor,
} from '@/src/Common/Domain/Enums/Priority'

// Custom Accordion Component with centered title
const CenteredAccordion = ({
    title,
    expanded,
    onPress,
    children,
}: {
    title: string
    expanded: boolean
    onPress: () => void
    children: React.ReactNode
}) => {
    return (
        <List.Accordion
            title={title}
            expanded={expanded}
            onPress={onPress}
            style={styles.accordion}
            titleStyle={styles.accordionTitle}
            right={props => (
                <List.Icon
                    {...props}
                    icon={expanded ? 'chevron-up' : 'chevron-down'}
                    style={styles.accordionIcon}
                />
            )}
        >
            {children}
        </List.Accordion>
    )
}

// Read-only version of the goods item component with Text components
const ReadOnlyGoodsItem = ({ item }: any) => (
    <Surface style={styles.goodsItemCard} elevation={1}>
        <View style={styles.goodsItemHeader}>
            <Text style={styles.goodsCodeText}>{item.code || ''}</Text>
        </View>

        <Text style={styles.goodsName}>{item.name || ''}</Text>

        <View style={styles.infoSection}>
            <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                    <Text style={styles.labelText}>Quantity</Text>
                    <Text style={styles.valueText}>{(item.quantity || 0).toString()}</Text>
                </View>
            </View>

            {item.notes && (
                <View style={styles.notesSection}>
                    <Text style={styles.labelText}>Notes</Text>
                    <Text style={styles.notesText}>{item.notes}</Text>
                </View>
            )}
        </View>
    </Surface>
)

type StockOutViewScreenRouteProp = RouteProp<RootStackParamList, 'StockOutView'>

const StockOutViewScreen = observer(() => {
    const navigation = useNavigation<RootScreenNavigationProp<'StockOut'>>()
    const route = useRoute<StockOutViewScreenRouteProp>()
    const stockOutStore = useStockOutStore()
    const authStore = useAuthStore()
    const theme = useTheme()

    // Get stock ID from route params
    const stockId = route.params?.id

    // States
    const [infoExpanded, setInfoExpanded] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [snackbarVisible, setSnackbarVisible] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('')

    // Fetch stock data when component mounts
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                // Load stock details
                if (stockId) {
                    const stockOut = await stockOutStore.getStockOutById(stockId)
                    if (!stockOut) {
                        showSnackbar('Failed to load stock out details')
                    }
                } else {
                    showSnackbar('No stock ID provided')
                }
            } catch (error) {
                console.error('Error loading data:', error)
                showSnackbar('Error loading stock out details')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [stockId])

    const handleGoBack = () => {
        navigation.goBack()
    }

    const showSnackbar = (message: string) => {
        setSnackbarMessage(message)
        setSnackbarVisible(true)
    }

    // Get background color based on priority
    const getAccordionBackgroundColor = () => {
        const stockOutData = stockOutStore.selectedStockOut
        if (!stockOutData || stockOutData.priority === null || stockOutData.priority === undefined) 
            return '#f5f5f5' // Default light gray
        
        switch (stockOutData.priority) {
            case PRIORITY.High:
                return '#ffebee' // Light red
            case PRIORITY.Medium:
                return '#fff3e0' // Light orange
            case PRIORITY.Low:
                return '#e8f5e9' // Light green
            default:
                return '#f5f5f5' // Default light gray
        }
    }

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.theme.colors.background },
            ]}
        >
            <StatusBar style={theme.isDarkTheme ? 'light' : 'dark'} />
            <SafeAreaView style={{ flex: 1 }} edges={['right', 'left']}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={handleGoBack} />
                    <Appbar.Content title="View Stock Out" />
                </Appbar.Header>

                {isLoading || !stockOutStore.selectedStockOut ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="large"
                            color={theme.theme.colors.primary}
                        />
                        <Text style={styles.loadingText}>
                            Loading stock out details...
                        </Text>
                    </View>
                ) : (
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <ScrollView style={styles.scrollView}>
                            {/* Information Section with Accordion */}
                            <Surface
                                style={[
                                    styles.accordionContainer,
                                    { backgroundColor: getAccordionBackgroundColor() }
                                ]}
                                elevation={2}
                            >
                                <CenteredAccordion
                                    title="Stock Out Information"
                                    expanded={infoExpanded}
                                    onPress={() => setInfoExpanded(!infoExpanded)}
                                >
                                    <View style={styles.infoContainer}>
                                        {/* Code and Priority section (formerly in header) */}
                                        <View style={styles.headerSection}>
                                            <View style={styles.codeContainer}>
                                                <View>
                                                    <Text style={styles.labelText}>Code</Text>
                                                    <Text style={styles.codeText}>{stockOutStore.selectedStockOut.code}</Text>
                                                </View>
                                                {stockOutStore.selectedStockOut.priority !== undefined && 
                                                stockOutStore.selectedStockOut.priority !== null && (
                                                    <Chip
                                                        style={{
                                                            backgroundColor: getPriorityColor(
                                                                stockOutStore.selectedStockOut.priority
                                                            ),
                                                        }}
                                                        textStyle={styles.priorityChip}
                                                    >
                                                        {getPriorityDisplayName(stockOutStore.selectedStockOut.priority)}
                                                    </Chip>
                                                )}
                                            </View>
                                        </View>

                                        {/* Status and Timestamps section (formerly in header) */}
                                        <View style={styles.statusSection}>
                                            <View style={styles.statusContainer}>
                                                <Text style={styles.labelText}>Status</Text>
                                                <Chip
                                                    style={[
                                                        styles.statusChip,
                                                        {
                                                            backgroundColor: getStatusColor(stockOutStore.selectedStockOut.status as Status),
                                                        },
                                                    ]}
                                                    textStyle={styles.statusText}
                                                >
                                                    {getStatusDisplayName(stockOutStore.selectedStockOut.status as Status)}
                                                </Chip>
                                            </View>
                                            <View style={styles.timestampsContainer}>
                                                <Text style={styles.labelText}>Created</Text>
                                                <Text style={styles.valueText}>
                                                    {formatDateTime(stockOutStore.selectedStockOut.createdAt)}
                                                </Text>
                                                <Text style={[styles.labelText, styles.updatedLabel]}>Updated</Text>
                                                <Text style={styles.valueText}>
                                                    {formatDateTime(stockOutStore.selectedStockOut.updatedAt)}
                                                </Text>
                                            </View>
                                        </View>

                                        <Divider style={styles.divider} />

                                        <Text style={styles.sectionTitle}>General Information</Text>
                                        
                                        <View style={styles.infoRow}>
                                            <View style={styles.infoColumn}>
                                                <Text style={styles.labelText}>Stock Out Date</Text>
                                                <Text style={styles.valueText}>
                                                    {formatDate(stockOutStore.selectedStockOut.outDate)}
                                                </Text>
                                            </View>
                                            <View style={styles.infoColumn}>
                                                <Text style={styles.labelText}>Created By</Text>
                                                <Text style={styles.valueText}>
                                                    {stockOutStore.selectedStockOut.createdBy || 'N/A'}
                                                </Text>
                                            </View>
                                        </View>

                                        <Text style={[styles.sectionTitle, styles.receiverTitle]}>Receiver Information</Text>
                                        
                                        <View style={styles.infoRow}>
                                            <View style={styles.infoColumn}>
                                                <Text style={styles.labelText}>Receiver Name</Text>
                                                <Text style={styles.valueText}>
                                                    {stockOutStore.selectedStockOut.receiverName || 'N/A'}
                                                </Text>
                                            </View>
                                            <View style={styles.infoColumn}>
                                                <Text style={styles.labelText}>Receiver Phone</Text>
                                                <Text style={styles.valueText}>
                                                    {stockOutStore.selectedStockOut.receiverPhone || 'N/A'}
                                                </Text>
                                            </View>
                                        </View>

                                        {stockOutStore.selectedStockOut.notes && (
                                            <View style={styles.notesContainer}>
                                                <Text style={styles.labelText}>Notes</Text>
                                                <Text style={styles.notesText}>
                                                    {stockOutStore.selectedStockOut.notes}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </CenteredAccordion>
                            </Surface>

                            {/* Goods Details Section */}
                            <Surface style={styles.detailsCard} elevation={2}>
                                <Text style={styles.detailsTitle}>
                                    Goods Items ({stockOutStore.selectedStockOut.details?.length || 0})
                                </Text>
                                
                                <Divider style={styles.divider} />

                                {!stockOutStore.selectedStockOut.details || 
                                 stockOutStore.selectedStockOut.details.length === 0 ? (
                                    <Text style={styles.emptyListText}>
                                        No items in this stock out record.
                                    </Text>
                                ) : (
                                    <View style={styles.goodsList}>
                                        {stockOutStore.selectedStockOut.details.map((item) => (
                                            <ReadOnlyGoodsItem key={item.id} item={item} />
                                        ))}
                                    </View>
                                )}
                            </Surface>

                            {/* Action Button - Back button */}
                            <View style={styles.actionButtons}>
                                <Button
                                    mode="contained"
                                    onPress={handleGoBack}
                                    style={styles.backButton}
                                >
                                    Back
                                </Button>
                            </View>

                            {/* Bottom padding */}
                            <View style={styles.bottomPadding} />
                        </ScrollView>
                    </TouchableWithoutFeedback>
                )}

                {/* Snackbar for messages */}
                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={2000}
                >
                    {snackbarMessage}
                </Snackbar>
            </SafeAreaView>
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
    },
    // Accordion container
    accordionContainer: {
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 16,
    },
    accordion: {
        padding: 0,
    },
    accordionTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    accordionIcon: {
        margin: 0,
    },
    // Info container styles
    infoContainer: {
        padding: 16,
        backgroundColor: '#ffffff', // White background for content
    },
    // Header section (moved from header card)
    headerSection: {
        marginBottom: 16,
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    codeText: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    priorityChip: {
        color: 'white',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16,
    },
    // Status section
    statusSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statusContainer: {
        flex: 1,
    },
    statusChip: {
        marginTop: 4,
        width: 80,
        borderRadius: 4,
        height: 28,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16,
    },
    timestampsContainer: {
        flex: 1,
        alignItems: 'flex-end',
    },
    updatedLabel: {
        marginTop: 8,
    },
    divider: {
        marginVertical: 16,
    },
    // Section styles
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    receiverTitle: {
        marginTop: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    infoColumn: {
        flex: 1,
        marginRight: 8,
    },
    labelText: {
        fontSize: 12,
        color: '#757575',
        marginBottom: 4,
    },
    valueText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    notesContainer: {
        marginTop: 8,
    },
    notesText: {
        fontSize: 14,
        color: '#333',
        marginTop: 4,
        lineHeight: 20,
    },
    // Details card styles
    detailsCard: {
        borderRadius: 8,
        marginBottom: 16,
        overflow: 'hidden',
        paddingVertical: 16,
    },
    detailsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    goodsList: {
        paddingHorizontal: 8,
    },
    // Goods item styles
    goodsItemCard: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        marginHorizontal: 8,
    },
    goodsItemHeader: {
        marginBottom: 8,
    },
    goodsCodeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1976d2',
    },
    goodsName: {
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 12,
    },
    infoSection: {
        marginTop: 4,
    },
    infoItem: {
        flex: 1,
    },
    notesSection: {
        marginTop: 8,
    },
    emptyListText: {
        textAlign: 'center',
        marginVertical: 20,
        color: '#666',
        padding: 16,
    },
    // Action button styles
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
        marginBottom: 8,
    },
    backButton: {
        flex: 1,
        marginHorizontal: 4,
        paddingVertical: 6,
        borderRadius: 4,
    },
    bottomPadding: {
        height: 40,
    },
})

export default withProviders(
    StockOutStoreProvider,
    AuthStoreProvider
)(StockOutViewScreen)