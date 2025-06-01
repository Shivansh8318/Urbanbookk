import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const EventCard = ({ event }) => {
  return (
    <View style={styles.container}>
      <Image 
        source={event.image} 
        style={styles.image} 
        resizeMode="cover" 
      />
      <View style={styles.titleContainer}>
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.6)', 'rgba(0,0,0,0.8)']}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.title}>{event.title || 'Event'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: '100%',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: '#1f2937',
  },
  image: {
    position: 'absolute',
    height: '100%',
    width: width,
    resizeMode: 'contain',
  },
  titleContainer: {
    height: 100,
    width: '100%',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    paddingHorizontal: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
});

export default EventCard; 