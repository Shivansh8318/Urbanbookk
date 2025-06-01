import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// Import the Footer component
import Footer from '../components/layout/Footer';

// Import all images
import image1 from '../assets/images/1.jpg';
import image2 from '../assets/images/2.jpg';
import image3 from '../assets/images/3.jpg';
import image4 from '../assets/images/4.jpg';
import image5 from '../assets/images/5.jpg';
import image6 from '../assets/images/6.jpg';
import image7 from '../assets/images/7.jpg';
import image8 from '../assets/images/8.jpg';

const events = [
  { id: 1, title: 'UrbanBook', image: image1, subtitle: 'Your Gateway to Smart Learning' },
  { id: 2, title: 'Seamless Scheduling', image: image2, subtitle: 'Book Classes with Ease' },
  { id: 3, title: 'Video Classes', image: image3, subtitle: 'Learn from Anywhere' },
  { id: 4, title: 'Live Sync', image: image4, subtitle: 'Real-time Collaboration' },
  { id: 5, title: 'Homework Mastery', image: image5, subtitle: 'Track Your Progress' },
  { id: 6, title: 'Smart Calendar', image: image6, subtitle: 'Organize Your Time' },
  { id: 7, title: 'Interactive Learning', image: image7, subtitle: 'Engage and Excel' },
  { id: 8, title: 'Progress Tracking', image: image8, subtitle: 'Monitor Your Growth' },
];

const WelcomeScreen = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isHovered) {
      timerRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % events.length);
      }, 5000);
    }
    return () => clearInterval(timerRef.current);
  }, [isHovered]);

  return (
    <div className="w-full bg-gray-950 text-white font-sans overflow-x-hidden">
      {/* Hero Section with Carousel */}
      <section className="hero-section relative h-screen">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.div
              key={events[activeIndex].id}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <img
                src={events[activeIndex].image}
                alt={`${events[activeIndex].title} banner`}
                className="w-full h-full object-cover filter brightness-75"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center text-center min-h-screen px-4 sm:px-6 py-20">
          <motion.div
            className="backdrop-blur-lg bg-black/50 p-8 sm:p-12 rounded-3xl max-w-4xl mx-auto border border-white/30"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <motion.p
              className="text-base sm:text-lg md:text-xl font-medium text-blue-200 mb-3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Welcome to
            </motion.p>
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-5"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              UrbanBook
            </motion.h1>
            <motion.p
              className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-5 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              Elevate your educational journey with intelligent scheduling, immersive collaboration, and cutting-edge learning tools.
            </motion.p>
            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-2xl mb-3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              {events[activeIndex].title}
            </motion.h2>
            <motion.p
              className="text-base sm:text-lg md:text-xl text-blue-200 drop-shadow-xl font-medium mx-auto max-w-4xl leading-relaxed mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              {events[activeIndex].subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              <Link
                to="/role-selection"
                className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-base sm:text-lg font-semibold text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-600/40"
              >
                Start Your Journey
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
          {events.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setActiveIndex(index)}
              whileHover={{ scale: 1.4 }}
              whileTap={{ scale: 0.9 }}
              role="button"
              aria-pressed={index === activeIndex}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                index === activeIndex 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-125 shadow-lg shadow-blue-500/50' 
                  : 'bg-white/40 hover:bg-white/90'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 sm:py-28 bg-gray-900/60 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-center bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            How UrbanBook Works
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
            {[
              { step: '1', title: 'Sign Up', description: 'Create your profile as a student or teacher in seconds.', icon: '✨' },
              { step: '2', title: 'Schedule', description: 'Find and book the perfect learning sessions.', icon: '📅' },
              { step: '3', title: 'Collaborate', description: 'Connect through HD video classes and real-time tools.', icon: '📹' },
              { step: '4', title: 'Succeed', description: 'Track your progress and achieve your goals.', icon: '🏆' },
            ].map((step, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-lg p-8 rounded-3xl border border-gray-700/30 hover:border-blue-600/50 transition-all duration-300 shadow-xl hover:shadow-blue-600/20"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10, scale: 1.03 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <div className="text-5xl sm:text-6xl mb-6 text-blue-400">{step.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-white/70 text-lg">{step.description}</p>
                <div className="mt-6 text-blue-400 font-bold text-lg">Step {step.step}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Why UrbanBook */}
      <section className="py-20 sm:py-28 bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-8">
              Why Choose UrbanBook?
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-white/70 max-w-4xl mx-auto">
              Discover the future of education with our innovative features designed for seamless and effective learning.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            {[
              {
                title: 'Smart Scheduling',
                description: 'Effortlessly book and manage appointments with our AI-powered scheduling system.',
                icon: '📅',
                features: ['Automated time zone detection', 'Conflict-free booking', 'Instant notifications']
              },
              {
                title: 'Live Collaboration',
                description: 'Engage in crystal-clear video classes with interactive tools for better learning.',
                icon: '📹',
                features: ['HD video quality', 'Interactive whiteboard', 'Screen sharing']
              },
              {
                title: 'Progress Tracking',
                description: 'Monitor your educational journey with comprehensive analytics and insights.',
                icon: '📊',
                features: ['Detailed analytics', 'Progress reports', 'Achievement badges']
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-lg rounded-3xl p-8 sm:p-10 border border-gray-700/30 hover:border-blue-600/50 transition-all duration-300 shadow-xl hover:shadow-blue-600/20"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10, scale: 1.03 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
              >
                <div className="text-5xl sm:text-6xl mb-8 text-blue-400">{feature.icon}</div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-5">{feature.title}</h3>
                <p className="text-white/70 text-lg sm:text-xl mb-8">{feature.description}</p>
                <ul className="space-y-4">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center paragraphs-white/80 text-lg">
                      <span className="text-blue-400 mr-3 text-xl">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 sm:py-28 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-purple-600/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-8">
              What Our Users Say
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-white/70 max-w-4xl mx-auto">
              Join thousands of satisfied students and teachers who have transformed their educational experience with UrbanBook.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            {[
              {
                name: 'Shivansh Agrawal',
                role: 'Medical Student',
                quote: 'UrbanBook has revolutionized my study routine. The scheduling system is incredibly intuitive, and the video classes are crystal clear!',
                avatar: image1,
                rating: 5
              },
              {
                name: 'Utkarsh Singh',
                role: 'Physics Teacher',
                quote: 'As an educator, I love how UrbanBook streamlines everything. The interactive tools make teaching online as effective as in-person classes.',
                avatar: image2,
                rating: 5
              },
              {
                name: 'Jagriti Sharma',
                role: 'Parent',
                quote: 'Monitoring my daughter\'s progress has never been easier. The detailed reports help me stay involved in her education journey.',
                avatar: image3,
                rating: 5
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-lg rounded-3xl p-8 sm:p-10 border border-gray-700/30 hover:border-blue-600/50 transition-all duration-300 shadow-xl hover:shadow-blue-600/20"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10, scale: 1.03 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-8">
                  <img
                    src={testimonial.avatar}
                    alt={`Avatar of ${testimonial.name}`}
                    className="w-16 sm:w-20 h-16 sm:h-20 rounded-full object-cover border-4 border-blue-500/50"
                  />
                  <div className="ml-4 sm:ml-5">
                    <h4 className="text-xl sm:text-2xl font-bold text-white">{testimonial.name}</h4>
                    <p className="text-blue-400 text-base sm:text-lg">{testimonial.role}</p>
                  </div>
                </div>
                <div className="mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl sm:text-2xl">★</span>
                  ))}
                </div>
                <blockquote className="text-white/80 text-lg sm:text-xl italic mb-8">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center text-white/60 text-base sm:text-lg">
                  <span className="mr-3">Verified User</span>
                  <span className="text-blue-400 text-xl">✓</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700" />
        <div className="absolute inset-0 bg-[url('/path/to/pattern.png')] opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Ready to Transform Your Learning Experience?
            </motion.h2>
            <motion.p
              className="text-lg sm:text-xl md:text-2xl text-white/90 mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              Join UrbanBook today and unlock a world of seamless education and collaboration.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
            >
              <Link
                to="/role-selection"
                className="inline-flex items-center px-10 py-5 text-lg sm:text-xl font-semibold text-blue-600 bg-white rounded-full hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-blue-600/40 transform hover:scale-105"
              >
                Get Started Now
                <svg className="w-6 h-6 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default WelcomeScreen;