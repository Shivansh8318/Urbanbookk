// src/features/teacher/services/teacherService.js
import axios from '../../../utils/axios';

export const fetchProfile = async (userId) => {
  const response = await axios.post('/api/teacher/get-profile/', { user_id: userId });
  return response.data;
};

export const fetchSlots = async (teacherId) => {
  const response = await axios.post(`/api/booking/get-teacher-slots/?t=${new Date().getTime()}`, {
    teacher_id: teacherId,
    limit: 100,
  });
  return response.data.sort((a, b) => {
    const dateDiff = new Date(a.date) - new Date(b.date);
    return dateDiff !== 0 ? dateDiff : a.start_time.localeCompare(b.start_time);
  });
};