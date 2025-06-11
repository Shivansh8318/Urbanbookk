import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
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
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userData?.user_id) {
      console.error('User data missing:', userData);
      setError('User data is missing. Redirecting...');
      setTimeout(() => navigate(-1), 2000);
    } else {
      console.log('User data received:', userData);
    }
  }, [userData, navigate]);

  const handleTextInput = (value, setter) => {
    if (/^[a-zA-Z\s]*$/.test(value)) {
      setter(value);
    }
  };

  const isStudent = userData?.dashboard_route === 'StudentDashboard';

  const handleSubmit = async () => {
    console.log('Submit clicked with data:', { name, gender, age, grade, school, subject, experienceYears });
    setError('');
    setIsLoading(true);

    if (!userData?.user_id) {
      console.error('User ID missing');
      setError('User ID is missing');
      setIsLoading(false);
      return;
    }

    if (!name || !gender || !age) {
      console.warn('Required fields missing:', { name, gender, age });
      setError('Please fill in all required fields (Name, Gender, Age)');
      setIsLoading(false);
      return;
    }

    if (isStudent && !grade) {
      console.warn('Grade missing for student');
      setError('Please enter your grade');
      setIsLoading(false);
      return;
    }

    const profileData = {
      user_id: userData.user_id,
      name,
      gender,
      age: age ? parseInt(age, 10) : null,
    };

    if (isStudent) {
      profileData.grade = grade ? parseInt(grade, 10) : null;
      profileData.school = school;
    } else {
      profileData.subject = subject;
      profileData.experience_years = experienceYears ? parseInt(experienceYears, 10) : 0;
    }

    console.log('Sending profile data:', profileData);

    try {
      const response = await axios.post(
        `/api/${isStudent ? 'student' : 'teacher'}/update-profile/`,
        profileData,
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log('API response:', response.data);
      if (response.data.success) {
        console.log('Profile updated successfully, navigating to:', isStudent ? '/student/dashboard' : '/teacher/dashboard');
        navigate(isStudent ? '/student/dashboard' : '/teacher/dashboard', {
          state: { userData: { ...userData, ...profileData } },
        });
      } else {
        setError(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('API error:', error);
      setError(error.response?.data?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.1)_0%,_transparent_70%)] animate-pulse" />
      </div>
      <motion.div
        className="max-w-lg mx-auto bg-black/40 backdrop-blur-xl rounded-2xl p-6 sm:p-8 mt-12 border border-white/10 shadow-lg hover:shadow-xl hover:shadow-blue-500/20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6 tracking-tight">
          Complete Your Profile
        </h1>
        {error && (
          <motion.div
            className="mb-4 p-3 bg-red-600/20 border border-red-500 rounded-lg text-red-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}
        <div className="space-y-4">
          <motion.div variants={itemVariants}>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${
                name ? 'border-gray-600' : 'border-red-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300`}
              placeholder="Enter your name (letters only)"
              value={name}
              onChange={(e) => handleTextInput(e.target.value, setName)}
              pattern="[A-Za-z\s]*"
              aria-describedby="name-helper"
            />
            <p id="name-helper" className="text-xs text-gray-400 mt-1">
              Only letters and spaces are allowed
            </p>
          </motion.div>
          <motion.div variants={itemVariants}>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              id="gender"
              className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${
                gender ? 'border-gray-600' : 'border-red-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300`}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="" disabled>
                Select gender
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </motion.div>
          <motion.div variants={itemVariants}>
            <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-1">
              Age <span className="text-red-500">*</span>
            </label>
            <input
              id="age"
              type="number"
              min="1"
              className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${
                age ? 'border-gray-600' : 'border-red-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300`}
              placeholder="Enter your age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              aria-describedby="age-helper"
            />
            <p id="age-helper" className="text-xs text-gray-400 mt-1">
              Enter a positive number
            </p>
          </motion.div>
          {isStudent ? (
            <>
              <motion.div variants={itemVariants}>
                <label htmlFor="grade" className="block text-sm font-medium text-gray-300 mb-1">
                  Grade <span className="text-red-500">*</span>
                </label>
                <input
                  id="grade"
                  type="number"
                  min="1"
                  max="12"
                  className={`w-full p-3 rounded-lg bg-gray-800 text-white border ${
                    grade ? 'border-gray-600' : 'border-red-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300`}
                  placeholder="Enter your grade (1-12)"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  aria-describedby="grade-helper"
                />
                <p id="grade-helper" className="text-xs text-gray-400 mt-1">
                  Enter a number between 1 and 12
                </p>
              </motion.div>
              <motion.div variants={itemVariants}>
                <label htmlFor="school" className="block text-sm font-medium text-gray-300 mb-1">
                  School
                </label>
                <input
                  id="school"
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  placeholder="Enter your school (letters only)"
                  value={school}
                  onChange={(e) => handleTextInput(e.target.value, setSchool)}
                  pattern="[A-Za-z\s]*"
                  aria-describedby="school-helper"
                />
                <p id="school-helper" className="text-xs text-gray-400 mt-1">
                  Only letters and spaces are allowed
                </p>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div variants={itemVariants}>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">
                  Subject
                </label>
                <input
                  id="subject"
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  placeholder="Enter your subject (letters only)"
                  value={subject}
                  onChange={(e) => handleTextInput(e.target.value, setSubject)}
                  pattern="[A-Za-z\s]*"
                  aria-describedby="subject-helper"
                />
                <p id="subject-helper" className="text-xs text-gray-400 mt-1">
                  Only letters and spaces are allowed
                </p>
              </motion.div>
              <motion.div variants={itemVariants}>
                <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-300 mb-1">
                  Experience Years
                </label>
                <input
                  id="experienceYears"
                  type="number"
                  min="0"
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  placeholder="Enter years of experience"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  aria-describedby="experience-helper"
                />
                <p id="experience-helper" className="text-xs text-gray-400 mt-1">
                  Enter a number (0 or more)
                </p>
              </motion.div>
            </>
          )}
          <motion.div variants={itemVariants}>
            <button
              className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg transition-all duration-300 font-semibold ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-600 hover:to-purple-700'
              }`}
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit'}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default CompleteProfileScreen;