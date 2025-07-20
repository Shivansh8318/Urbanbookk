import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const CompleteProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userData } = route.params || {};
  const [name, setName] = useState(userData?.name || '');
  const [gender, setGender] = useState(userData?.gender || '');
  const [age, setAge] = useState(userData?.age ? String(userData.age) : '');
  const [grade, setGrade] = useState('');
  const [school, setSchool] = useState('');
  const [subject, setSubject] = useState('');
  const [experienceYears, setExperienceYears] = useState('');

  useEffect(() => {
    if (!userData?.user_id) {
      Alert.alert('Error', 'User data is missing');
      navigation.goBack();
    }
  }, [userData, navigation]);

  const handleSubmit = async () => {
    if (!userData?.user_id) {
      Alert.alert('Error', 'User ID is missing');
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

    console.log('Sending profile data:', profileData);

    try {
      const response = await fetch(
        `https://urbanbookk-1.onrender.com/api/${isStudent ? 'student' : 'teacher'}/update-profile/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profileData),
          timeout: 10000, 
        }
      );
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);
      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully');
        navigation.navigate(userData.dashboard_route, { userData: { ...userData, ...profileData } });
      } else {
        Alert.alert('Error', result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Network error details:', error.message, error.name, error.code);
      if (error.message.includes('Network request failed')) {
        Alert.alert(
          'Network Error',
          'Failed to connect to the server. Ensure your device is on the same Wi-Fi network as the server (using 172.20.10.3).'
        );
      } else {
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    }
  };

  const isStudent = userData?.dashboard_route === 'StudentDashboard';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput
        style={styles.input}
        placeholder="Gender (e.g., male, female, other)"
        value={gender}
        onChangeText={setGender}
      />
      <TextInput
        style={styles.input}
        placeholder="Age"
        value={age}
        keyboardType="numeric"
        onChangeText={setAge}
      />
      {isStudent ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Grade"
            value={grade}
            onChangeText={setGrade}
          />
          <TextInput
            style={styles.input}
            placeholder="School"
            value={school}
            onChangeText={setSchool}
          />
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Subject"
            value={subject}
            onChangeText={setSubject}
          />
          <TextInput
            style={styles.input}
            placeholder="Experience Years"
            value={experienceYears}
            keyboardType="numeric"
            onChangeText={setExperienceYears}
          />
        </>
      )}
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default CompleteProfileScreen;