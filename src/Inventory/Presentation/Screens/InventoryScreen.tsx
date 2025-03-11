import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Appbar, Searchbar, ActivityIndicator, Text, Chip, Button, Menu, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { RootScreenNavigationProp } from '@/src/Core/Presentation/Navigation/Types/Index';
import { observer } from 'mobx-react';
import { useGetInventoryStore } from '../Stores/GetInventoryStore/UseGetInventoryStore';
import { withProviders } from '@/src/Core/Presentation/Utils/WithProviders';
import { GetInventoryStoreProvider } from '../Stores/GetInventoryStore/GetInventoryStoreProvider';
import { useI18n } from '@/src/Core/Presentation/Hooks/UseI18n';
import { useTheme } from '@/src/Core/Presentation/Theme/ThemeProvider';
import InventoryItem from '../Components/InventoryItem';
import { StatusBar } from 'expo-status-bar';

const InventoryScreen = observer(() => {
  const navigation = useNavigation<RootScreenNavigationProp<'Inventory'>>();
  const inventoryStore = useGetInventoryStore();
  const theme = useTheme();
  const i18n = useI18n();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  
  // Available categories for filtering (would come from API in real app)
  const categories = ['All', 'Electronics', 'Furniture', 'Office Supplies'];

  useEffect(() => {
    // Load inventory data when component mounts
    inventoryStore.getInventory();
  }, [inventoryStore]);

  const handleGoBack = () => {
    navigation.navigate('Home');
  };

  const handleSearch = () => {
    inventoryStore.search(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    inventoryStore.search('');
  };

  const handleFilterByCategory = (category?: string) => {
    // If 'All' is selected, pass undefined to remove the filter
    inventoryStore.filterByCategory(category === 'All' ? undefined : category);
    setFilterMenuVisible(false);
  };

  const handleSort = (field: string) => {
    inventoryStore.sort(field);
    setSortMenuVisible(false);
  };

  const handleItemPress = (id: string) => {
    // In a real app, this would navigate to a detail view
    console.log('Item pressed:', id);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.theme.colors.background }}>
      <StatusBar style={theme.isDarkTheme ? 'light' : 'dark'} />
      <SafeAreaView style={{ flex: 1 }} edges={['right', 'left']}>
        <Appbar.Header>
          <Appbar.BackAction onPress={handleGoBack} />
          <Appbar.Content title="Inventory" />
          <Appbar.Action icon="plus" onPress={() => {}} />
        </Appbar.Header>

        {/* Search and Filter Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search inventory"
            onChangeText={setSearchQuery}
            value={searchQuery}
            onSubmitEditing={handleSearch}
            onClearIconPress={handleClearSearch}
            style={styles.searchbar}
          />
          <View style={styles.filterContainer}>
            <Menu
              visible={filterMenuVisible}
              onDismiss={() => setFilterMenuVisible(false)}
              anchor={
                <Button 
                  mode="outlined" 
                  onPress={() => setFilterMenuVisible(true)}
                  icon="filter-variant"
                  style={styles.filterButton}
                >
                  Filter
                </Button>
              }
            >
              {categories.map((category) => (
                <Menu.Item
                  key={category}
                  onPress={() => handleFilterByCategory(category)}
                  title={category}
                />
              ))}
            </Menu>

            <Menu
              visible={sortMenuVisible}
              onDismiss={() => setSortMenuVisible(false)}
              anchor={
                <Button 
                  mode="outlined" 
                  onPress={() => setSortMenuVisible(true)}
                  icon="sort-variant"
                  style={styles.filterButton}
                >
                  Sort
                </Button>
              }
            >
              <Menu.Item
                onPress={() => handleSort('name')}
                title="Name"
              />
              <Menu.Item
                onPress={() => handleSort('quantity')}
                title="Quantity"
              />
              <Menu.Item
                onPress={() => handleSort('category')}
                title="Category"
              />
              <Menu.Item
                onPress={() => handleSort('lastUpdated')}
                title="Last Updated"
              />
            </Menu>
          </View>
        </View>

        {/* Active Filters Display */}
        {(inventoryStore.filters.category || inventoryStore.filters.search) && (
          <View style={styles.activeFiltersContainer}>
            <Text variant="bodySmall" style={styles.filtersLabel}>Active Filters:</Text>
            <View style={styles.chipContainer}>
              {inventoryStore.filters.category && (
                <Chip 
                  onClose={() => handleFilterByCategory(undefined)} 
                  style={styles.filterChip}
                >
                  {inventoryStore.filters.category}
                </Chip>
              )}
              {inventoryStore.filters.search && (
                <Chip 
                  onClose={() => handleClearSearch()} 
                  style={styles.filterChip}
                >
                  Search: {inventoryStore.filters.search}
                </Chip>
              )}
            </View>
          </View>
        )}

        <Divider />

        {/* Inventory List */}
        {inventoryStore.isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loaderText}>Loading inventory...</Text>
          </View>
        ) : inventoryStore.isEmpty ? (
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge">No inventory items found</Text>
            <Button 
              mode="contained" 
              onPress={() => inventoryStore.resetFilters()}
              style={styles.resetButton}
            >
              Reset Filters
            </Button>
          </View>
        ) : (
          <FlatList
            data={inventoryStore.results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <InventoryItem 
                item={item} 
                onPress={handleItemPress}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        )}
      </SafeAreaView>
    </View>
  );
});

const styles = StyleSheet.create({
  searchContainer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchbar: {
    flex: 1,
    marginRight: 8,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    marginLeft: 8,
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filtersLabel: {
    marginRight: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  listContent: {
    padding: 16,
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
  }
});

export default withProviders(GetInventoryStoreProvider)(InventoryScreen);