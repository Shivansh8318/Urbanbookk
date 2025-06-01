// src/features/teacher/screens/TeacherBooking.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import Modal from 'react-modal';
import { motion } from 'framer-motion';
import teacherImage from '../../../assets/images/9.jpg';
import { fetchSlots } from '../services/teacherService';
import useBookingWebSocket from '../../shared/websocket/useBookingWebSocket';
import CustomToolbar from '../components/CustomToolbar';
import '../styles/calendar.css';

Modal.setAppElement('#root');

const localizer = momentLocalizer(moment);
const meetingURL = 'https://shivansh-videoconf-309.app.100ms.live/meeting/uvr-mzvu-vgd';

const TeacherBooking = () => {
  const { state } = useLocation();
  const { userData } = state || {};
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [upcomingSlots, setUpcomingSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [pendingSlots, setPendingSlots] = useState([]);
  const [showMeeting, setShowMeeting] = useState(false);

  if (!userData?.user_id) {
    console.error('userData is missing or invalid:', userData);
    useEffect(() => {
      alert('User data missing. Please log in again.');
      navigate('/auth/Teacher');
    }, [navigate]);
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-lg">Redirecting to login...</p>
      </div>
    );
  }

  const { sendMessage, lastMessage } = useBookingWebSocket(userData.user_id, 'Teacher');

  useEffect(() => {
    if (lastMessage) {
      console.log('Received WebSocket message:', lastMessage.data);
      try {
        const data = JSON.parse(lastMessage.data);
        if (data.type === 'slot_update' && data.action === 'added') {
          setPendingSlots((prev) => prev.filter((slot) => slot.id !== data.slot.id));
          setUpcomingSlots((prev) => {
            const updatedSlots = prev.filter((slot) => slot.id !== data.slot.id && !String(slot.id).startsWith('temp_'));
            return [
              ...updatedSlots,
              data.slot
            ].sort((a, b) => {
              const dateDiff = new Date(a.date) - new Date(b.date);
              return dateDiff !== 0 ? dateDiff : a.start_time.localeCompare(b.start_time);
            });
          });
        } else if (data.type === 'slot_update' && data.action === 'deleted') {
          setUpcomingSlots((prev) => prev.filter((slot) => slot.id !== data.slot_id));
          setPendingSlots((prev) => prev.filter((slot) => slot.id !== data.slot_id));
        } else if (data.type === 'booking_update' || data.type === 'slots_count') {
          fetchSlots(userData.user_id)
            .then((data) => {
              setUpcomingSlots([...pendingSlots, ...data.filter((slot) => !slot.is_booked)]);
              setBookedSlots(data.filter((slot) => slot.is_booked));
            })
            .catch((error) => {
              alert('Failed to fetch slots: ' + error.message);
            });
        } else if (data.type === 'error') {
          alert(data.message);
          if (data.message.includes('slot')) {
            setPendingSlots([]);
            setUpcomingSlots((prev) => prev.filter((slot) => !String(slot.id).startsWith('temp_')));
          }
          fetchSlots(userData.user_id)
            .then((data) => {
              setUpcomingSlots([...pendingSlots, ...data.filter((slot) => !slot.is_booked)]);
              setBookedSlots(data.filter((slot) => slot.is_booked));
            });
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        fetchSlots(userData.user_id)
          .then((data) => {
            setUpcomingSlots([...pendingSlots, ...data.filter((slot) => !slot.is_booked)]);
            setBookedSlots(data.filter((slot) => slot.is_booked));
          });
      }
    }
  }, [lastMessage, userData.user_id]);

  useEffect(() => {
    console.log('upcomingSlots:', upcomingSlots, 'pendingSlots:', pendingSlots);
  }, [upcomingSlots, pendingSlots]);

  useEffect(() => {
    fetchSlots(userData.user_id)
      .then((data) => {
        setUpcomingSlots([...pendingSlots, ...data.filter((slot) => !slot.is_booked)]);
        setBookedSlots(data.filter((slot) => slot.is_booked));
      })
      .catch((error) => {
        alert('Failed to fetch slots: ' + error.message);
        setTimeout(() => fetchSlots(userData.user_id), 5000);
      });
    const interval = setInterval(() => {
      fetchSlots(userData.user_id)
        .then((data) => {
          setUpcomingSlots([...pendingSlots, ...data.filter((slot) => !slot.is_booked)]);
          setBookedSlots(data.filter((slot) => slot.is_booked));
        });
    }, 30000);
    return () => clearInterval(interval);
  }, [userData, userData.user_id]);

  const handleAddSlot = () => {
    if (!date || !startTime || !endTime) {
      alert('Please fill in all fields');
      return;
    }
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      alert('Time must be in HH:MM format (24-hour)');
      return;
    }
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
      alert('End time must be after start time');
      return;
    }
    const newSlot = {
      teacher_id: userData.user_id,
      date: moment(date).format('YYYY-MM-DD'),
      start_time: startTime,
      end_time: endTime,
      is_booked: false,
      id: `temp_${Date.now()}`,
    };
    if (window.confirm(`Add slot on ${newSlot.date} from ${startTime} to ${endTime}?`)) {
      setDate(new Date());
      setStartTime('');
      setEndTime('');
      setPendingSlots((prev) => [...prev, newSlot]);
      setUpcomingSlots((prev) => [
        ...prev,
        newSlot
      ].sort((a, b) => {
        const dateDiff = new Date(a.date) - new Date(b.date);
        return dateDiff !== 0 ? dateDiff : a.start_time.localeCompare(b.start_time);
      }));
      sendMessage(JSON.stringify({ action: 'add_slot', ...newSlot }));
      alert('Slot added successfully');
    }
  };

  const events = [...upcomingSlots, ...bookedSlots].map((slot) => ({
    title: `${slot.start_time} - ${slot.end_time} ${slot.is_booked ? '(Booked)' : ''}`,
    start: new Date(`${slot.date}T${slot.start_time}`),
    end: new Date(`${slot.date}T${slot.end_time}`),
    id: slot.id,
    isBooked: slot.is_booked,
  }));

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      <img src={teacherImage} alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-30" />
      <div className="relative max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <motion.h1
          className="text-3xl sm:text-4xl font-bold text-white text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Manage Your Slots
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Add New Slot</h2>
          <Calendar
            localizer={localizer}
            date={date}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            className="bg-gray-800 rounded-lg p-4 border border-gray-600"
            onSelectSlot={({ start }) => setDate(start)}
            onNavigate={(newDate) => setDate(newDate)}
            selectable
            min={new Date()}
            components={{ toolbar: CustomToolbar }}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <input
              className="p-3 border rounded-lg bg-gray-800 text-white border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Date (YYYY-MM-DD)"
              value={moment(date).format('YYYY-MM-DD')}
              readOnly
            />
            <input
              className="p-3 border rounded-lg bg-gray-800 text-white border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Start Time (HH:MM)"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <input
              className="p-3 border rounded-lg bg-gray-800 text-white border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="End Time (HH:MM)"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <button
            className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
            onClick={handleAddSlot}
          >
            Add Slot
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
            Upcoming Slots <span className="text-sm text-white opacity-70">Total: {upcomingSlots.length}</span>
          </h2>
          {upcomingSlots.length === 0 ? (
            <p className="text-white opacity-70">No upcoming slots.</p>
          ) : (
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {upcomingSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-4 bg-gray-800 rounded-lg border border-gray-600"
                >
                  <p className="text-white">
                    {slot.date} {slot.start_time} - {slot.end_time}
                    {slot.id && String(slot.id).startsWith('temp_') && <span className="text-yellow-400 text-sm ml-2">(Pending)</span>}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
            Booked Slots <span className="text-sm text-white opacity-70">Total: {bookedSlots.length}</span>
          </h2>
          {bookedSlots.length === 0 ? (
            <p className="text-white opacity-70">No booked slots.</p>
          ) : (
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {bookedSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-800 rounded-lg border border-gray-600"
                >
                  <div>
                    <p className="text-white">
                      {slot.date} {slot.start_time} - {slot.end_time}
                    </p>
                    {slot.status && <p className="text-white opacity-60 text-sm">Status: {slot.status}</p>}
                    {slot.student_name && <p className="text-white opacity-70 text-sm">Student: {slot.student_name}</p>}
                  </div>
                  <button
                    className="mt-2 sm:mt-0 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    onClick={() => setShowMeeting(true)}
                  >
                    Start Class
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <Modal
          isOpen={showMeeting}
          onRequestClose={() => setShowMeeting(false)}
          style={{
            content: {
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '800px',
              padding: '20px',
              borderRadius: '8px',
              background: '#1F2937',
            },
          }}
        >
          <iframe src={meetingURL} className="w-full h-[70vh]" allow="camera; microphone" title="Video Meeting" />
          <button
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition w-full"
            onClick={() => setShowMeeting(false)}
          >
            Close
          </button>
        </Modal>
      </div>
    </div>
  );
};

export default TeacherBooking;