// src/Tracking/Presentation/Screens/TrackingScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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
  Card
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { RootScreenNavigationProp } from '@/src/Core/Presentation/Navigation/Types/Index';
import { useTheme } from '@/src/Core/Presentation/Theme/ThemeProvider';
import { StatusBar } from 'expo-status-bar';
import { observer } from 'mobx-react';
import { useTrackingStore } from '../Stores/TrackingStore/UseTrackingStore';
import { withProviders } from '@/src/Core/Presentation/Utils/WithProviders';
import { TrackingStoreProvider } from '../Stores/TrackingStore/TrackingStoreProvider';

const TrackingScreen = observer(() => {
  const navigation = useNavigation<RootScreenNavigationProp<'Tracking'>>();
  const theme = useTheme();
  const paperTheme = usePaperTheme();
  const trackingStore = useTrackingStore();
  
  const [code, setCode] = useState('');
  const [trackingTypeMenuVisible, setTrackingTypeMenuVisible] = useState(false);
  const [trackingType, setTrackingType] = useState('POSITION');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const trackingTypeOptions = [
    { label: 'Position', value: 'POSITION' },
    { label: 'Goods', value: 'GOODS' },
  ];

  useEffect(() => {
    // Reset store data when component mounts
    trackingStore.clearTrackingData();
  }, []);

  useEffect(() => {
    // Show snackbar when there's an error
    if (trackingStore.error) {
      setSnackbarVisible(true);
    }
  }, [trackingStore.error]);

  const handleGoBack = () => {
    navigation.navigate('Home');
  };

  const handleScan = async () => {
    if (!code.trim()) {
      trackingStore.setError('Please enter a code');
      return;
    }

    if (trackingType === 'POSITION') {
      await trackingStore.trackByLocation(code);
    } else if (trackingType === 'GOODS') {
      await trackingStore.trackByGoods(code);
    }
  };

  const renderLocationTrackingTable = () => (
    <Card style={styles.tableCard}>
      <Card.Title title="Goods at this Location" />
      <Card.Content>
        <ScrollView horizontal>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title style={styles.codeColumn}>Code</DataTable.Title>
              <DataTable.Title style={styles.nameColumn}>Name</DataTable.Title>
              <DataTable.Title numeric style={styles.numericColumn}>Quantity</DataTable.Title>
              <DataTable.Title numeric style={styles.numericColumn}>Locked</DataTable.Title>
              <DataTable.Title numeric style={styles.numericColumn}>Available</DataTable.Title>
            </DataTable.Header>

            <ScrollView style={styles.tableScrollView}>
              {trackingStore.locationTrackingData.map((item, index) => (
                <DataTable.Row key={index}>
                  <DataTable.Cell style={styles.codeColumn}>{item.goodsCode}</DataTable.Cell>
                  <DataTable.Cell style={styles.nameColumn}>{item.goodsName}</DataTable.Cell>
                  <DataTable.Cell numeric style={styles.numericColumn}>{item.quantity}</DataTable.Cell>
                  <DataTable.Cell numeric style={styles.numericColumn}>{item.lockQuantity}</DataTable.Cell>
                  <DataTable.Cell numeric style={styles.numericColumn}>{item.availableQuantity}</DataTable.Cell>
                </DataTable.Row>
              ))}
            </ScrollView>
          </DataTable>
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const renderGoodsTrackingTable = () => (
    <Card style={styles.tableCard}>
      <Card.Title title="Locations with this Goods" />
      <Card.Content>
        <ScrollView horizontal>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title style={styles.warehouseColumn}>Warehouse</DataTable.Title>
              <DataTable.Title style={styles.areaColumn}>Area</DataTable.Title>
              <DataTable.Title style={styles.rowColumn}>Row</DataTable.Title>
              <DataTable.Title style={styles.shelfColumn}>Shelf</DataTable.Title>
              <DataTable.Title numeric style={styles.numericColumn}>Qty</DataTable.Title>
              <DataTable.Title numeric style={styles.numericColumn}>Locked</DataTable.Title>
              <DataTable.Title numeric style={styles.numericColumn}>Available</DataTable.Title>
            </DataTable.Header>

            <ScrollView style={styles.tableScrollView}>
              {trackingStore.goodsTrackingData.map((item, index) => (
                <DataTable.Row key={index}>
                  <DataTable.Cell style={styles.warehouseColumn}>{item.warehouseName}</DataTable.Cell>
                  <DataTable.Cell style={styles.areaColumn}>{item.areaName}</DataTable.Cell>
                  <DataTable.Cell style={styles.rowColumn}>{item.rowName}</DataTable.Cell>
                  <DataTable.Cell style={styles.shelfColumn}>{`${item.shelfName} (${item.level}/${item.position})`}</DataTable.Cell>
                  <DataTable.Cell numeric style={styles.numericColumn}>{item.quantity}</DataTable.Cell>
                  <DataTable.Cell numeric style={styles.numericColumn}>{item.lockQuantity}</DataTable.Cell>
                  <DataTable.Cell numeric style={styles.numericColumn}>{item.availableQuantity}</DataTable.Cell>
                </DataTable.Row>
              ))}
            </ScrollView>
          </DataTable>
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const renderResultsContent = () => {
    if (trackingStore.isLoading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading tracking data...</Text>
        </View>
      );
    }

    if (trackingStore.error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No data found or an error occurred.</Text>
        </View>
      );
    }

    if (trackingStore.activeTrackingType === 'POSITION' && trackingStore.locationTrackingData.length > 0) {
      return renderLocationTrackingTable();
    }

    if (trackingStore.activeTrackingType === 'GOODS' && trackingStore.goodsTrackingData.length > 0) {
      return renderGoodsTrackingTable();
    }

    return (
      <View style={styles.emptyContainer}>
        <Text>Enter a code and press Scan to view tracking information</Text>
      </View>
    );
  };

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
                  onDismiss={() => setTrackingTypeMenuVisible(false)}
                  anchor={
                    <TextInput
                      dense
                      value={
                        trackingType
                          ? trackingTypeOptions.find(
                              t => t.value === trackingType
                            )?.label || 'Position'
                          : 'Position'
                      }
                      mode="outlined"
                      label={'Type'}
                      editable={false}
                      right={
                        <TextInput.Icon
                          icon="menu-down"
                          onPress={() => setTrackingTypeMenuVisible(true)}
                        />
                      }
                      onTouchStart={() => setTrackingTypeMenuVisible(true)}
                    />
                  }
                >
                  {trackingTypeOptions.map(type => (
                    <Menu.Item
                      key={type.value}
                      onPress={() => {
                        setTrackingType(type.value);
                        setTrackingTypeMenuVisible(false);
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
                placeholder={trackingType === 'POSITION' ? 'SHELF_CODE/LEVEL/POSITION' : 'GOODS_CODE'}
                label={'Code'}
              />
            </View>
            
            <Button 
              mode="outlined" 
              style={styles.scanButton}
              buttonColor="transparent"
              textColor="#6200ee"
              onPress={handleScan}
              icon="qrcode-scan"
              loading={trackingStore.isLoading}
              disabled={trackingStore.isLoading}
            >
              Scan
            </Button>
          </View>

          <View style={styles.resultsContainer}>
            {renderResultsContent()}
          </View>
        </View>
      </SafeAreaView>

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
  );
});

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
  codeInput: {
    flex: 1,
  },
  scanButton: {
    justifyContent: 'center',
    borderColor: '#e0e0e0',
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
  // Column styles for horizontal scrolling tables
  codeColumn: {
    width: 130,
  },
  nameColumn: {
    width: 200,
  },
  numericColumn: {
    width: 90,
  },
  warehouseColumn: {
    width: 120,
  },
  areaColumn: {
    width: 150,
  },
  rowColumn: {
    width: 150,
  },
  shelfColumn: {
    width: 160,
  }
});

export default withProviders(TrackingStoreProvider)(TrackingScreen);