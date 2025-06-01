import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList,
  Alert,
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { WebView } from 'react-native-webview';
import useWebSocket from '../../hooks/useWebSocket';
import { fetchTeachers, fetchAllSlots, fetchAvailableSlots, fetchBookedClasses } from '../../api/bookingService';
import { processPayment, handlePaymentResponse } from '../../api/paymentService';
import { MEETING_URL } from '../../utils/constants';
import { COLORS } from '../../styles/colors';

const { width, height } = Dimensions.get('window');
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const StudentBooking = ({ route, navigation }) => {
  const { userData } = route.params || {};
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedClasses, setBookedClasses] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookingSlotId, setBookingSlotId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [allSlots, setAllSlots] = useState([]);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [razorpayHtml, setRazorpayHtml] = useState('');
  const webViewRef = useRef(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [processingPaymentId, setProcessingPaymentId] = useState(null);
  const [showMeeting, setShowMeeting] = useState(false);
  const meetingURL = MEETING_URL;

  const ws = useWebSocket(userData.user_id, (e) => {
    try {
      console.log('WebSocket Message Received:', e.data);
      const data = JSON.parse(e.data);
      
      if (data.type === 'booking_update') {
        const bookedSlotId = data.booking.slot_id;
        console.log('Booking update for slot:', bookedSlotId);
        
        setAvailableSlots((prevSlots) => prevSlots.filter((slot) => slot.id !== bookedSlotId));
        setAllSlots((prevSlots) => prevSlots.filter((slot) => slot.id !== bookedSlotId));
        
        setBookingSlotId(null);
        fetchBookedClasses(userData.user_id).then(setBookedClasses);
        
        if (selectedTeacher) {
          fetchAllSlots(selectedTeacher.user_id).then(setAllSlots);
          if (selectedDate) {
            fetchAvailableSlots(selectedTeacher.user_id, selectedDate).then(setAvailableSlots);
          }
        }
      } else if (data.type === 'slot_update') {
        console.log('Slot update received:', data);
        
        if (data.action === 'added') {
          const newSlot = data.slot;
          if (selectedTeacher && newSlot.teacher_id === selectedTeacher.user_id && !newSlot.is_booked) {
            setAllSlots((prevSlots) => {
              if (prevSlots.some((slot) => slot.id === newSlot.id)) return prevSlots;
              const updatedSlots = [...prevSlots, newSlot];
              return updatedSlots.sort((a, b) => {
                const dateComparison = new Date(a.date) - new Date(b.date);
                if (dateComparison !== 0) return dateComparison;
                return a.start_time.localeCompare(b.start_time);
              });
            });
            
            if (selectedDate && newSlot.date === selectedDate.toISOString().split('T')[0]) {
              setAvailableSlots((prevSlots) => {
                if (prevSlots.some((slot) => slot.id === newSlot.id)) return prevSlots;
                const updatedSlots = [...prevSlots, newSlot];
                return updatedSlots.sort((a, b) => a.start_time.localeCompare(b.start_time));
              });
            }
          }
        } else if (data.action === 'deleted' && data.slot_id) {
          setAllSlots(prevSlots => prevSlots.filter(slot => slot.id !== data.slot_id));
          setAvailableSlots(prevSlots => prevSlots.filter(slot => slot.id !== data.slot_id));
        }
      } else if (data.type === 'slots_count') {
        console.log('Slots count from server:', data.count);
        
        if (selectedTeacher && 
            data.teacher_id === selectedTeacher.user_id && 
            data.count !== allSlots.length) {
          console.log('Slot count mismatch, refetching...');
          fetchAllSlots(selectedTeacher.user_id).then(setAllSlots);
          if (selectedDate) {
            fetchAvailableSlots(selectedTeacher.user_id, selectedDate).then(setAvailableSlots);
          }
        }
      } else if (data.type === 'error') {
        setBookingSlotId(null);
        Alert.alert('Booking Error', data.message);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error.message);
    }
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (selectedTeacher) {
        console.log('Performing periodic refresh');
        fetchAllSlots(selectedTeacher.user_id).then(setAllSlots);
        if (selectedDate) {
          fetchAvailableSlots(selectedTeacher.user_id, selectedDate).then(setAvailableSlots);
        }
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [selectedTeacher, selectedDate]);

  useEffect(() => {
    fetchTeachers().then(setTeachers);
    fetchBookedClasses(userData.user_id).then(setBookedClasses);
  }, [userData]);

  useEffect(() => {
    const fetchAllTeacherSlots = async () => {
      try {
        console.log('Fetching all teachers slots for initial load');
        const timestamp = new Date().getTime();
        const response = await fetch(
          `https://2d30-45-118-158-197.ngrok-free.app/api/booking/get-all-teacher-slots/?t=${timestamp}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
          }
        );
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched all teachers slots successfully. Count:', data.length);
      } catch (error) {
        console.error('Failed to fetch all teachers slots:', error.message);
      }
    };
    
    fetchAllTeacherSlots();
  }, []);

  const handleBookSlot = (slot) => {
    if (bookingSlotId) {
      Alert.alert('Please wait', 'A booking is already in progress.');
      return;
    }
    
    Alert.alert(
      'Confirm Booking',
      `Book slot on ${slot.date} from ${slot.start_time} to ${slot.end_time}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            if (ws) {
              try {
                console.log('Booking slot:', slot.id);
                setBookingSlotId(slot.id);
                setAvailableSlots(prevSlots => prevSlots.filter(s => s.id !== slot.id));
                setAllSlots(prevSlots => prevSlots.filter(s => s.id !== slot.id));
                ws.send(JSON.stringify({
                  action: 'book_slot',
                  slot_id: slot.id,
                  student_id: userData.user_id,
                }));
                setTimeout(() => {
                  if (bookingSlotId === slot.id) {
                    console.log('Booking timeout, resetting state');
                    setBookingSlotId(null);
                    fetchBookedClasses(userData.user_id).then(setBookedClasses);
                    if (selectedTeacher) {
                      fetchAllSlots(selectedTeacher.user_id).then(setAllSlots);
                      if (selectedDate) {
                        fetchAvailableSlots(selectedTeacher.user_id, selectedDate).then(setAvailableSlots);
                      }
                    }
                  }
                }, 10000);
              } catch (error) {
                console.error('Error sending booking request:', error);
                setBookingSlotId(null);
                Alert.alert('Error', 'Failed to send booking request. Please try again.');
              }
            } else {
              Alert.alert('Error', 'Connection not available. Please try again later.');
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

    const hasAvailableSlots = (day) => {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return allSlots.some(slot => slot.date === dateStr);
    };
    
    const countAvailableSlots = (day) => {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return allSlots.filter(slot => slot.date === dateStr).length;
    };
    
    const isPastDate = (day) => {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date < today;
    };
    
    const isSelectedDate = (day) => {
      if (!selectedDate) return false;
      return (
        selectedDate.getFullYear() === currentDate.getFullYear() &&
        selectedDate.getMonth() === currentDate.getMonth() &&
        selectedDate.getDate() === day
      );
    };

    return (
      <View style={styles.calendar}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => {
            const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
            setCurrentDate(newDate);
          }}>
            <Text style={styles.calendarNav}>Prev</Text>
          </TouchableOpacity>
          <Text style={styles.calendarTitle}>
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => {
            const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
            setCurrentDate(newDate);
          }}>
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
          {days.map((day) => {
            const hasSlots = hasAvailableSlots(day);
            const isSelected = isSelectedDate(day);
            const isPast = isPastDate(day);
            const slotCount = hasSlots ? countAvailableSlots(day) : 0;
            
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.calendarDate,
                  hasSlots && styles.availableDate,
                  isSelected && styles.selectedDate,
                  isPast && styles.pastDate,
                ]}
                onPress={() => {
                  if (isPast) {
                    Alert.alert('Notice', 'Cannot select dates in the past');
                    return;
                  }
                  
                  const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  setSelectedDate(selected);
                  if (selectedTeacher) {
                    fetchAvailableSlots(selectedTeacher.user_id, selected).then(setAvailableSlots);
                  }
                }}
                disabled={isPast}
              >
                <Text style={[
                  { textAlign: 'center' },
                  isPast && styles.pastDateText,
                  isSelected && styles.selectedDateText
                ]}>
                  {day}
                </Text>
                {hasSlots && (
                  <View style={styles.slotCountBadge}>
                    <Text style={styles.slotCountText}>{slotCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const handlePayment = async (booking) => {
    try {
      setProcessingPayment(true);
      setProcessingPaymentId(booking.id);
      
      const { html } = await processPayment(booking, userData);
      setRazorpayHtml(html);
      setShowRazorpay(true);
    } catch (error) {
      console.error('Error initiating payment:', error);
      Alert.alert('Error', error.message || 'Failed to initiate payment');
    } finally {
      setProcessingPayment(false);
      setProcessingPaymentId(null);
    }
  };

  const handleWebViewMessage = async (event) => {
    try {
      const result = await handlePaymentResponse(event.nativeEvent.data, fetchBookedClasses, userData.user_id);
      setShowRazorpay(false);
      setProcessingPayment(true);
      
      if (result.success) {
        Alert.alert('Success', result.message);
      } else {
        Alert.alert('Payment Failed', result.message);
      }
    } catch (error) {
      console.error('Error processing payment response:', error);
      Alert.alert('Error', error.message || 'Failed to process payment response');
    } finally {
      setProcessingPayment(false);
      setProcessingPaymentId(null);
    }
  };

  const renderBookingCard = (booking) => (
    <View style={styles.slotCard}>
      <View style={styles.bookingInfo}>
        <Text style={styles.slotTime}>Teacher: {booking.teacher_name}</Text>
        <Text style={styles.slotTime}>{booking.date} {booking.start_time} - {booking.end_time}</Text>
        <Text style={[styles.slotStatus, 
          booking.status === 'confirmed' ? styles.statusConfirmed : 
          booking.status === 'canceled' ? styles.statusCanceled : styles.statusPending
        ]}>
          Status: {booking.status}
        </Text>
        {booking.payment_status && (
          <Text style={styles.paidStatus}>Payment: Completed</Text>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        {!booking.payment_status && (
          <TouchableOpacity 
            style={[styles.payButton, processingPaymentId === booking.id && styles.disabledButton]}
            onPress={() => handlePayment(booking)}
            disabled={processingPayment}
          >
            <Text style={styles.buttonText}>
              {processingPaymentId === booking.id ? 'Processing...' : 'Pay Now'}
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.startClassButton}
          onPress={() => setShowMeeting(true)}
        >
          <Text style={styles.buttonText}>Start Class</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../../assets/images/10.jpg')} // Updated path
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
              <Text style={styles.title}>Book Classes</Text>
            </Animated.View>

            <Animated.View 
              style={styles.section}
              entering={FadeInUp.delay(200).duration(500)}
            >
              <Text style={styles.sectionTitle}>Select Teacher</Text>
              {teachers.length === 0 ? (
                <Text style={styles.emptyText}>No teachers available.</Text>
              ) : (
                <FlatList
                  data={teachers}
                  horizontal
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.teacherCard, selectedTeacher?.user_id === item.user_id && styles.selectedTeacher]}
                      onPress={() => {
                        setSelectedTeacher(item);
                        fetchAllSlots(item.user_id).then(setAllSlots);
                        if (selectedDate) {
                          fetchAvailableSlots(item.user_id, selectedDate).then(setAvailableSlots);
                        }
                      }}
                    >
                      <Text style={styles.teacherName}>{item.name}</Text>
                      <Text style={styles.teacherSubject}>{item.subject}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.user_id}
                />
              )}
            </Animated.View>

            <Animated.View 
              entering={FadeInUp.delay(300).duration(500)}
            >
              {renderCalendar()}
            </Animated.View>

            <Animated.View 
              style={styles.section}
              entering={FadeInUp.delay(400).duration(500)}
            >
              <Text style={styles.sectionTitle}>
                Available Slots
                {selectedTeacher && <Text style={styles.infoText}> ({availableSlots.length})</Text>}
              </Text>
              {!selectedTeacher ? (
                <Text style={styles.emptyText}>Please select a teacher to view available slots.</Text>
              ) : !selectedDate ? (
                <Text style={styles.emptyText}>Please select a date to view available slots.</Text>
              ) : availableSlots.length === 0 ? (
                <View>
                  <Text style={styles.emptyText}>No available slots for this date.</Text>
                  <Text style={styles.hintText}>Try selecting another date highlighted on the calendar.</Text>
                </View>
              ) : (
                <FlatList
                  data={availableSlots}
                  renderItem={({ item }) => (
                    <View style={styles.slotCard}>
                      <Text style={styles.slotTime}>{item.date} {item.start_time} - {item.end_time}</Text>
                      <AnimatedTouchableOpacity
                        style={[styles.bookButton, bookingSlotId === item.id && styles.disabledButton]}
                        onPress={() => handleBookSlot(item)}
                        disabled={bookingSlotId === item.id}
                      >
                        <Text style={styles.bookButtonText}>
                          {bookingSlotId === item.id ? 'Booking...' : 'Book Slot'}
                        </Text>
                      </AnimatedTouchableOpacity>
                    </View>
                  )}
                  keyExtractor={(item) => item.id.toString()}
                  nestedScrollEnabled={true}
                  style={[
                    styles.flatListContainer, 
                    { maxHeight: Math.min(availableSlots.length * 80 + 20, 250) }
                  ]}
                />
              )}
            </Animated.View>

            <Animated.View 
              style={styles.section}
              entering={FadeInUp.delay(500).duration(500)}
            >
              <Text style={styles.sectionTitle}>Booked Classes</Text>
              {bookedClasses.length === 0 ? (
                <Text style={styles.emptyText}>No booked classes.</Text>
              ) : (
                <FlatList
                  data={bookedClasses}
                  renderItem={({ item }) => renderBookingCard(item)}
                  keyExtractor={(item) => item.id.toString()}
                  nestedScrollEnabled={true}
                  style={styles.flatListContainer}
                />
              )}
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {showRazorpay && (
        <Modal
          visible={showRazorpay}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowRazorpay(false)}
        >
          <View style={{ flex: 1 }}>
            <WebView
              ref={webViewRef}
              source={{ html: razorpayHtml }}
              onMessage={handleWebViewMessage}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              style={{ flex: 1 }}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowRazorpay(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

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
  teacherCard: { 
    padding: 15, 
    backgroundColor: COLORS.transparentWhite, 
    borderRadius: 12, 
    marginRight: 10, 
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 1,
    borderColor: COLORS.borderWhite,
  },
  selectedTeacher: { 
    borderColor: '#9333EA', 
    borderWidth: 2,
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
  },
  teacherName: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: COLORS.white 
  },
  teacherSubject: { 
    fontSize: 14, 
    color: 'rgba(255, 255, 255, 0.6)' 
  },
  slotCard: { 
    padding: 15, 
    backgroundColor: COLORS.transparentWhite, 
    borderRadius: 12, 
    marginBottom: 10, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderWhite,
  },
  bookingInfo: {
    flex: 1,
    flexDirection: 'column',
  },
  slotTime: { 
    fontSize: 14, 
    color: COLORS.white 
  },
  slotStatus: { 
    fontSize: 14, 
    color: 'rgba(255, 255, 255, 0.6)' 
  },
  paidStatus: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: 'bold',
    marginTop: 4,
  },
  bookButton: { 
    backgroundColor: COLORS.purple, 
    paddingVertical: 8, 
    paddingHorizontal: 15, 
    borderRadius: 9999,
  },
  disabledButton: { 
    backgroundColor: 'rgba(165, 180, 252, 0.7)', 
    opacity: 0.7,
  },
  bookButtonText: { 
    color: COLORS.white, 
    fontSize: 14, 
    fontWeight: 'bold',
  },
  calendar: { 
    marginBottom: 20,
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
    color: COLORS.white
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
    color: 'rgba(255, 255, 255, 0.8)'
  },
  calendarDate: { 
    width: '14.28%', 
    padding: 10, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: COLORS.borderWhite 
  },
  availableDate: { 
    backgroundColor: 'rgba(147, 51, 234, 0.3)' 
  },
  selectedDate: {
    backgroundColor: 'rgba(147, 51, 234, 0.5)',
  },
  pastDate: {
    backgroundColor: COLORS.transparentWhite,
  },
  pastDateText: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  selectedDateText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  slotCountBadge: {
    backgroundColor: COLORS.purple,
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 2,
    position: 'absolute',
    top: 4,
    right: 4,
  },
  slotCountText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  flatListContainer: {
    maxHeight: 250,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  payButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
  closeButton: {
    backgroundColor: COLORS.error,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusConfirmed: {
    color: '#34C759',
  },
  statusCanceled: {
    color: '#FF3B30',
  },
  statusPending: {
    color: '#FFCC00',
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  hintText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
  },
});

export default StudentBooking;