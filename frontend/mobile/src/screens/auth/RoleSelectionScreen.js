import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp, FadeOut } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

import Marquee from '../../components/Marquee';
import EventCard from '../../components/EventCard';

const { width, height } = Dimensions.get('window');
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const roles = [
  {
    id: 1,
    title: 'Student',
    image: require('../../assets/images/10.jpg'),
  },
  {
    id: 2,
    title: 'Teacher',
    image: require('../../assets/images/9.jpg'),
  }
];

const RoleSelectionScreen = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const selectRole = (role) => {
    // Navigate to the AuthScreen with the selected role
    navigation.navigate('Auth', { role });
  };

  return (
    <View style={styles.container}>
      <Animated.Image
        key={roles[activeIndex].id}
        source={roles[activeIndex].image}
        style={styles.backgroundImage}
        resizeMode="cover"
        entering={FadeIn.duration(1000)}
        exiting={FadeOut.duration(1000)}
      />

      <View style={styles.overlay} />

      <LinearGradient
        colors={['rgba(17, 24, 39, 0.6)', 'rgba(31, 41, 55, 0.6)']}
        style={StyleSheet.absoluteFill}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Animated.Text 
              style={styles.title}
              entering={FadeIn.delay(100).duration(500)}
            >
              Select Your Role
            </Animated.Text>
          </View>

          {/* Carousel for role selection */}
          <Animated.View
            style={styles.carouselSection}
            entering={FadeInUp.springify().mass(1).damping(30)}>
            <Marquee
              items={roles}
              renderItem={({ item }) => <EventCard event={item} />}
              onIndexChange={setActiveIndex}
              autoScrollInterval={5000}
            />
          </Animated.View>

          {/* Description and selection button */}
          <View style={styles.bottomSection}>
            <Animated.Text
              style={styles.roleTitle}
              entering={FadeIn.duration(500).delay(500)}>
              {roles[activeIndex]?.title || 'Select Role'}
            </Animated.Text>
            
            <Animated.Text
              style={styles.description}
              entering={FadeInUp.springify().mass(1).damping(30).delay(500)}>
              {activeIndex === 0 
                ? 'Join as a student to access learning materials and collaborate with teachers.'
                : 'Join as a teacher to create courses and manage your students.'}
            </Animated.Text>

            <AnimatedTouchableOpacity
              onPress={() => selectRole(roles[activeIndex]?.title)}
              style={styles.button}
              entering={FadeInUp.springify().mass(1).damping(30).delay(500)}>
              <Text style={styles.buttonText}>Continue as {roles[activeIndex]?.title}</Text>
            </AnimatedTouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
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
  header: {
    marginVertical: 20,
    position: 'relative',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 0,
    zIndex: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  carouselSection: {
    height: height * 0.5, // Increased height to give more space for the image
    width: width,
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  roleTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    marginBottom: 30,
    textAlign: 'center',
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 24,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#4F46E5', // Indigo color
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 9999,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default RoleSelectionScreen; 