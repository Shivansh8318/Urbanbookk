import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, useWindowDimensions, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const Marquee = ({ items, renderItem, onIndexChange, autoScrollInterval = 3000 }) => {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const autoScrollTimerRef = useRef(null);
  const userInteractingRef = useRef(false);
  
  // Use full width for each item to show exactly one item at a time
  const itemWidth = width;
  const spacer = 0; // No spacer needed when using full width
  
  // Create extended data array for infinite scrolling
  const extendedData = [...items, ...items, ...items]; // Triplicate the items
  const originalLength = items.length;

  // Animation values
  const scale = useSharedValue(1);
  
  // Handle index changes and notify parent
  useEffect(() => {
    if (onIndexChange) {
      // Map the extended index back to the original data array
      const originalIndex = activeIndex % originalLength;
      onIndexChange(originalIndex);
    }
  }, [activeIndex, onIndexChange, originalLength]);

  // Initial scroll to middle section for infinite scrolling
  useEffect(() => {
    if (flatListRef.current) {
      // Start in the middle section
      const initialIndex = originalLength;
      flatListRef.current.scrollToIndex({
        index: initialIndex,
        animated: false,
      });
      setActiveIndex(initialIndex);
    }
  }, [originalLength]);

  // Auto-scrolling logic
  const startAutoScroll = useCallback(() => {
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
    }
    
    autoScrollTimerRef.current = setInterval(() => {
      if (!userInteractingRef.current && flatListRef.current) {
        const nextIndex = activeIndex + 1;
        flatListRef.current.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
      }
    }, autoScrollInterval);
  }, [activeIndex, autoScrollInterval]);
  
  // Set up auto scrolling
  useEffect(() => {
    startAutoScroll();
    
    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    };
  }, [activeIndex, startAutoScroll]);

  // Handle user interaction
  const onScrollBeginDrag = useCallback(() => {
    userInteractingRef.current = true;
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
    }
  }, []);

  const onScrollEndDrag = useCallback(() => {
    userInteractingRef.current = false;
    startAutoScroll();
  }, [startAutoScroll]);

  const onScroll = useCallback(
    (event) => {
      const slideSize = event.nativeEvent.layoutMeasurement.width;
      const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
      const roundIndex = Math.round(index);
      
      if (roundIndex !== activeIndex) {
        setActiveIndex(roundIndex);
        scale.value = withTiming(1.05, { duration: 200 });
        setTimeout(() => {
          scale.value = withTiming(1, { duration: 200 });
        }, 200);
        
        // Handle looping when reaching the ends
        if (roundIndex <= originalLength - 1) {
          // If we're in the first section, jump to the middle section
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: roundIndex + originalLength,
              animated: false,
            });
            setActiveIndex(roundIndex + originalLength);
          }, 200);
        } else if (roundIndex >= originalLength * 2) {
          // If we're in the last section, jump to the middle section
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: roundIndex - originalLength,
              animated: false,
            });
            setActiveIndex(roundIndex - originalLength);
          }, 200);
        }
      }
    },
    [activeIndex, scale, originalLength]
  );

  const scrollToIndex = (index) => {
    if (flatListRef.current) {
      // Calculate the actual index in the extended data
      const targetIndex = index + originalLength;
      flatListRef.current.scrollToIndex({
        index: targetIndex,
        animated: true,
      });
    }
  };

  const renderItemWithContext = ({ item, index }) => {
    // Get the original index for the item
    const originalIndex = index % originalLength;
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.itemContainer, { width: itemWidth }]}
        onPress={() => {
          userInteractingRef.current = true;
          scrollToIndex(originalIndex);
          // Resume auto scroll after a brief pause
          setTimeout(() => {
            userInteractingRef.current = false;
          }, 1000);
        }}>
        {renderItem({ item, index: originalIndex })}
      </TouchableOpacity>
    );
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const getItemLayout = (_, index) => ({
    length: width,
    offset: width * index,
    index,
  });

  const keyExtractor = (item, index) => `${item.id}-${index}`;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <FlatList
        ref={flatListRef}
        data={extendedData}
        renderItem={renderItemWithContext}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={width} // Snap to each screen width
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: spacer }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        getItemLayout={getItemLayout}
        initialNumToRender={3}
        maxToRenderPerBatch={5}
        windowSize={5}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    justifyContent: 'center',
  },
  itemContainer: {
    height: '100%',
    padding: 0, 
  },
});

export default Marquee; 