import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Appbar, Searchbar, ActivityIndicator, Text, Chip, FAB, Card, Button, Badge, Divider, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { RootScreenNavigationProp } from 'src/Core/Presentation/Navigation/Types/Index';
import { observer } from 'mobx-react';
import { useStockOutStore } from '../Stores/StockOutStore/UseStockOutStore';
import { withProviders } from 'src/Core/Presentation/Utils/WithProviders';
import { StockOutStoreProvider } from '../Stores/StockOutStore/StockOutStoreProvider';
import { useI18n } from 'src/Core/Presentation/Hooks/UseI18n';
import { useTheme } from 'src/Core/Presentation/Theme/ThemeProvider';
import StockOutForm from '../Components/StockOutForm';
import { StatusBar } from 'expo-status-bar';
import StockOutEntity from '../../Domain/Entities/StockOutEntity';

const StockOutScreen = observer(() => {
  const navigation = useNavigation<RootScreenNavigationProp<'StockOut'>>();
  const stockOutStore = useStockOutStore();
  const theme = useTheme();
  const i18n = useI18n();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // Load stock out data when component mounts
    stockOutStore.getStockOuts();
  }, [stockOutStore]);

  const handleGoBack = () => {
    navigation.navigate('Home');
  };

  const handleSearch = () => {
    stockOutStore.search(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    stockOutStore.search('');
  };

  const getStatusColor = (status: StockOutEntity['status']) => {
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

  const renderStockOutItem = ({ item }: { item: StockOutEntity }) => {
    const statusColor = getStatusColor(item.status);
    const formattedDate = new Date(item.date).toLocaleDateString();
    
    return (
      <Card style={styles.card} onPress={() => stockOutStore.getStockOutDetails(item.id)}>
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
              <Text variant="bodyMedium" style={styles.detailLabel}>Issued By:</Text>
              <Text variant="bodyMedium" style={styles.detailValue}>{item.issuedBy}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.detailLabel}>Issued To:</Text>
              <Text variant="bodyMedium" style={styles.detailValue}>{item.issuedTo}</Text>
            </View>
            
            {item.reason && (
              <View style={styles.detailRow}>
                <Text variant="bodyMedium" style={styles.detailLabel}>Reason:</Text>
                <Text variant="bodyMedium" style={styles.detailValue}>{item.reason}</Text>
              </View>
            )}
          </View>
        </Card.Content>
        
        <Card.Actions>
          {item.status === 'pending' && (
            <>
              <Button onPress={() => stockOutStore.updateStatus(item.id, 'completed')}>
                Complete
              </Button>
              <Button onPress={() => stockOutStore.updateStatus(item.id, 'cancelled')}>
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
          <Appbar.Content title="Stock Out" />
          {!showAddForm && (
            <Appbar.Action icon="plus" onPress={() => setShowAddForm(true)} />
          )}
        </Appbar.Header>

        {showAddForm ? (
          <StockOutForm onCancel={() => setShowAddForm(false)} />
        ) : (
          <>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Searchbar
                placeholder="Search stock outs"
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
                value={stockOutStore.filters.status || 'all'}
                onValueChange={(value) => 
                  stockOutStore.filterByStatus(value === 'all' ? undefined : value as any)
                }
                buttons={[
                  { value: 'all', label: 'All' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
              />
            </View>

            {/* Stock Out List */}
            {stockOutStore.isLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" />
                <Text style={styles.loaderText}>Loading stock outs...</Text>
              </View>
            ) : stockOutStore.isEmpty ? (
              <View style={styles.emptyContainer}>
                <Text variant="bodyLarge">No stock out records found</Text>
                <Button 
                  mode="contained" 
                  onPress={() => stockOutStore.resetFilters()}
                  style={styles.resetButton}
                >
                  Reset Filters
                </Button>
              </View>
            ) : (
              <FlatList
                data={stockOutStore.results}
                keyExtractor={(item) => item.id}
                renderItem={renderStockOutItem}
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

export default withProviders(StockOutStoreProvider)(StockOutScreen);