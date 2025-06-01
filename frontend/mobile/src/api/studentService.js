export const fetchProfile = async (userId) => {
  const baseUrl = 'https://2d30-45-118-158-197.ngrok-free.app/api/';
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
    'https://2d30-45-118-158-197.ngrok-free.app/api/teacher/list-teachers/',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return await response.json();
};