import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { fetchProfile } from '../../api/studentService';
import { COLORS } from '../../styles/colors';

const { width, height } = Dimensions.get('window');
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const StudentDashboard = ({ route, navigation }) => {
  const { userData } = route.params || {};
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchProfile(userData.user_id);
        setProfileData(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    loadProfile();
  }, [userData]);

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

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
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Animated.View
              style={styles.header}
              entering={FadeIn.delay(100).duration(500)}
            >
              <Text style={styles.title}>Student Dashboard</Text>
              <Text style={styles.subtitle}>
                Welcome back, {profileData?.name || userData?.name || 'Student'}!
              </Text>
            </Animated.View>

            {profileData && (
              <Animated.View
                style={styles.card}
                entering={FadeInUp.delay(200).duration(500)}
              >
                <Text style={styles.cardTitle}>Your Profile</Text>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileItem}>
                    <Text style={styles.profileLabel}>Name: </Text>
                    {profileData.name || 'Not available'}
                  </Text>
                  <Text style={styles.profileItem}>
                    <Text style={styles.profileLabel}>Gender: </Text>
                    {profileData.gender || 'Not available'}
                  </Text>
                  <Text style={styles.profileItem}>
                    <Text style={styles.profileLabel}>Age: </Text>
                    {profileData.age || 'Not available'}
                  </Text>
                  <Text style={styles.profileItem}>
                    <Text style={styles.profileLabel}>Grade: </Text>
                    {profileData.grade || 'Not available'}
                  </Text>
                  <Text style={styles.profileItem}>
                    <Text style={styles.profileLabel}>School: </Text>
                    {profileData.school || 'Not available'}
                  </Text>
                </View>
              </Animated.View>
            )}
            
            <AnimatedTouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('StudentBooking', { userData })}
              entering={FadeInUp.springify().mass(1).damping(30).delay(300)}
            >
              <Text style={styles.actionButtonText}>Book Classes</Text>
            </AnimatedTouchableOpacity>
            
            <AnimatedTouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              entering={FadeInUp.springify().mass(1).damping(30).delay(400)}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </AnimatedTouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
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
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: height * 0.05,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.transparentWhite,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.borderWhite,
    backdropFilter: 'blur(10px)',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 16,
  },
  profileInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 14,
    borderRadius: 8,
  },
  profileItem: {
    fontSize: 16,
    color: COLORS.white,
    marginBottom: 8,
  },
  profileLabel: {
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  actionButton: {
    backgroundColor: COLORS.purple,
    padding: 16,
    borderRadius: 9999,
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 40,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    padding: 16,
    borderRadius: 9999,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
    paddingHorizontal: 40,
  },
  logoutButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default StudentDashboard;