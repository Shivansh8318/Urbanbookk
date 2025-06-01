// src/features/student/components/Sidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Sidebar = ({ userData, role, sidebarItems }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  return (
    <motion.div
      className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col justify-between p-6 fixed h-full z-10"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div>
        <h2 className="text-2xl font-extrabold text-white mb-8 tracking-tight">
          UrbanBook
        </h2>
        <nav className="space-y-2">
          {sidebarItems.map((item, index) => (
            <motion.div
              key={item.label}
              className="flex items-center p-3 rounded-lg cursor-pointer group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
              onClick={() => navigate(item.path, { state: { userData } })}
            >
              <span className="text-blue-400 mr-3 text-xl">{item.icon}</span>
              <span className="text-gray-300 group-hover:text-blue-300 transition-colors duration-300">
                {item.label}
              </span>
            </motion.div>
          ))}
        </nav>
      </div>
      <motion.button
        className="relative w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-full text-base font-semibold transform hover:scale-105 transition-all duration-300 overflow-hidden group"
        onClick={handleLogout}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="relative z-10">Logout</span>
        <motion.span
          className="absolute inset-0 border-2 border-red-400 rounded-full"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
        />
      </motion.button>
    </motion.div>
  );
};

export default Sidebar;