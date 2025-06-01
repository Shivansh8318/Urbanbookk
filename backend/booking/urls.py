from django.urls import path
from .views import GetTeacherSlotsView, GetStudentBookingsView

urlpatterns = [
    path('get-teacher-slots/', GetTeacherSlotsView.as_view(), name='get-teacher-slots'),
    path('get-student-bookings/', GetStudentBookingsView.as_view(), name='get-student-bookings'),
]