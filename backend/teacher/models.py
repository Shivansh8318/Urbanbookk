from django.db import models

class Teacher(models.Model):
    user_id = models.CharField(max_length=255, unique=True, default='default_user_id')
    identity_type = models.CharField(max_length=50, default='default_identity_type')
    identity_value = models.CharField(max_length=255, default='default_identity_value')
    name = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)
    gender = models.CharField(max_length=10, choices=(('male', 'Male'), ('female', 'Female'), ('other', 'Other')), null=True, blank=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    subject = models.CharField(max_length=100, null=True, blank=True)
    experience_years = models.PositiveIntegerField(default=0)
    
    def __str__(self):
        return f"Teacher: {self.name or self.identity_value}"