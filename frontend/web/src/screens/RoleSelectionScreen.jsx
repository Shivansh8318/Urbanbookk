import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import studentImage from '../assets/images/10.jpg';
import teacherImage from '../assets/images/9.jpg';

const roles = [
  {
    id: 1,
    title: 'Student',
    image: studentImage,
    description: 'Join a vibrant learning community and excel in your education.',
    features: [
      'Book classes with expert teachers',
      'Access HD video lessons anytime',
      'Track your progress and homework',
      'Engage in interactive learning sessions',
    ],
  },
  {
    id: 2,
    title: 'Teacher',
    image: teacherImage,
    description: 'Empower students with your expertise and manage your schedule effortlessly.',
    features: [
      'Schedule classes with ease',
      'Teach using interactive tools',
      'Monitor student progress',
      'Collaborate in real-time',
    ],
  },
];

const RoleSelectionScreen = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <AnimatePresence initial={false}>
        <motion.div
          key={roles[activeIndex].id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        >
          <img
            src={roles[activeIndex].image}
            alt={roles[activeIndex].title}
            className="w-full h-full object-cover filter brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />
        </motion.div>
      </AnimatePresence>

      {/* Subtle Background Particle Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.1)_0%,_transparent_70%)] animate-pulse" />
      </div>

      {/* Main Content */}
      <div className="relative max-w-5xl mx-auto p-6 sm:p-8 flex flex-col items-center min-h-screen justify-center">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-center bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-12 tracking-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Select Your Role
          </motion.h1>
        </motion.div>

        {/* Role Cards */}
        <motion.div
          className="flex justify-center space-x-6 sm:space-x-8 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              className={`relative p-6 rounded-2xl cursor-pointer group transform transition-all duration-500 ${
                activeIndex === index
                  ? 'bg-black/50 backdrop-blur-xl border-2 border-blue-500/50 shadow-xl shadow-blue-500/30'
                  : 'bg-black/40 backdrop-blur-xl border border-white/10 hover:bg-black/50'
              }`}
              onClick={() => setActiveIndex(index)}
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              <motion.img
                src={role.image}
                alt={role.title}
                className="relative w-36 h-36 sm:w-40 sm:h-40 object-cover rounded-lg mb-4 border-2 border-white/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              />
              <p className="relative text-lg sm:text-xl font-bold text-white text-center">{role.title}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Role Description and Features */}
        <motion.div
          className="text-center max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            {roles[activeIndex].title}
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-6">
            {roles[activeIndex].description}
          </p>
          <ul className="space-y-4 mb-8">
            {roles[activeIndex].features.map((feature, i) => (
              <motion.li
                key={i}
                className="flex items-center justify-center text-gray-300 text-lg sm:text-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
              >
                <motion.span
                  className="text-blue-400 mr-3 text-xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  ✓
                </motion.span>
                {feature}
              </motion.li>
            ))}
          </ul>
          <motion.button
            onClick={() => navigate(`/auth/${roles[activeIndex].title}`)}
            className="relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-lg sm:text-xl font-semibold transform hover:scale-105 transition-all duration-300 overflow-hidden group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10">Continue as {roles[activeIndex].title}</span>
            <motion.span
              className="absolute inset-0 border-2 border-blue-400 rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
            />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default RoleSelectionScreen;