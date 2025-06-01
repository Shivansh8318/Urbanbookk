import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from '../screens/WelcomeScreen';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';
import AuthScreen from '../screens/auth/AuthScreen';
import CompleteProfileScreen from '../screens/auth/CompleteProfileScreen';
import StudentDashboard from '../screens/student/StudentDashboard';
import TeacherDashboard from '../screens/teacher/TeacherDashboard';
import StudentBooking from '../screens/student/StudentBooking';
import TeacherBooking from '../screens/teacher/TeacherBooking';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="CompleteProfileScreen" component={CompleteProfileScreen} />
        <Stack.Screen name="StudentDashboard" component={StudentDashboard} />
        <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} />
        <Stack.Screen name="StudentBooking" component={StudentBooking} />
        <Stack.Screen name="TeacherBooking" component={TeacherBooking} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;