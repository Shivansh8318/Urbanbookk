import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const CompleteProfileScreen = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { userData } = state || {};
  const [name, setName] = useState(userData?.name || '');
  const [gender, setGender] = useState(userData?.gender || '');
  const [age, setAge] = useState(userData?.age ? String(userData.age) : '');
  const [grade, setGrade] = useState('');
  const [school, setSchool] = useState('');
  const [subject, setSubject] = useState('');
  const [experienceYears, setExperienceYears] = useState('');

  useEffect(() => {
    if (!userData?.user_id) {
      alert('User data is missing');
      navigate(-1);
    }
  }, [userData, navigate]);

  const handleSubmit = async () => {
    if (!userData?.user_id) {
      alert('User ID is missing');
      return;
    }

    const profileData = {
      user_id: userData.user_id,
      name,
      gender,
      age: age ? parseInt(age, 10) : null,
    };

    const isStudent = userData.dashboard_route === 'StudentDashboard';
    if (isStudent) {
      profileData.grade = grade;
      profileData.school = school;
    } else {
      profileData.subject = subject;
      profileData.experience_years = experienceYears ? parseInt(experienceYears, 10) : 0;
    }

    try {
      const response = await axios.post(
        `/api/${isStudent ? 'student' : 'teacher'}/update-profile/`,
        profileData,
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (response.data.success) {
        alert('Profile updated successfully');
        navigate(isStudent ? '/student/dashboard' : '/teacher/dashboard', {
          state: { userData: { ...userData, ...profileData } },
        });
      } else {
        alert(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'An unexpected error occurred. Please try again.');
    }
  };

  const isStudent = userData?.dashboard_route === 'StudentDashboard';

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <motion.div
        className="max-w-md mx-auto bg-white p-6 rounded-lg shadow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-center mb-6">Complete Your Profile</h1>
        <input
          className="w-full p-2 mb-4 border rounded"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full p-2 mb-4 border rounded"
          placeholder="Gender (e.g., male, female, other)"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        />
        <input
          className="w-full p-2 mb-4 border rounded"
          placeholder="Age"
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
        {isStudent ? (
          <>
            <input
              className="w-full p-2 mb-4 border rounded"
              placeholder="Grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            />
            <input
              className="w-full p-2 mb-4 border rounded"
              placeholder="School"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
            />
          </>
        ) : (
          <>
            <input
              className="w-full p-2 mb-4 border rounded"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <input
              className="w-full p-2 mb-4 border rounded"
              placeholder="Experience Years"
              type="number"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
            />
          </>
        )}
        <button
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </motion.div>
    </div>
  );
};

export default CompleteProfileScreen;