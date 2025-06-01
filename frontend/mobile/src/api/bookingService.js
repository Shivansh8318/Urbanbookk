export const fetchAllSlots = async (teacherId) => {
  const timestamp = new Date().getTime();
  const randomParam = Math.floor(Math.random() * 100000);
  const response = await fetch(
    `https://2d30-45-118-158-197.ngrok-free.app/api/booking/get-teacher-slots/?t=${timestamp}&r=${randomParam}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      body: JSON.stringify({
        teacher_id: teacherId,
        limit: 500,
        include_all: true,
      }),
    }
  );
  const data = await response.json();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return [...data]
    .filter(slot => !slot.is_booked && new Date(slot.date) >= now)
    .sort((a, b) => {
      const dateComparison = new Date(a.date) - new Date(b.date);
      if (dateComparison !== 0) return dateComparison;
      return a.start_time.localeCompare(b.start_time);
    });
};

export const fetchAvailableSlots = async (teacherId, date) => {
  const dateStr = date.toISOString().split('T')[0];
  const timestamp = new Date().getTime();
  const response = await fetch(
    `https://2d30-45-118-158-197.ngrok-free.app/api/booking/get-teacher-slots/?t=${timestamp}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      body: JSON.stringify({
        teacher_id: teacherId,
        date: dateStr,
        limit: 500,
      }),
    }
  );
  const data = await response.json();
  return data
    .filter(slot => !slot.is_booked)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
};

export const fetchBookedClasses = async (studentId) => {
  const response = await fetch(
    'https://2d30-45-118-158-197.ngrok-free.app/api/booking/get-student-bookings/',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ student_id: studentId }),
    }
  );
  return await response.json();
};

export const fetchTeacherSlots = async (teacherId) => {
  const timestamp = new Date().getTime();
  const response = await fetch(
    `https://2d30-45-118-158-197.ngrok-free.app/api/booking/get-teacher-slots/?t=${timestamp}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({
        teacher_id: teacherId,
        limit: 100,
      }),
    }
  );
  const data = await response.json();
  return [...data].sort((a, b) => {
    const dateComparison = new Date(a.date) - new Date(b.date);
    if (dateComparison !== 0) return dateComparison;
    return a.start_time.localeCompare(b.start_time);
  });
};

export const fetchTeachers = async () => {
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(
      `https://2d30-45-118-158-197.ngrok-free.app/api/teacher/list-teachers/?t=${timestamp}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch teachers: ${response.status}`);
    }

    const data = await response.json();
    console.log('Fetched teachers:', data); // Debug log
    return data; // Return the data to the caller
  } catch (error) {
    console.error('Error fetching teachers:', error.message);
    throw error; // Throw the error to be handled by the caller
  }
};