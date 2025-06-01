// src/features/student/components/CustomToolbar.jsx
import React from 'react';
import moment from 'moment';

const CustomToolbar = ({ date, onNavigate }) => {
  return (
    <div className="flex justify-between items-center mb-4 p-4 bg-gray-800 rounded-lg">
      <button
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        onClick={() => onNavigate('PREV')}
      >
        Previous
      </button>
      <span className="text-white text-lg font-semibold">{moment(date).format('MMMM YYYY')}</span>
      <button
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        onClick={() => onNavigate('NEXT')}
      >
        Next
      </button>
    </div>
  );
};

export default CustomToolbar;