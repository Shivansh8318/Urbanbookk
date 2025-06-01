from django.db import models

class Student(models.Model):
    user_id = models.CharField(max_length=255, unique=True, default='default_user_id')
    identity_type = models.CharField(max_length=50, default='default_identity_type')
    identity_value = models.CharField(max_length=255, default='default_identity_value')
    name = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)
    gender = models.CharField(max_length=10, choices=(('male', 'Male'), ('female', 'Female'), ('other', 'Other')), null=True, blank=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    grade = models.CharField(max_length=20, null=True, blank=True)
    school = models.CharField(max_length=255, null=True, blank=True)
    
    def __str__(self):
        return f"Student: {self.name or self.identity_value}"