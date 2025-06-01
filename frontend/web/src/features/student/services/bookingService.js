// src/features/student/services/bookingService.js
import axios from '../../../utils/axios';

export const fetchAllSlots = async (teacherId) => {
  const response = await axios.post('/api/booking/get-teacher-slots/', {
    teacher_id: teacherId,
    limit: 500,
    include_all: true,
  });
  return response.data
    .filter((slot) => !slot.is_booked && new Date(slot.date) >= new Date().setHours(0, 0, 0, 0))
    .map((slot) => ({
      ...slot,
      start_time: slot.start_time.padEnd(8, ':00'),
      end_time: slot.end_time.padEnd(8, ':00'),
    }))
    .sort((a, b) => {
      const dateDiff = new Date(a.date) - new Date(b.date);
      return dateDiff !== 0 ? dateDiff : a.start_time.localeCompare(b.start_time);
    });
};

export const fetchAvailableSlots = async (teacherId, date) => {
  const dateStr = date.format('YYYY-MM-DD');
  const response = await axios.post('/api/booking/get-teacher-slots/', {
    teacher_id: teacherId,
    date: dateStr,
    limit: 500,
  });
  return response.data
    .filter((slot) => !slot.is_booked)
    .map((slot) => ({
      ...slot,
      start_time: slot.start_time.padEnd(8, ':00'),
      end_time: slot.end_time.padEnd(8, ':00'),
    }))
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
};

export const fetchBookedClasses = async (studentId) => {
  const response = await axios.post('/api/booking/get-student-bookings/', {
    student_id: studentId,
  });
  return response.data;
};

export const createPaymentOrder = async (bookingId) => {
  const response = await axios.post('/api/payment/create-order/', {
    booking_id: bookingId,
    amount: 500,
    currency: 'INR',
  });
  return response.data;
};

export const verifyPayment = async (paymentData) => {
  const response = await axios.post('/api/payment/verify-payment/', paymentData);
  return response.data;
};