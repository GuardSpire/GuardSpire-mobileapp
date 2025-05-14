import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TopNavBar from '../components/TopNavBar';
import BottomNavBar from '../components/BottomNavBar';
import axios from 'axios';
import moment from 'moment';

const HistoryScreen = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState('Daily');
  const [fullHistory, setFullHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get('http://localhost:5000/api/scan/history', { headers });

      const normalizedHistory = (res.data.history || []).map(item => ({
        ...item,
        threatPercentage: item.confidence || 0,
        scan_id: item.scan_id || item._id,
        threatCategory: item.threatCategory || 'Legitimate'
      }));

      setFullHistory(normalizedHistory);
      applyFilter(selectedFilter, normalizedHistory);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchHistory();
    });
    return unsubscribe;
  }, [navigation]);

  const applyFilter = (filterType, history = fullHistory) => {
    setSelectedFilter(filterType);
    const now = moment();
    let filtered = [];

    switch (filterType) {
      case 'Daily':
        filtered = history.filter(item => moment(item.timestamp).isSame(now, 'day'));
        break;
      case 'Weekly':
        filtered = history.filter(item => moment(item.timestamp).isAfter(now.clone().subtract(7, 'days')));
        break;
      case 'Monthly':
        filtered = history.filter(item => moment(item.timestamp).isSame(now, 'month'));
        break;
      case 'Yearly':
        filtered = history.filter(item => moment(item.timestamp).isSame(now, 'year'));
        break;
      default:
        filtered = history;
    }

    setFilteredHistory(filtered);
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.threatItem}
        onPress={() => navigation.navigate('Report', {
          scanId: item.scan_id,
          threatPercentage: item.threatPercentage,
          threatCategory: item.threatCategory
        })}
      >
        <Text style={styles.threatText}>{item.platform || 'Unknown'}</Text>
        <Text style={styles.threatPercentage}>
          {item.threatPercentage}%
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#04366D" />
        <Text>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopNavBar navigation={navigation} />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Detected Threats</Text>

        <Text style={styles.subTitle}>Recents</Text>
        <View style={styles.threatCard}>
          {fullHistory
            .filter(item => moment(item.timestamp).isSame(moment(), 'day'))
            .map(item => (
              <TouchableOpacity
                key={item.scan_id}
                style={styles.threatItem}
                onPress={() => navigation.navigate('Report', {
                  scanId: item.scan_id,
                  threatPercentage: item.threatPercentage,
                  threatCategory: item.threatCategory
                })}
              >
                <Text style={styles.threatText}>{item.platform || 'Unknown'}</Text>
                <Text style={styles.threatPercentage}>
                  {item.threatPercentage}%
                </Text>
              </TouchableOpacity>
            ))}
        </View>

        <View style={styles.historyHeader}>
          <Text style={styles.subTitle}>History</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          {filters.map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterOption,
                selectedFilter === filter && styles.filterSelected,
              ]}
              onPress={() => applyFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.filterTextSelected,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.threatCard}>
          {filteredHistory.length > 0 ? (
            <FlatList
              data={filteredHistory}
              keyExtractor={(item) => item.scan_id}
              renderItem={renderItem}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.emptyText}>No threats found for this period</Text>
          )}
        </View>
      </ScrollView>
      <BottomNavBar navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  contentContainer: {
    paddingTop: 20,
    paddingHorizontal: 25,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#04366D',
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#04366D',
    marginBottom: 5,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  filterButton: {
    padding: 5,
    borderWidth: 1,
    borderColor: '#04366D',
    borderRadius: 5,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#04366D',
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  filterOption: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#04366D',
    borderRadius: 5,
  },
  filterSelected: {
    backgroundColor: '#04366D',
  },
  filterText: {
    fontSize: 14,
    color: '#04366D',
  },
  filterTextSelected: {
    color: '#fff',
  },
  threatCard: {
    backgroundColor: '#F0EEEE',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  threatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#04366D',
    marginBottom: 5,
  },
  threatText: {
    fontSize: 14,
    color: '#04366D',
  },
  threatPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
  },
});

export default HistoryScreen;
