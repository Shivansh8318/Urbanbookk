export const fetchProfile = async (userId) => {
  const baseUrl = 'https://urbanbookk-1.onrender.com/api/';
  const response = await fetch(`${baseUrl}teacher/get-profile/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: userId }),
  });
  return await response.json();
};