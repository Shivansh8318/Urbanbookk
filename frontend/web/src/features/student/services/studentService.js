// src/features/student/services/studentService.js
import axios from '../../../utils/axios';

export const fetchProfile = async (userId) => {
  const response = await axios.post('/api/student/get-profile/', { user_id: userId });
  return response.data;
};

export const fetchTeachers = async () => {
  const response = await axios.get('/api/teacher/list-teachers/');
  if (!Array.isArray(response.data)) {
    throw new Error('Invalid response format: Expected an array');
  }
  return response.data;
};