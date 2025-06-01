import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-8 bg-gray-900 text-white/80">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col sm:flex-row justify-between items-center">
        <div className="mb-4 sm:mb-0 text-center sm:text-left">
          <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
            UrbanBook
          </h3>
          <p className="text-sm">Empowering education, one appointment at a time.</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 text-center">
          <Link to="/about" className="hover:text-white transition-colors text-sm sm:text-base">
            About
          </Link>
          <Link to="/contact" className="hover:text-white transition-colors text-sm sm:text-base">
            Contact
          </Link>
          <Link to="/privacy" className="hover:text-white transition-colors text-sm sm:text-base">
            Privacy
          </Link>
        </div>
      </div>
      <div className="mt-4 text-center text-sm w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        © {currentYear} UrbanBook. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer; 