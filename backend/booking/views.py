from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import AvailabilitySlot, Booking
from django.utils import timezone
from teacher.models import Teacher  # Import Teacher model
from student.models import Student

class GetTeacherSlotsView(APIView):
    def post(self, request):
        teacher_user_id = request.data.get('teacher_id')
        if not teacher_user_id:
            return Response({'error': 'teacher_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            teacher = Teacher.objects.get(user_id=teacher_user_id)
            slots = AvailabilitySlot.objects.filter(
                teacher=teacher,  # Use the teacher object directly
                date__gte=timezone.now().date()
            )
            slots_data = [
                {
                    'id': slot.id,
                    'date': str(slot.date),
                    'start_time': str(slot.start_time),
                    'end_time': str(slot.end_time),
                    'is_booked': slot.is_booked,
                }
                for slot in slots
            ]
            return Response(slots_data, status=status.HTTP_200_OK)
        except Teacher.DoesNotExist:
            return Response({'error': 'Teacher not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GetStudentBookingsView(APIView):
    def post(self, request):
        student_user_id = request.data.get('student_id')
        if not student_user_id:
            return Response({'error': 'student_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            student = Student.objects.get(user_id=student_user_id)
            bookings = Booking.objects.filter(
                student=student,  # Use the student object directly
                slot__date__gte=timezone.now().date()
            )
            bookings_data = [
                {
                    'id': booking.id,
                    'slot_id': booking.slot.id,
                    'teacher_name': booking.slot.teacher.name,
                    'date': str(booking.slot.date),
                    'start_time': str(booking.slot.start_time),
                    'end_time': str(booking.slot.end_time),
                    'status': booking.status,
                }
                for booking in bookings
            ]
            return Response(bookings_data, status=status.HTTP_200_OK)
        except Student.DoesNotExist:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)