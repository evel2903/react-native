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
    TouchableRipple,
    ActivityIndicator,
    List,
    Chip,
} from 'react-native-paper'
import { formatDate, formatCurrency } from '@/src/Core/Utils'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import {
    RootScreenNavigationProp,
    RootStackParamList,
} from '@/src/Core/Presentation/Navigation/Types/Index'
import { observer } from 'mobx-react'
import { useStockInStore } from '../Stores/StockInStore/UseStockInStore'
import { useMasterDataStore } from '@/src/Common/Presentation/Stores/MasterDataStore/UseMasterDataStore'
import { withProviders } from '@/src/Core/Presentation/Utils/WithProviders'
import { StockInStoreProvider } from '../Stores/StockInStore/StockInStoreProvider'
import { MasterDataStoreProvider } from '@/src/Common/Presentation/Stores/MasterDataStore/MasterDataStoreProvider'
import { useTheme } from '@/src/Core/Presentation/Theme/ThemeProvider'
import { Status, getStatusDisplayName } from '@/src/Common/Domain/Enums/Status'
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
            <Text style={styles.goodsCodeText}>{item.goodsCode || ''}</Text>
        </View>

        <Text style={styles.goodsName}>{item.goodsName || ''}</Text>

        <View style={styles.infoSection}>
            <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                    <Text style={styles.labelText}>Expiry Date</Text>
                    <Text style={styles.valueText}>{formatDate(item.expiryDate || '')}</Text>
                </View>
            </View>

            <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                    <Text style={styles.labelText}>Quantity</Text>
                    <Text style={styles.valueText}>{(item.quantity || 0).toString()}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.labelText}>Cost</Text>
                    <Text style={styles.valueText}>{formatCurrency(item.price || 0)}</Text>
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

type StockInViewScreenRouteProp = RouteProp<RootStackParamList, 'StockInView'>

const StockInViewScreen = observer(() => {
    const navigation = useNavigation<RootScreenNavigationProp<'StockIn'>>()
    const route = useRoute<StockInViewScreenRouteProp>()
    const stockInStore = useStockInStore()
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
                // Load master data
                await Promise.all([
                    masterDataStore.loadSuppliers(),
                    masterDataStore.loadUnits(),
                ])

                // Load stock details
                if (stockId) {
                    const success = await stockInStore.getStockInDetails(
                        stockId
                    )
                    if (!success) {
                        showSnackbar('Failed to load stock in details')
                    }
                } else {
                    showSnackbar('No stock ID provided')
                }
            } catch (error) {
                console.error('Error loading data:', error)
                showSnackbar('Error loading stock in details')
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
        const stockInData = stockInStore.selectedStockIn

        if (!stockInData) return null

        return (
            <>
                {/* Code Section with Priority Chip */}
                <View style={styles.codeSection}>
                    <View style={styles.codeContainer}>
                        <View>
                            <Text style={styles.labelText}>Code</Text>
                            <Text style={styles.valueText}>{stockInData.code || '-'}</Text>
                        </View>
                        <View style={styles.priorityChipWrapper}>
                            <Chip
                                style={{
                                    backgroundColor: getPriorityColor(stockInData.priority as any),
                                }}
                                textStyle={styles.priorityChipText}
                            >
                                {getPriorityDisplayName(stockInData.priority as any)}
                            </Chip>
                        </View>
                    </View>
                </View>

                {/* Supplier and Lot Number Row */}
                <View style={styles.infoRow}>
                    <View style={styles.infoColumn}>
                        <Text style={styles.labelText}>Supplier</Text>
                        <Text style={styles.valueText}>
                            {stockInData?.supplier?.name ||
                                masterDataStore.suppliers.data.find(
                                    s => s.id === stockInData?.supplierId
                                )?.name ||
                                '-'}
                        </Text>
                    </View>
                    <View style={styles.infoColumn}>
                        <Text style={styles.labelText}>Lot Number</Text>
                        <Text style={styles.valueText}>{stockInData.lotNumber || '-'}</Text>
                    </View>
                </View>

                {/* Stock In Date and Status Row */}
                <View style={styles.infoRow}>
                    <View style={styles.infoColumn}>
                        <Text style={styles.labelText}>Stock In Date</Text>
                        <Text style={styles.valueText}>
                            {stockInData.inDate ? formatDate(stockInData.inDate) : '-'}
                        </Text>
                    </View>
                    <View style={styles.infoColumn}>
                        <Text style={styles.labelText}>Status</Text>
                        <Text style={styles.valueText}>
                            {getStatusDisplayName(stockInData.status as Status)}
                        </Text>
                    </View>
                </View>

                {/* Created by and Approved by Row */}
                <View style={styles.infoRow}>
                    <View style={styles.infoColumn}>
                        <Text style={styles.labelText}>Created By</Text>
                        <Text style={styles.valueText}>{stockInData.createdBy || '-'}</Text>
                    </View>
                    <View style={styles.infoColumn}>
                        <Text style={styles.labelText}>Approved By</Text>
                        <Text style={styles.valueText}>{stockInData.approvedBy || 'Pending approval'}</Text>
                    </View>
                </View>

                {/* Total Cost Section */}
                <View style={styles.infoSection}>
                    <Text style={styles.labelText}>Total Cost</Text>
                    <Text style={styles.valueText}>
                        {formatCurrency(stockInData.totalAmount || '0')}
                    </Text>
                </View>

                {/* Notes Section */}
                {stockInData.notes && (
                    <View style={styles.infoSection}>
                        <Text style={styles.labelText}>Notes</Text>
                        <Text style={styles.notesText}>{stockInData.notes}</Text>
                    </View>
                )}
            </>
        )
    }

    // Get background color based on priority
    const getAccordionBackgroundColor = () => {
        const stockInData = stockInStore.selectedStockIn
        if (!stockInData) return '#e8f5e9' // Default light green
        
        switch (stockInData.priority) {
            case PRIORITY.High:
                return '#ffebee' // Light red
            case PRIORITY.Medium:
                return '#fff3e0' // Light orange
            case PRIORITY.Low:
                return '#e8f5e9' // Light green
            default:
                return '#e8f5e9' // Default light green
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
                    <Appbar.Content title="View Stock In" />
                </Appbar.Header>

                {isLoading || !stockInStore.selectedStockIn ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="large"
                            color={theme.theme.colors.primary}
                        />
                        <Text style={styles.loadingText}>
                            Loading stock in details...
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
                                    title="Stock In Information"
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

                            {!stockInStore.selectedStockIn?.details ||
                            stockInStore.selectedStockIn.details.length ===
                                0 ? (
                                <Text style={styles.emptyListText}>
                                    No items in this stock in record.
                                </Text>
                            ) : (
                                stockInStore.selectedStockIn.details.map(
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
    StockInStoreProvider,
    MasterDataStoreProvider,
    AuthStoreProvider
)(StockInViewScreen)