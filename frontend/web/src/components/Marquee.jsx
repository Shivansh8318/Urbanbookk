import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Marquee = ({ items, renderItem, onIndexChange, autoScrollInterval = 4000 }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const autoScrollTimerRef = useRef(null);
  const userInteractingRef = useRef(false);

  // Handle index changes and notify parent
  useEffect(() => {
    if (onIndexChange) {
      onIndexChange(activeIndex);
    }
  }, [activeIndex, onIndexChange]);

  // Auto-scrolling logic
  useEffect(() => {
    const startAutoScroll = () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
      
      autoScrollTimerRef.current = setInterval(() => {
        if (!userInteractingRef.current) {
          setActiveIndex((prevIndex) => (prevIndex + 1) % items.length);
        }
      }, autoScrollInterval);
    };

    startAutoScroll();
    
    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    };
  }, [autoScrollInterval, items.length]);

  const handleClick = (index) => {
    userInteractingRef.current = true;
    setActiveIndex(index);
    
    // Resume auto scroll after a brief pause
    setTimeout(() => {
      userInteractingRef.current = false;
    }, 1000);
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence initial={false} custom={1}>
        <motion.div
          key={activeIndex}
          custom={1}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.5 },
          }}
          className="absolute w-full h-full"
        >
          {renderItem({ item: items[activeIndex], index: activeIndex })}
        </motion.div>
      </AnimatePresence>

      {/* Indicator dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === activeIndex ? 'bg-white scale-110' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Marquee; 