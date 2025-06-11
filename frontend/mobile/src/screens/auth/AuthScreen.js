import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { OtplessModule } from 'otpless-react-native';

const { width, height } = Dimensions.get('window');

const AuthScreen = ({ route, navigation }) => {
  const { role = 'Student' } = route.params || {};
  const [loginStatus, setLoginStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('');

  const otplessModule = new OtplessModule();

  const params = {
    appId: '9DRP3BQPAKLIZYTVT2JS',
  };

  const getVerificationUrl = () => {
    const baseUrl = 'https://urbanbookk-1.onrender.com/api/';
    return role.toLowerCase() === 'student'
      ? `${baseUrl}student/validate-token/`
      : `${baseUrl}teacher/validate-token/`;
  };

  const verifyTokenWithBackend = async (token) => {
    try {
      const VERIFICATION_URL = getVerificationUrl();
      setVerificationStatus('Verifying with backend...');

      const response = await fetch(VERIFICATION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${text}`);
      }

      const result = await response.json();

      if (result.success) {
        setVerificationStatus(`Verification successful: ${result.message}`);
        result.dashboard_route = role === 'Student'

 ? 'StudentDashboard' : 'TeacherDashboard';

        if (result.is_new_user) {
          navigation.navigate('CompleteProfileScreen', { userData: result });
        } else {
          navigation.navigate(result.dashboard_route, { userData: result });
        }
        return true;
      } else {
        setVerificationStatus(`Verification failed: ${result.message}`);
        Alert.alert('Verification Failed', result.message || 'Could not verify your identity. Please try again.');
        return false;
      }
    } catch (error) {
      setVerificationStatus(`Verification error: ${error.message || 'Unknown error'}`);
      console.error('Verification error:', error);
      Alert.alert('Verification Error', error.message || 'An error occurred during verification. Please try again.');
      return false;
    }
  };

  const handleLogin = () => {
    setIsLoading(true);
    setLoginStatus('');
    setVerificationStatus('');

    try {
      if (!otplessModule) {
        setIsLoading(false);
        const errorMsg = 'OTPless module not available';
        setLoginStatus(`Error: ${errorMsg}`);
        Alert.alert('Login Failed', errorMsg);
        return;
      }

      otplessModule.showLoginPage((response) => {
        setIsLoading(false);

        if (response.data === null || response.data === undefined) {
          const errorMsg = response.errorMessage || 'Login failed';
          setLoginStatus(`Error: ${errorMsg}`);
          Alert.alert('Login Failed', errorMsg);
        } else {
          setUserData(response.data);

          if (response.data.token) {
            setVerificationStatus('Verifying token...');
            setLoginStatus('Completing authentication...');

            verifyTokenWithBackend(response.data.token).catch((error) => {
              setLoginStatus(`Error: ${error.message}`);
            });
          } else {
            setVerificationStatus('No token available for verification');
            Alert.alert('Authentication Error', 'No token received from authentication service');
          }
        }
      }, params);
    } catch (error) {
      setIsLoading(false);
      const errorMsg = error?.message || 'Unknown error occurred';
      setLoginStatus(`Error: ${errorMsg}`);
      Alert.alert('Login Error', `An error occurred: ${errorMsg}`);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFFFFF', '#F9FAFB']} style={StyleSheet.absoluteFill}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
              <Animated.Text style={styles.title} entering={FadeIn.delay(100).duration(500)}>
                {`${role} Sign In`}
              </Animated.Text>
            </View>

            <Animated.View style={styles.authContainer} entering={FadeInUp.delay(200).duration(500)}>
              <Text style={styles.subtitle}>Sign in to access your {role.toLowerCase()} dashboard</Text>

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4F46E5" />
                  <Text style={styles.loadingText}>Signing in...</Text>
                </View>
              ) : (
                <>
                  <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <Text style={styles.loginButtonText}>Login </Text>
                  </TouchableOpacity>

                  {loginStatus && (
                    <View
                      style={[
                        styles.statusContainer,
                        loginStatus.includes('Error') ? styles.errorStatus : styles.successStatus,
                      ]}
                    >
                      <Text style={styles.statusText}>{loginStatus}</Text>
                    </View>
                  )}

                  {verificationStatus && (
                    <View style={styles.verificationStatusContainer}>
                      <Text style={styles.verificationStatusText}>{verificationStatus}</Text>
                    </View>
                  )}
                </>
              )}
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginVertical: 20,
    position: 'relative',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 0,
    zIndex: 10,
  },
  backButtonText: {
    color: '#111827',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#111827',
    marginBottom: 30,
    textAlign: 'center',
  },
  authContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: 'rgba(249, 250, 251, 0.8)',
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#4B5563',
  },
  statusContainer: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  successStatus: {
    backgroundColor: '#ECFDF5',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  errorStatus: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  statusText: {
    fontSize: 14,
    color: '#111827',
  },
  verificationStatusContainer: {
    marginTop: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  verificationStatusText: {
    color: '#111827',
    fontSize: 14,
  },
});

export default AuthScreen;