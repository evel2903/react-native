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
} from 'react-native-paper'
import { formatDate } from '@/src/Core/Utils'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import {
    RootScreenNavigationProp,
    RootStackParamList,
} from '@/src/Core/Presentation/Navigation/Types/Index'
import { observer } from 'mobx-react'
import { useStockOutStore } from '../Stores/StockOutStore/UseStockOutStore'
import { useMasterDataStore } from '@/src/Common/Presentation/Stores/MasterDataStore/UseMasterDataStore'
import { withProviders } from '@/src/Core/Presentation/Utils/WithProviders'
import { StockOutStoreProvider } from '../Stores/StockOutStore/StockOutStoreProvider'
import { MasterDataStoreProvider } from '@/src/Common/Presentation/Stores/MasterDataStore/MasterDataStoreProvider'
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

type StockOutViewScreenRouteProp = RouteProp<RootStackParamList, 'StorageView'>

const StockOutViewScreen = observer(() => {
    const navigation = useNavigation<RootScreenNavigationProp<'StockOut'>>()
    const route = useRoute<StockOutViewScreenRouteProp>()
    const stockOutStore = useStockOutStore()
    const masterDataStore = useMasterDataStore()
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

    // Render the form content inside the accordion
    const renderFormContent = () => {
        const stockOutData = stockOutStore.selectedStockOut

        if (!stockOutData) return null

        return (
            <>
                {/* Code Section with Priority Chip */}
                <View style={styles.codeSection}>
                    <View style={styles.codeContainer}>
                        <View>
                            <Text style={styles.labelText}>Code</Text>
                            <Text style={styles.valueText}>{stockOutData.code || '-'}</Text>
                        </View>
                        {stockOutData.priority !== null && stockOutData.priority !== undefined && (
                            <View style={styles.priorityChipWrapper}>
                                <Chip
                                    style={{
                                        backgroundColor: getPriorityColor(stockOutData.priority as any),
                                    }}
                                    textStyle={styles.priorityChipText}
                                >
                                    {getPriorityDisplayName(stockOutData.priority as any)}
                                </Chip>
                            </View>
                        )}
                    </View>
                </View>

                {/* Date and Status Row */}
                <View style={styles.infoRow}>
                    <View style={styles.infoColumn}>
                        <Text style={styles.labelText}>Out Date</Text>
                        <Text style={styles.valueText}>
                            {stockOutData.outDate ? formatDate(stockOutData.outDate) : '-'}
                        </Text>
                    </View>
                    <View style={styles.infoColumn}>
                        <Text style={styles.labelText}>Status</Text>
                        <View style={styles.statusContainer}>
                            <Chip
                                style={{
                                    backgroundColor: getStatusColor(stockOutData.status as Status),
                                }}
                                textStyle={styles.statusChipText}
                            >
                                {getStatusDisplayName(stockOutData.status as Status)}
                            </Chip>
                        </View>
                    </View>
                </View>

                {/* Receiver Information */}
                <View style={styles.infoRow}>
                    <View style={styles.infoColumn}>
                        <Text style={styles.labelText}>Receiver Name</Text>
                        <Text style={styles.valueText}>{stockOutData.receiverName || '-'}</Text>
                    </View>
                    <View style={styles.infoColumn}>
                        <Text style={styles.labelText}>Receiver Phone</Text>
                        <Text style={styles.valueText}>{stockOutData.receiverPhone || '-'}</Text>
                    </View>
                </View>

                {/* Created by and Timestamps Row */}
                <View style={styles.infoRow}>
                    <View style={styles.infoColumn}>
                        <Text style={styles.labelText}>Created By</Text>
                        <Text style={styles.valueText}>{stockOutData.createdBy || '-'}</Text>
                    </View>
                    <View style={styles.infoColumn}>
                        <Text style={styles.labelText}>Created At</Text>
                        <Text style={styles.valueText}>
                            {stockOutData.createdAt ? formatDate(stockOutData.createdAt) : '-'}
                        </Text>
                    </View>
                </View>

                {/* Notes Section */}
                {stockOutData.notes && (
                    <View style={styles.infoSection}>
                        <Text style={styles.labelText}>Notes</Text>
                        <Text style={styles.notesText}>{stockOutData.notes}</Text>
                    </View>
                )}
            </>
        )
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
                            {/* Accordion for form info section */}
                            <Surface
                                style={[
                                    styles.accordionContainer,
                                    { backgroundColor: getAccordionBackgroundColor() }
                                ]}
                                elevation={1}
                            >
                                <CenteredAccordion
                                    title="Stock Out Information"
                                    expanded={infoExpanded}
                                    onPress={() =>
                                        setInfoExpanded(!infoExpanded)
                                    }
                                >
                                    <View style={styles.formContent}>
                                        {renderFormContent()}
                                    </View>
                                </CenteredAccordion>
                            </Surface>

                            {/* Goods List */}
                            <View style={styles.goodsListHeader}>
                                <Text style={styles.goodsListTitle}>
                                    Goods list
                                </Text>
                            </View>

                            {!stockOutStore.selectedStockOut?.details ||
                            stockOutStore.selectedStockOut.details.length === 0 ? (
                                <Text style={styles.emptyListText}>
                                    No items in this stock out record.
                                </Text>
                            ) : (
                                stockOutStore.selectedStockOut.details.map(
                                    item => (
                                        <ReadOnlyGoodsItem
                                            key={item.id}
                                            item={item}
                                        />
                                    )
                                )
                            )}

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
    // Accordion styles
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
    },
    accordionIcon: {
        margin: 0,
    },
    formContent: {
        padding: 12,
        backgroundColor: '#ffffff', // White background for the expanded content
    },
    // Code section with priority chip
    codeSection: {
        marginBottom: 16,
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    priorityChipWrapper: {
        marginLeft: 12,
        alignSelf: 'center',
    },
    priorityChipText: {
        color: 'white',
        fontSize: 11,
        textAlign: 'center',
        lineHeight: 15,
    },
    statusContainer: {
        marginTop: 4,
    },
    statusChipText: {
        color: 'white',
        fontSize: 11,
        textAlign: 'center',
        lineHeight: 15,
    },
    // Form information styles
    infoSection: {
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 16,
    },
    infoColumn: {
        flex: 1,
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
    notesText: {
        fontSize: 14,
        color: '#333',
        marginTop: 4,
        lineHeight: 20,
    },
    goodsListHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 8,
    },
    goodsListTitle: {
        fontSize: 18,
        fontWeight: 'bold',
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
    emptyListText: {
        textAlign: 'center',
        marginVertical: 20,
        color: '#666',
    },
    // Goods item styles
    goodsItemCard: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    goodsItemHeader: {
        marginBottom: 8,
    },
    goodsCodeText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1976d2',
    },
    goodsName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    goodsItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    infoItem: {
        flex: 1,
    },
    notesSection: {
        marginTop: 8,
    },
})

export default withProviders(
    StockOutStoreProvider,
    MasterDataStoreProvider,
    AuthStoreProvider
)(StockOutViewScreen)