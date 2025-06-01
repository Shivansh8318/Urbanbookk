from django.db import models
from teacher.models import Teacher
from student.models import Student

class AvailabilitySlot(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='availability_slots')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_booked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.teacher.name} - {self.date} {self.start_time}-{self.end_time}"

class Booking(models.Model):
    slot = models.ForeignKey(AvailabilitySlot, on_delete=models.CASCADE, related_name='bookings')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='bookings')
    created_at = models.DateTimeField(auto_now_add=True)
    payment_status = models.BooleanField(default=False)
    status = models.CharField(
        max_length=20,
        choices=(('pending', 'Pending'), ('confirmed', 'Confirmed'), ('canceled', 'Canceled')),
        default='pending'
    )

    def __str__(self):
        return f"Booking by {self.student.name} for {self.slot}"