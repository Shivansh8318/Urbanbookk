export const verifyTokenWithBackend = async (token, role, setVerificationStatus) => {
  try {
    const baseUrl = 'https://urbanbookk-1.onrender.com/api/';
    const VERIFICATION_URL = role.toLowerCase() === 'student'
      ? `${baseUrl}student/validate-token/`
      : `${baseUrl}teacher/validate-token/`;
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
    return result;
  } catch (error) {
    setVerificationStatus(`Verification error: ${error.message || 'Unknown error'}`);
    console.error('Verification error:', error);
    throw error;
  }
};