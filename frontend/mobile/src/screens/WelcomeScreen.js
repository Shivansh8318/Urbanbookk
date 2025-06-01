import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp, FadeOut } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

import Marquee from '../components/Marquee';
import EventCard from '../components/EventCard';

const { width, height } = Dimensions.get('window');
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const events = [
  {
    id: 1,
    title: 'UrbanBook',
    image: require('../assets/images/1.jpg'),
  },
  {
    id: 2,
    title: 'Seamless Scheduling',
    image: require('../assets/images/2.jpg'),
  },
  {
    id: 3,
    title: 'Video Classes',
    image: require('../assets/images/3.jpg'),
  },
  {
    id: 4,
    title: 'Live Sync',
    image: require('../assets/images/4.jpg'),
  },
  {
    id: 5,
    title: 'Homework Mastery',
    image: require('../assets/images/5.jpg'),
  },
  {
    id: 6,
    title: 'Seamless Scheduling',
    image: require('../assets/images/6.jpg'),
  },
  {
    id: 7,
    title: 'Video Classes',
    image: require('../assets/images/7.jpg'),
  },
  {
    id: 8,
    title: 'Live Sync',
    image: require('../assets/images/8.jpg'),
  },
];

const WelcomeScreen = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const onButtonPress = () => {
    navigation.navigate('RoleSelection');
  };

  return (
    <View style={styles.container}>
      <Animated.Image
        key={events[activeIndex].id}
        source={events[activeIndex].image}
        style={styles.backgroundImage}
        resizeMode="cover"
        entering={FadeIn.duration(1000)}
        exiting={FadeOut.duration(1000)}
      />

      <View style={styles.overlay} />

      <LinearGradient
        colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.55)']}
        style={StyleSheet.absoluteFill}
      >
        <SafeAreaView edges={['bottom']} style={styles.safeArea}>
          {/* Top part of the screen */}
          <Animated.View
            style={styles.topSection}
            entering={FadeInUp.springify().mass(1).damping(30)}>
            <Marquee
              items={events}
              renderItem={({ item }) => <EventCard event={item} />}
              onIndexChange={setActiveIndex}
              autoScrollInterval={4000}
            />
          </Animated.View>

          <View style={styles.bottomSection}>
            <Animated.Text
              style={styles.welcomeText}
              entering={FadeInUp.springify().mass(1).damping(30).delay(500)}>
              Welcome to
            </Animated.Text>
            
            <Animated.View
              entering={FadeIn.duration(500).delay(500)}
              style={{ marginBottom: 10 }}>
              <MaskedView
                maskElement={
                  <Text style={[styles.appTitle, { backgroundColor: 'transparent' }]}>
                    UrbanBook
                  </Text>
                }>
                <LinearGradient
                  colors={['#9333EA', '#A855F7', '#C084FC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ height: 60 }}>
                  <Text style={[styles.appTitle, { opacity: 0 }]}>
                    UrbanBook
                  </Text>
                </LinearGradient>
              </MaskedView>
            </Animated.View>
            
            <Animated.Text
              style={styles.description}
              entering={FadeInUp.springify().mass(1).damping(30).delay(500)}>
              Empowering education with seamless scheduling, real-time collaboration, and a universe of possibilities.
            </Animated.Text>

            <AnimatedTouchableOpacity
              onPress={onButtonPress}
              style={styles.button}
              entering={FadeInUp.springify().mass(1).damping(30).delay(500)}>
              <Text style={styles.buttonText}>Start Your Journey</Text>
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
  topSection: {
    marginTop: height * 0.05,
    height: height * 0.5,
    width: width,
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 10,
  },
  appTitle: {
    textAlign: 'center',
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  description: {
    marginBottom: 30,
    textAlign: 'center',
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  button: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 9999,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen; 