import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Appbar, Searchbar, ActivityIndicator, Text, Chip, FAB, Card, Button, Badge, Divider, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { RootScreenNavigationProp } from 'src/Core/Presentation/Navigation/Types/Index';
import { observer } from 'mobx-react';
import { useStockInStore } from '../Stores/StockInStore/UseStockInStore';
import { withProviders } from 'src/Core/Presentation/Utils/WithProviders';
import { StockInStoreProvider } from '../Stores/StockInStore/StockInStoreProvider';
import { useI18n } from 'src/Core/Presentation/Hooks/UseI18n';
import { useTheme } from 'src/Core/Presentation/Theme/ThemeProvider';
import StockInForm from '../Components/StockInForm';
import { StatusBar } from 'expo-status-bar';
import StockInEntity from '../../Domain/Entities/StockInEntity';

const StockInScreen = observer(() => {
  const navigation = useNavigation<RootScreenNavigationProp<'StockIn'>>();
  const stockInStore = useStockInStore();
  const theme = useTheme();
  const i18n = useI18n();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // Load stock in data when component mounts
    stockInStore.getStockIns();
  }, [stockInStore]);

  const handleGoBack = () => {
    navigation.navigate('Home');
  };

  const handleSearch = () => {
    stockInStore.search(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    stockInStore.search('');
  };

  const getStatusColor = (status: StockInEntity['status']) => {
    switch (status) {
      case 'pending':
        return '#ff9800'; // Orange
      case 'completed':
        return '#4caf50'; // Green
      case 'cancelled':
        return '#f44336'; // Red
      default:
        return '#757575'; // Grey
    }
  };

  const renderStockInItem = ({ item }: { item: StockInEntity }) => {
    const statusColor = getStatusColor(item.status);
    const formattedDate = new Date(item.date).toLocaleDateString();
    
    return (
      <Card style={styles.card} onPress={() => stockInStore.getStockInDetails(item.id)}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View>
              <Text variant="titleMedium">{item.productName}</Text>
              <Text variant="bodySmall">Product ID: {item.productId}</Text>
            </View>
            <Badge
              style={{
                backgroundColor: statusColor,
                color: 'white',
              }}
            >
              {item.status}
            </Badge>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.cardDetails}>
            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.detailLabel}>Quantity:</Text>
              <Text variant="bodyMedium" style={styles.detailValue}>
                {item.quantity} {item.unit}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.detailLabel}>Date:</Text>
              <Text variant="bodyMedium" style={styles.detailValue}>{formattedDate}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.detailLabel}>Received By:</Text>
              <Text variant="bodyMedium" style={styles.detailValue}>{item.receivedBy}</Text>
            </View>
            
            {item.supplierName && (
              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={styles.detailLabel}>Supplier:</Text>
                <Text variant="bodyMedium" style={styles.detailValue}>{item.supplierName}</Text>
              </View>
            )}
          </View>
        </Card.Content>
        
        <Card.Actions>
          {item.status === 'pending' && (
            <>
              <Button onPress={() => stockInStore.updateStatus(item.id, 'completed')}>
                Complete
              </Button>
              <Button onPress={() => stockInStore.updateStatus(item.id, 'cancelled')}>
                Cancel
              </Button>
            </>
          )}
        </Card.Actions>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.theme.colors.background }}>
      <StatusBar style={theme.isDarkTheme ? 'light' : 'dark'} />
      <SafeAreaView style={{ flex: 1 }} edges={['right', 'left']}>
        <Appbar.Header>
          <Appbar.BackAction onPress={handleGoBack} />
          <Appbar.Content title="Stock In" />
          {!showAddForm && (
            <Appbar.Action icon="plus" onPress={() => setShowAddForm(true)} />
          )}
        </Appbar.Header>

        {showAddForm ? (
          <StockInForm onCancel={() => setShowAddForm(false)} />
        ) : (
          <>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Searchbar
                placeholder="Search stock ins"
                onChangeText={setSearchQuery}
                value={searchQuery}
                onSubmitEditing={handleSearch}
                onClearIconPress={handleClearSearch}
                style={styles.searchbar}
              />
            </View>

            {/* Status Filter */}
            <View style={styles.filterContainer}>
              <SegmentedButtons
                value={stockInStore.filters.status || 'all'}
                onValueChange={(value) => 
                  stockInStore.filterByStatus(value === 'all' ? undefined : value as any)
                }
                buttons={[
                  { value: 'all', label: 'All' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
              />
            </View>

            {/* Stock In List */}
            {stockInStore.isLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" />
                <Text style={styles.loaderText}>Loading stock ins...</Text>
              </View>
            ) : stockInStore.isEmpty ? (
              <View style={styles.emptyContainer}>
                <Text variant="bodyLarge">No stock in records found</Text>
                <Button 
                  mode="contained" 
                  onPress={() => stockInStore.resetFilters()}
                  style={styles.resetButton}
                >
                  Reset Filters
                </Button>
              </View>
            ) : (
              <FlatList
                data={stockInStore.results}
                keyExtractor={(item) => item.id}
                renderItem={renderStockInItem}
                contentContainerStyle={styles.listContent}
              />
            )}

            <FAB
              icon="plus"
              style={styles.fab}
              onPress={() => setShowAddForm(true)}
            />
          </>
        )}
      </SafeAreaView>
    </View>
  );
});

const styles = StyleSheet.create({
  searchContainer: {
    padding: 16,
  },
  searchbar: {
    elevation: 0,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  card: {
    marginBottom: 12,
    borderRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  divider: {
    marginVertical: 8,
  },
  cardDetails: {
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    flex: 1,
    fontWeight: 'bold',
  },
  detailValue: {
    flex: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Extra padding for FAB
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  resetButton: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default withProviders(StockInStoreProvider)(StockInScreen);