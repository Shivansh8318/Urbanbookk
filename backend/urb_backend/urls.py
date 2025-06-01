from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/student/", include("student.urls")),
    path("api/teacher/", include("teacher.urls")),
    path("api/booking/", include("booking.urls")),
    path("api/payment/", include("payment.urls")),
]