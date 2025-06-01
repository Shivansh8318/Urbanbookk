// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import WelcomeScreen from './screens/WelcomeScreen';
import RoleSelectionScreen from './screens/RoleSelectionScreen';
import CompleteProfileScreen from './screens/CompleteProfileScreen';
import AuthScreen from './features/auth/screens/AuthScreen';
import StudentDashboard from './features/student/screens/StudentDashboard';
import StudentBooking from './features/student/screens/StudentBooking';
import TeacherDashboard from './features/teacher/screens/TeacherDashboard';
import TeacherBooking from './features/teacher/screens/TeacherBooking';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/role-selection" element={<RoleSelectionScreen />} />
        <Route path="/auth/:role" element={<AuthScreen />} />
        <Route path="/complete-profile" element={<CompleteProfileScreen />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/booking" element={<StudentBooking />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/booking" element={<TeacherBooking />} />
      </Routes>
    </Router>
  );
};

export default App;