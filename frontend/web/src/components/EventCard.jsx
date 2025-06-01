import React from 'react';

const EventCard = ({ event }) => {
  return (
    <div className="relative w-full h-full flex items-end justify-center overflow-hidden bg-gray-800">
      <img 
        src={event.image} 
        alt={event.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-60" />
      <div className="relative z-10 w-full h-24 flex items-center justify-center">
        <h2 className="text-white text-3xl font-bold text-center px-5 drop-shadow-lg">
          {event.title || 'Event'}
        </h2>
      </div>
    </div>
  );
};

export default EventCard; 