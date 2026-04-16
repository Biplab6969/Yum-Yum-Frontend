import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { shopAPI, itemAPI, productionAPI } from '../services/api';
import toast from 'react-hot-toast';

const DataContext = createContext(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [shops, setShops] = useState([]);
  const [items, setItems] = useState([]);
  const [production, setProduction] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [loading, setLoading] = useState({
    shops: false,
    items: false,
    production: false
  });

  // Fetch shops
  const fetchShops = useCallback(async () => {
    setLoading(prev => ({ ...prev, shops: true }));
    try {
      const response = await shopAPI.getAll();
      setShops(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch shops');
    } finally {
      setLoading(prev => ({ ...prev, shops: false }));
    }
  }, []);

  // Fetch items
  const fetchItems = useCallback(async () => {
    setLoading(prev => ({ ...prev, items: true }));
    try {
      const response = await itemAPI.getAll();
      setItems(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch items');
    } finally {
      setLoading(prev => ({ ...prev, items: false }));
    }
  }, []);

  // Fetch today's production
  const fetchProduction = useCallback(async () => {
    setLoading(prev => ({ ...prev, production: true }));
    try {
      const response = await productionAPI.getToday();
      setProduction(response.data.data);
      
      // Set low stock alerts
      const alerts = response.data.data.filter(item => item.isLowStock);
      setLowStockAlerts(alerts);
    } catch (error) {
      toast.error('Failed to fetch production data');
    } finally {
      setLoading(prev => ({ ...prev, production: false }));
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([fetchShops(), fetchItems(), fetchProduction()]);
  }, [fetchShops, fetchItems, fetchProduction]);

  // Initial fetch
  useEffect(() => {
    refreshData();
  }, []);

  const value = {
    shops,
    items,
    production,
    lowStockAlerts,
    loading,
    fetchShops,
    fetchItems,
    fetchProduction,
    refreshData,
    setProduction
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
