export const fetchProfile = async (userId) => {
  const baseUrl = 'https://urbanbookk-1.onrender.com/api/';
  const response = await fetch(`${baseUrl}student/get-profile/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: userId }),
  });
  return await response.json();
};

export const fetchTeachers = async () => {
  const response = await fetch(
    'https://urbanbookk-1.onrender.com/api/teacher/list-teachers/',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return await response.json();
};