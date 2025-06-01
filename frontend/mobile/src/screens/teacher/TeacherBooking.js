import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  FlatList,
  Image,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { WebView } from 'react-native-webview';
import useWebSocket from '../../hooks/useWebSocket';
import { fetchTeacherSlots } from '../../api/bookingService';
import { MEETING_URL } from '../../utils/constants';
import { COLORS } from '../../styles/colors';

const { width, height } = Dimensions.get('window');
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const TeacherBooking = ({ route, navigation }) => {
  const { userData } = route.params || {};
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [upcomingSlots, setUpcomingSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [showMeeting, setShowMeeting] = useState(false);
  const meetingURL = MEETING_URL;

  const ws = useWebSocket(userData.user_id, (e) => {
    try {
      console.log('WebSocket Message Received:', e.data);
      const data = JSON.parse(e.data);

      if (data.type === 'slot_update') {
        console.log('Slot update received:', data);

        if (data.action === 'added') {
          const newSlot = data.slot;
          setUpcomingSlots(prevSlots => {
            const exists = prevSlots.some(slot =>
              slot.id === newSlot.id ||
              (slot.date === newSlot.date &&
               slot.start_time === newSlot.start_time &&
               slot.end_time === newSlot.end_time)
            );

            if (exists) return prevSlots;

            const updatedSlots = [...prevSlots, newSlot].sort((a, b) => {
              const dateComparison = new Date(a.date) - new Date(b.date);
              if (dateComparison !== 0) return dateComparison;
              return a.start_time.localeCompare(b.start_time);
            });

            return updatedSlots;
          });
        } else if (data.action === 'deleted') {
          setUpcomingSlots(prevSlots =>
            prevSlots.filter(slot => slot.id !== data.slot_id)
          );
        }

        setTimeout(() => fetchSlots(), 500);
      } else if (data.type === 'booking_update') {
        console.log('Booking update received:', data);
        fetchSlots();
      } else if (data.type === 'slots_count') {
        console.log('Slots count from server:', data.count);
        if (data.count !== upcomingSlots.length + bookedSlots.length) {
          console.log('Slot count mismatch, refetching...');
          fetchSlots();
        }
      } else if (data.type === 'error') {
        console.log('WebSocket Error:', data.message);
        Alert.alert('Error', data.message);
        fetchSlots();
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
      fetchSlots();
    }
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log('Performing periodic slot refresh');
      fetchSlots();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [userData.user_id]);

  useEffect(() => {
    fetchSlots();
  }, [userData]);

  const fetchSlots = async () => {
    try {
      console.log('Fetching slots for teacher:', userData.user_id);
      const slots = await fetchTeacherSlots(userData.user_id);
      const upcoming = slots.filter(slot => !slot.is_booked);
      const booked = slots.filter(slot => slot.is_booked);

      console.log('Upcoming slots count:', upcoming.length);
      console.log('Booked slots count:', booked.length);

      setUpcomingSlots(prevSlots => {
        const withoutTemp = prevSlots.filter(slot => !String(slot.id).startsWith('temp_'));
        const idsMatch = withoutTemp.length === upcoming.length &&
          withoutTemp.every(slot => upcoming.some(newSlot => newSlot.id === slot.id));

        if (idsMatch) {
          console.log('Upcoming slots unchanged, skipping update');
          return prevSlots;
        }
        return upcoming;
      });

      setBookedSlots(booked);
    } catch (error) {
      console.error('Error fetching slots:', error.message);
      Alert.alert('Error', 'Failed to fetch slots: ' + error.message);
      setTimeout(() => {
        console.log('Retrying slot fetch after error...');
        fetchSlots();
      }, 5000);
    }
  };

  const handleAddSlot = () => {
    if (!date || !startTime || !endTime) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      Alert.alert('Error', 'Time must be in HH:MM format (24-hour)');
      return;
    }

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }

    const newSlot = {
      teacher_id: userData.user_id,
      date,
      start_time: startTime,
      end_time: endTime,
      is_booked: false,
      id: `temp_${Date.now()}`
    };

    Alert.alert(
      'Confirm Slot',
      `Add slot on ${date} from ${startTime} to ${endTime}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: () => {
            if (ws) {
              try {
                console.log('Sending add_slot message:', newSlot);

                setDate('');
                setStartTime('');
                setEndTime('');

                setUpcomingSlots(prevSlots => {
                  const updatedSlots = [...prevSlots, newSlot];
                  return updatedSlots.sort((a, b) => {
                    const dateComparison = new Date(a.date) - new Date(b.date);
                    if (dateComparison !== 0) return dateComparison;
                    return a.start_time.localeCompare(b.start_time);
                  });
                });

                ws.send(JSON.stringify({
                  action: 'add_slot',
                  ...newSlot
                }));

                setTimeout(() => {
                  fetchSlots();
                }, 1000);

                Alert.alert('Success', 'Slot added successfully');
              } catch (error) {
                console.error('Error adding slot:', error);
                Alert.alert('Error', 'Failed to add slot. Please try again.');
                fetchSlots();
              }
            } else {
              Alert.alert('Error', 'WebSocket connection not available. Please try again later.');
            }
          },
        },
      ]
    );
  };

  const renderCalendar = () => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

    return (
      <View style={styles.calendar}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>
            <Text style={styles.calendarNav}>Prev</Text>
          </TouchableOpacity>
          <Text style={styles.calendarTitle}>
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>
            <Text style={styles.calendarNav}>Next</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.calendarGrid}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <Text key={index} style={styles.calendarDay}>{day}</Text>
          ))}
          {emptyDays.map((_, index) => (
            <View key={`empty-${index}`} style={styles.calendarDate}></View>
          ))}
          {days.map((day) => (
            <TouchableOpacity
              key={day}
              style={styles.calendarDate}
              onPress={() => setDate(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)}
            >
              <Text>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../../assets/images/9.jpg')} // Updated path
        style={styles.backgroundImage}
        resizeMode="cover"
        entering={FadeIn.duration(1000)}
      />

      <View style={styles.overlay} />

      <LinearGradient
        colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.55)']}
        style={StyleSheet.absoluteFill}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Animated.View style={styles.header} entering={FadeIn.delay(100).duration(500)}>
              <Text style={styles.title}>Manage Slots</Text>
            </Animated.View>

            <Animated.View 
              style={styles.section}
              entering={FadeInUp.delay(200).duration(500)}
            >
              <Text style={styles.sectionTitle}>Add New Slot</Text>
              <View style={styles.calendarContainer}>
                {renderCalendar()}
              </View>
              <TextInput
                style={styles.input}
                placeholder="Date (YYYY-MM-DD)"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                value={date}
                onChangeText={setDate}
                editable={false}
              />
              <TextInput
                style={styles.input}
                placeholder="Start Time (HH:MM)"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                value={startTime}
                onChangeText={setStartTime}
              />
              <TextInput
                style={styles.input}
                placeholder="End Time (HH:MM)"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                value={endTime}
                onChangeText={setEndTime}
              />
              <AnimatedTouchableOpacity 
                style={styles.addButton} 
                onPress={handleAddSlot}
                entering={FadeInUp.delay(300).duration(500)}
              >
                <Text style={styles.addButtonText}>Add Slot</Text>
              </AnimatedTouchableOpacity>
            </Animated.View>

            <Animated.View 
              style={styles.section}
              entering={FadeInUp.delay(400).duration(500)}
            >
              <Text style={styles.sectionTitle}>Upcoming Slots</Text>
              <Text style={styles.infoText}>Total: {upcomingSlots.length}</Text>
              {upcomingSlots.length === 0 ? (
                <Text style={styles.emptyText}>No upcoming slots.</Text>
              ) : (
                <FlatList
                  data={upcomingSlots}
                  renderItem={({ item }) => (
                    <View style={styles.slotCard}>
                      <Text style={styles.slotText}>{item.date} {item.start_time} - {item.end_time}</Text>
                    </View>
                  )}
                  keyExtractor={(item) => item.id.toString()}
                  nestedScrollEnabled={true}
                  style={[styles.flatListContainer, { maxHeight: Math.min(upcomingSlots.length * 70, 250) }]}
                  initialNumToRender={10}
                  maxToRenderPerBatch={20}
                  windowSize={21}
                />
              )}
            </Animated.View>

            <Animated.View 
              style={styles.section}
              entering={FadeInUp.delay(500).duration(500)}
            >
              <Text style={styles.sectionTitle}>Booked Slots</Text>
              <Text style={styles.infoText}>Total: {bookedSlots.length}</Text>
              {bookedSlots.length === 0 ? (
                <Text style={styles.emptyText}>No booked slots.</Text>
              ) : (
                <FlatList
                  data={bookedSlots}
                  renderItem={({ item }) => (
                    <View style={styles.slotCard}>
                      <View style={styles.slotInfo}>
                        <Text style={styles.slotText}>{item.date} {item.start_time} - {item.end_time}</Text>
                        {item.status && <Text style={styles.statusText}>Status: {item.status}</Text>}
                        {item.student_name && <Text style={styles.studentText}>Student: {item.student_name}</Text>}
                      </View>
                      <TouchableOpacity
                        style={styles.startClassButton}
                        onPress={() => setShowMeeting(true)}
                      >
                        <Text style={styles.buttonText}>Start Class</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  keyExtractor={(item) => item.id.toString()}
                  nestedScrollEnabled={true}
                  style={[styles.flatListContainer, { maxHeight: Math.min(bookedSlots.length * 70, 250) }]}
                  initialNumToRender={10}
                  maxToRenderPerBatch={20}
                  windowSize={21}
                />
              )}
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {showMeeting && (
        <Modal
          visible={showMeeting}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowMeeting(false)}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <WebView
              source={{ uri: meetingURL }}
              javaScriptEnabled
              domStorageEnabled
              allowsFullscreenVideo
              startInLoadingState
            />
          </SafeAreaView>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.black 
  },
  backgroundImage: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: '100%',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  safeArea: { 
    flex: 1 
  },
  scrollContent: { 
    padding: 20,
    paddingTop: height * 0.05, 
  },
  header: { 
    marginBottom: 20 
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: COLORS.white, 
    marginBottom: 8,
    textAlign: 'center',
  },
  section: { 
    marginBottom: 20 
  },
  sectionTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: COLORS.white, 
    marginBottom: 10 
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
  input: { 
    height: 45, 
    borderColor: COLORS.borderWhite, 
    borderWidth: 1, 
    borderRadius: 8, 
    marginBottom: 12, 
    paddingHorizontal: 12,
    color: COLORS.white,
    backgroundColor: COLORS.transparentWhite,
  },
  addButton: { 
    backgroundColor: COLORS.purple, 
    padding: 16, 
    borderRadius: 9999, 
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  addButtonText: { 
    color: COLORS.white, 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  slotCard: { 
    padding: 12, 
    backgroundColor: COLORS.transparentWhite, 
    borderRadius: 12, 
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.borderWhite,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotText: {
    fontSize: 14,
    color: COLORS.white,
  },
  statusText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  calendarContainer: {
    marginBottom: 15,
  },
  calendar: { 
    marginBottom: 10,
    backgroundColor: COLORS.transparentWhite,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.borderWhite,
  },
  calendarHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  calendarNav: { 
    fontSize: 16, 
    color: '#A855F7' 
  },
  calendarTitle: { 
    fontSize: 18, 
    fontWeight: 'bold',
    color: COLORS.white,
  },
  calendarGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap' 
  },
  calendarDay: { 
    width: '14.28%', 
    textAlign: 'center', 
    fontWeight: 'bold', 
    marginBottom: 5,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  calendarDate: { 
    width: '14.28%', 
    padding: 10, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: COLORS.borderWhite 
  },
  flatListContainer: {
    maxHeight: 250,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 10,
  },
  slotInfo: {
    flexDirection: 'column',
  },
  studentText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  startClassButton: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default TeacherBooking;