// src/Tracking/Presentation/Screens/TrackingScreen.tsx
import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import {
    Appbar,
    TextInput,
    Button,
    Menu,
    Divider,
    useTheme as usePaperTheme,
    Text,
    ActivityIndicator,
    DataTable,
    Snackbar,
    Card,
} from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { RootScreenNavigationProp } from '@/src/Core/Presentation/Navigation/Types/Index'
import { useTheme } from '@/src/Core/Presentation/Theme/ThemeProvider'
import { StatusBar } from 'expo-status-bar'
import { observer } from 'mobx-react'
import { useTrackingStore } from '../Stores/TrackingStore/UseTrackingStore'
import { withProviders } from '@/src/Core/Presentation/Utils/WithProviders'
import { TrackingStoreProvider } from '../Stores/TrackingStore/TrackingStoreProvider'
import ProductScannerModal from './ProductScannerModal'

const TrackingScreen = observer(() => {
    const navigation = useNavigation<RootScreenNavigationProp<'Tracking'>>()
    const theme = useTheme()
    const paperTheme = usePaperTheme()
    const trackingStore = useTrackingStore()

    const [code, setCode] = useState('')
    const [trackingTypeMenuVisible, setTrackingTypeMenuVisible] =
        useState(false)
    const [trackingType, setTrackingType] = useState('position')
    const [snackbarVisible, setSnackbarVisible] = useState(false)
    const [scannerVisible, setScannerVisible] = useState(false)

    const trackingTypeOptions = [
        { label: 'Position', value: 'position' },
        { label: 'Goods', value: 'goods' },
    ]

    useEffect(() => {
        // Reset store data when component mounts
        trackingStore.clearTrackingData()
    }, [])

    useEffect(() => {
        // Show snackbar when there's an error
        if (trackingStore.error) {
            setSnackbarVisible(true)
        }
    }, [trackingStore.error])

    const handleGoBack = () => {
        navigation.navigate('Home')
    }

    const handleOpenScanner = () => {
        setScannerVisible(true)
    }

    const handleCloseScanner = () => {
        setScannerVisible(false)
    }

    const handleCodeScanned = (scannedCode: string) => {
        try {
            // Parse the scanned QR code data (JSON format)
            const parsedData = JSON.parse(scannedCode)
            
            if (!parsedData.code) {
                trackingStore.setError('Invalid QR code format: missing code field')
                handleCloseScanner()
                return
            }

            // Set code based on scanning type
            if (parsedData.type === 'position') {
                // Format for position tracking: SHELF_CODE/LEVEL/POSITION
                const formattedCode = `${parsedData.code}/${parsedData.level}/${parsedData.position}`
                setCode(formattedCode)
                setTrackingType('position')
                
                // Immediately process the tracking
                trackingStore.trackByLocation(formattedCode)
            } else if (parsedData.type === 'goods') {
                // Set goods code directly
                setCode(parsedData.code)
                setTrackingType('goods')
                
                // Immediately process the tracking
                trackingStore.trackByGoods(parsedData.code)
            } else {
                trackingStore.setError('Unknown tracking type in QR code')
            }
            
            handleCloseScanner()
        } catch (error) {
            // Handle parsing errors
            trackingStore.setError('Invalid QR code format. Please try again.')
            handleCloseScanner()
        }
    }

    const handleManualScan = async () => {
        if (!code.trim()) {
            trackingStore.setError('Please enter a code')
            return
        }

        if (trackingType === 'position') {
            await trackingStore.trackByLocation(code)
        } else if (trackingType === 'goods') {
            await trackingStore.trackByGoods(code)
        }
    }

    const renderLocationTrackingTable = () => (
        <Card style={styles.tableCard}>
            <Card.Title title="Goods at this Location" />
            <Card.Content>
                <ScrollView horizontal>
                    <DataTable>
                        <DataTable.Header>
                            <DataTable.Title style={styles.infoColumn}>
                                Goods Information
                            </DataTable.Title>
                            <DataTable.Title
                                numeric
                                style={styles.quantityColumn}
                            >
                                Quantity
                            </DataTable.Title>
                            <DataTable.Title
                                numeric
                                style={styles.availableColumn}
                            >
                                Available
                            </DataTable.Title>
                        </DataTable.Header>

                        <ScrollView style={styles.tableScrollView}>
                            {trackingStore.locationTrackingData.map(
                                (item, index) => (
                                    <DataTable.Row key={index}>
                                        <DataTable.Cell
                                            style={styles.infoColumn}
                                        >
                                            <View style={styles.cellContent}>
                                                <Text style={styles.codeBold}>
                                                    {item.goodsCode}
                                                </Text>
                                                <Text
                                                    style={styles.lineSpacing}
                                                >
                                                    {item.goodsName}
                                                </Text>
                                            </View>
                                        </DataTable.Cell>
                                        <DataTable.Cell
                                            numeric
                                            style={styles.quantityColumn}
                                        >
                                            <View style={styles.cellContent}>
                                                <Text
                                                    style={styles.lineSpacing}
                                                >
                                                    Total:
                                                </Text>
                                                <Text style={styles.valueText}>
                                                    {item.quantity}
                                                </Text>
                                                <Text
                                                    style={styles.lineSpacing}
                                                >
                                                    Locked:
                                                </Text>
                                                <Text style={styles.valueText}>
                                                    {item.lockQuantity}
                                                </Text>
                                            </View>
                                        </DataTable.Cell>
                                        <DataTable.Cell
                                            numeric
                                            style={styles.availableColumn}
                                        >
                                            <View style={styles.cellContent}>
                                                <Text
                                                    style={styles.lineSpacing}
                                                >
                                                    Available:
                                                </Text>
                                                <Text style={styles.valueText}>
                                                    {item.availableQuantity}
                                                </Text>
                                            </View>
                                        </DataTable.Cell>
                                    </DataTable.Row>
                                )
                            )}
                        </ScrollView>
                    </DataTable>
                </ScrollView>
            </Card.Content>
        </Card>
    )

    const renderGoodsTrackingTable = () => (
        <Card style={styles.tableCard}>
            <Card.Title title="Locations with this Goods" />
            <Card.Content>
                <ScrollView horizontal>
                    <DataTable>
                        <DataTable.Header>
                            <DataTable.Title style={styles.infoColumn}>
                                Location Information
                            </DataTable.Title>
                            <DataTable.Title
                                numeric
                                style={styles.quantityColumn}
                            >
                                Quantity
                            </DataTable.Title>
                            <DataTable.Title
                                numeric
                                style={styles.availableColumn}
                            >
                                Available
                            </DataTable.Title>
                        </DataTable.Header>

                        <ScrollView style={styles.tableScrollView}>
                            {trackingStore.goodsTrackingData.map(
                                (item, index) => (
                                    <DataTable.Row key={index}>
                                        <DataTable.Cell
                                            style={styles.infoColumn}
                                        >
                                            <View style={styles.cellContent}>
                                                <Text
                                                    style={styles.locationBold}
                                                >
                                                    {item.warehouseName}
                                                </Text>
                                                <Text
                                                    style={styles.lineSpacing}
                                                >
                                                    Area:
                                                </Text>
                                                <Text style={styles.valueText}>
                                                    {item.areaName}
                                                </Text>
                                                <Text
                                                    style={styles.lineSpacing}
                                                >
                                                    Row:
                                                </Text>
                                                <Text style={styles.valueText}>
                                                    {item.rowName}
                                                </Text>
                                                <Text
                                                    style={styles.lineSpacing}
                                                >
                                                    Shelf:
                                                </Text>
                                                <Text style={styles.valueText}>
                                                    {item.shelfName}
                                                </Text>
                                                <Text
                                                    style={styles.lineSpacing}
                                                >
                                                    Position:
                                                </Text>
                                                <Text style={styles.valueText}>
                                                    Level {item.level}, Pos{' '}
                                                    {item.position}
                                                </Text>
                                            </View>
                                        </DataTable.Cell>
                                        <DataTable.Cell
                                            numeric
                                            style={styles.quantityColumn}
                                        >
                                            <View style={styles.cellContent}>
                                                <Text
                                                    style={styles.lineSpacing}
                                                >
                                                    Total:
                                                </Text>
                                                <Text style={styles.valueText}>
                                                    {item.quantity}
                                                </Text>
                                                <Text
                                                    style={styles.lineSpacing}
                                                >
                                                    Locked:
                                                </Text>
                                                <Text style={styles.valueText}>
                                                    {item.lockQuantity}
                                                </Text>
                                            </View>
                                        </DataTable.Cell>
                                        <DataTable.Cell
                                            numeric
                                            style={styles.availableColumn}
                                        >
                                            <View style={styles.cellContent}>
                                                <Text
                                                    style={styles.lineSpacing}
                                                >
                                                    Available:
                                                </Text>
                                                <Text style={styles.valueText}>
                                                    {item.availableQuantity}
                                                </Text>
                                            </View>
                                        </DataTable.Cell>
                                    </DataTable.Row>
                                )
                            )}
                        </ScrollView>
                    </DataTable>
                </ScrollView>
            </Card.Content>
        </Card>
    )

    const renderResultsContent = () => {
        if (trackingStore.isLoading) {
            return (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" />
                    <Text style={styles.loadingText}>
                        Loading tracking data...
                    </Text>
                </View>
            )
        }

        if (trackingStore.error) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>
                        No data found or an error occurred.
                    </Text>
                </View>
            )
        }

        if (
            trackingStore.activeTrackingType === 'POSITION' &&
            trackingStore.locationTrackingData.length > 0
        ) {
            return renderLocationTrackingTable()
        }

        if (
            trackingStore.activeTrackingType === 'GOODS' &&
            trackingStore.goodsTrackingData.length > 0
        ) {
            return renderGoodsTrackingTable()
        }

        return (
            <View style={styles.emptyContainer}>
                <Text>
                    Enter a code and press Scan or use the QR scanner to view tracking information
                </Text>
            </View>
        )
    }

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.theme.colors.background },
            ]}
        >
            <StatusBar style={theme.isDarkTheme ? 'light' : 'dark'} />
            <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={handleGoBack} />
                    <Appbar.Content title="Tracking" />
                </Appbar.Header>

                <View style={styles.contentContainer}>
                    <View style={styles.inputSection}>
                        <View style={styles.inputRow}>
                            <View>
                                <Menu
                                    visible={trackingTypeMenuVisible}
                                    onDismiss={() =>
                                        setTrackingTypeMenuVisible(false)
                                    }
                                    anchor={
                                        <TextInput
                                            dense
                                            value={
                                                trackingTypeOptions.find(
                                                    t => t.value === trackingType
                                                )?.label || 'Position'
                                            }
                                            mode="outlined"
                                            label={'Type'}
                                            editable={false}
                                            right={
                                                <TextInput.Icon
                                                    icon="menu-down"
                                                    onPress={() =>
                                                        setTrackingTypeMenuVisible(
                                                            true
                                                        )
                                                    }
                                                />
                                            }
                                            onTouchStart={() =>
                                                setTrackingTypeMenuVisible(true)
                                            }
                                        />
                                    }
                                >
                                    {trackingTypeOptions.map(type => (
                                        <Menu.Item
                                            key={type.value}
                                            onPress={() => {
                                                setTrackingType(type.value)
                                                setTrackingTypeMenuVisible(
                                                    false
                                                )
                                            }}
                                            title={type.label}
                                        />
                                    ))}
                                </Menu>
                            </View>

                            <TextInput
                                dense
                                style={styles.codeInput}
                                value={code}
                                onChangeText={setCode}
                                mode="outlined"
                                placeholder={
                                    trackingType === 'position'
                                        ? 'SHELF_CODE/LEVEL/POSITION'
                                        : 'GOODS_CODE'
                                }
                                label={'Code'}
                            />
                        </View>

                        <View style={styles.buttonRow}>
                            <Button
                                mode="outlined"
                                style={styles.actionButton}
                                buttonColor="transparent"
                                textColor="#6200ee"
                                onPress={handleManualScan}
                                loading={trackingStore.isLoading}
                                disabled={trackingStore.isLoading}
                            >
                                Search
                            </Button>
                            
                            <Button
                                mode="contained"
                                style={styles.actionButton}
                                icon="qrcode-scan"
                                onPress={handleOpenScanner}
                                loading={trackingStore.isLoading}
                                disabled={trackingStore.isLoading}
                            >
                                Scan QR
                            </Button>
                        </View>
                    </View>

                    <View style={styles.resultsContainer}>
                        {renderResultsContent()}
                    </View>
                </View>
            </SafeAreaView>

            {/* Product Scanner Modal */}
            <ProductScannerModal
                visible={scannerVisible}
                onClose={handleCloseScanner}
                onCodeScanned={handleCodeScanned}
            />

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                action={{
                    label: 'Dismiss',
                    onPress: () => setSnackbarVisible(false),
                }}
            >
                {trackingStore.error || 'An error occurred'}
            </Snackbar>
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        padding: 16,
    },
    inputSection: {
        marginBottom: 24,
    },
    inputRow: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 12,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        justifyContent: 'center',
    },
    codeInput: {
        flex: 1,
    },
    resultsContainer: {
        flex: 1,
    },
    tableCard: {
        flex: 1,
    },
    tableScrollView: {
        maxHeight: 400,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        borderRadius: 8,
        padding: 16,
    },
    // Column styles for simplified 3-column layout
    infoColumn: {
        width: 200,
        paddingVertical: 8,
    },
    quantityColumn: {
        width: 120,
        paddingVertical: 8,
    },
    availableColumn: {
        width: 100,
        paddingVertical: 8,
    },
    codeBold: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    locationBold: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    cellContent: {
        paddingVertical: 4,
    },
    lineSpacing: {
        marginTop: 6,
        fontWeight: '500',
    },
    valueText: {
        marginBottom: 6,
    },
})

export default withProviders(TrackingStoreProvider)(TrackingScreen)
