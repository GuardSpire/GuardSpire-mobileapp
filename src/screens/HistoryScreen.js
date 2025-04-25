import React, { useState } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList} from 'react-native';
import TopNavBar from '../components/TopNavBar';
import BottomNavBar from '../components/BottomNavBar';

const HistoryScreen = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState('Daily');
  const [historyData, setHistoryData] = useState([
    { id: 1, type: 'Phishing Attack', percentage: '100%', date: 'Today' },
    { id: 2, type: 'Job Scam', percentage: '85%', date: 'Today' },
    { id: 3, type: 'Sampath Bank', percentage: '60%', date: 'Today' },
    { id: 4, type: 'Phishing Attack', percentage: '100%', date: 'March 12' },
    { id: 5, type: 'Job Scam', percentage: '85%', date: 'March 10' },
    { id: 6, type: 'Sampath Bank', percentage: '60%', date: 'March 9' },
  ]);

  // Available filters
  const filters = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

  // Handle filtering
  const applyFilter = (filterType) => {
    setSelectedFilter(filterType);
    // TODO: Apply filtering logic based on the selected filter (e.g., fetch data for that period)
  };

  // Render each detected threat item
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.threatItem}
      onPress={() => navigation.navigate('Report')}
    >
      <Text style={styles.threatText}>{item.type}</Text>
      <Text style={styles.threatPercentage}>{item.percentage}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Top Navigation Bar */}
      <TopNavBar navigation={navigation} />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Detected Threats</Text>

        {/* Recent Threats Section */}
        <Text style={styles.subTitle}>Recents</Text>
        <View style={styles.threatCard}>
          {historyData
            .filter((item) => item.date === 'Today')
            .map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.threatItem}
                onPress={() => navigation.navigate('Report')}
              >
                <Text style={styles.threatText}>{item.type}</Text>
                <Text style={styles.threatPercentage}>{item.percentage}</Text>
              </TouchableOpacity>
            ))}
        </View>

        {/* History Section */}
        <View style={styles.historyHeader}>
          <Text style={styles.subTitle}>History</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Options */}
        <View style={styles.filterContainer}>
          {filters.map((filter) => (
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

        {/* Threat History List */}
        <View style={styles.threatCard}>
          <FlatList
            data={historyData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavBar navigation={navigation} />
    </View>
  );
};

/* Styles */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    color: 'red',
    fontWeight: 'bold',
  },
});

export default HistoryScreen;
