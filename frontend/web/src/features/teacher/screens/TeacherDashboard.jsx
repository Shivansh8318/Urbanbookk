// src/features/teacher/screens/TeacherDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import teacherImage from '../../../assets/images/9.jpg';
import { fetchProfile } from '../services/teacherService';
import Sidebar from '../components/Sidebar'; // Can reuse from student

const TeacherDashboard = () => {
  const { state } = useLocation();
  const { userData } = state || {};
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    fetchProfile(userData.user_id)
      .then((data) => setProfileData(data))
      .catch((error) => console.error('Error fetching profile:', error));
  }, [userData]);

  const sidebarItems = [
    { label: 'Dashboard', path: '/teacher/dashboard', icon: '🏠' },
    { label: 'Manage Slots', path: '/teacher/booking', icon: '🕒' },
    { label: 'View Schedule', path: '/teacher/booking', icon: '📅' },
    { label: 'Student Progress', path: '/teacher/booking', icon: '📊' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1.2 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      >
        <img
          src={teacherImage}
          alt="Background"
          className="w-full h-full object-cover filter brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />
      </motion.div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_center,_rgba(59, personally predicted: 130,246,0.1)_0%,_transparent_70%)] animate-pulse" />
      </div>

      <div className="flex min-h-screen">
        <Sidebar userData={userData} role="Teacher" sidebarItems={sidebarItems} />

        <div className="flex-1 ml-64 p-6 sm:p-8 flex flex-col items-center min-h-screen justify-center">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-center bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4 tracking-tight">
              Teacher Dashboard
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 text-center mb-10">
              Welcome back, {profileData?.name || userData?.name || 'Teacher'}!
            </p>
          </motion.div>

          {profileData && (
            <motion.div
              className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-blue-500/50 transition-all duration-500 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 w-full max-w-2xl group mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              <h2 className="relative text-2xl sm:text-3xl font-extrabold text-white mb-6 tracking-tight">
                Your Profile
              </h2>
              <div className="relative space-y-4">
                <motion.div
                  className="flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <span className="text-blue-400 mr-3 text-xl">👤</span>
                  <p className="text-base sm:text-lg text-gray-300">
                    <span className="font-semibold text-white">Name: </span>
                    {profileData.name || 'Not available'}
                  </p>
                </motion.div>
                <motion.div
                  className="flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <span className="text-blue-400 mr-3 text-xl">⚥</span>
                  <p className="text-base sm:text-lg text-gray-300">
                    <span className="font-semibold text-white">Gender: </span>
                    {profileData.gender || 'Not available'}
                  </p>
                </motion.div>
                <motion.div
                  className="flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <span className="text-blue-400 mr-3 text-xl">🎂</span>
                  <p className="text-base sm:text-lg text-gray-300">
                    <span className="font-semibold text-white">Age: </span>
                    {profileData.age || 'Not available'}
                  </p>
                </motion.div>
                <motion.div
                  className="flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <span className="text-blue-400 mr-3 text-xl">📚</span>
                  <p className="text-base sm:text-lg text-gray-300">
                    <span className="font-semibold text-white">Subject: </span>
                    {profileData.subject || 'Not available'}
                  </p>
                </motion.div>
                <motion.div
                  className="flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <span className="text-blue-400 mr-3 text-xl">🏆</span>
                  <p className="text-base sm:text-lg text-gray-300">
                    <span className="font-semibold text-white">Experience: </span>
                    {profileData.experience_years || '0'} years
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;