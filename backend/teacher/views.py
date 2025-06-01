from django.shortcuts import render
import json
import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Teacher

class ValidateTokenView(APIView):
    """
    API view for validating OTPless tokens and directing teachers.
    """
    
    def post(self, request):
        try:
            token = request.data.get('token')
            if not token:
                return Response(
                    {'success': False, 'message': 'Token is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            validation_url = 'https://user-auth.otpless.app/auth/v1/validate/token'
            
            headers = {
                'Content-Type': 'application/json',
                'clientId': settings.OTPLESS_CLIENT_ID,
                'clientSecret': settings.OTPLESS_CLIENT_SECRET
            }
            
            data = {
                'token': token
            }
            
            try:
                response = requests.post(
                    validation_url,
                    headers=headers,
                    data=json.dumps(data),
                    timeout=10
                )
                
                if response.status_code == 200:
                    otpless_data = response.json()
                    user_id = otpless_data.get('userId')
                    teacher_exists = Teacher.objects.filter(user_id=user_id).exists()
                    identities = otpless_data.get('identities', [])
                    identity = identities[0] if identities else {}
                    identity_type = identity.get('identityType', '')
                    identity_value = identity.get('identityValue', '')
                    name = identity.get('name', '')
                    
                    if not teacher_exists:
                        teacher = Teacher.objects.create(
                            user_id=user_id,
                            identity_type=identity_type,
                            identity_value=identity_value,
                            name=name
                        )
                        is_new_user = True
                    else:
                        teacher = Teacher.objects.get(user_id=user_id)
                        teacher.name = name or teacher.name
                        teacher.identity_type = identity_type or teacher.identity_type
                        teacher.identity_value = identity_value or teacher.identity_value
                        teacher.save()
                        is_new_user = not (teacher.gender and teacher.age)
                    
                    dashboard_route = 'TeacherDashboard'
                    
                    user_data = {
                        'success': True,
                        'message': 'Token verified successfully',
                        'user_id': user_id,
                        'name': teacher.name,
                        'identity_type': teacher.identity_type,
                        'identity_value': teacher.identity_value,
                        'dashboard_route': dashboard_route,
                        'is_new_user': is_new_user,
                        'identities': otpless_data.get('identities', []),
                        'timestamp': otpless_data.get('timestamp')
                    }
                    
                    return Response(user_data, status=status.HTTP_200_OK)
                else:
                    error_message = f"OTPless validation failed with status code: {response.status_code}"
                    try:
                        error_data = response.json()
                        error_message = error_data.get('message', error_message)
                    except:
                        pass
                    
                    return Response(
                        {'success': False, 'message': error_message},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                    
            except requests.exceptions.RequestException as e:
                return Response(
                    {'success': False, 'message': f'Error connecting to OTPless: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
        except Exception as e:
            return Response(
                {'success': False, 'message': f'Server error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UpdateProfileView(APIView):
    """
    API view for updating teacher profile details.
    """
    def post(self, request):
        try:
            teacher = Teacher.objects.get(user_id=request.data.get('user_id'))
            teacher.name = request.data.get('name', teacher.name)
            teacher.gender = request.data.get('gender', teacher.gender)
            teacher.age = request.data.get('age', teacher.age)
            teacher.subject = request.data.get('subject', teacher.subject)
            teacher.experience_years = request.data.get('experience_years', teacher.experience_years)
            teacher.save()
            
            return Response(
                {'success': True, 'message': 'Profile updated successfully'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'success': False, 'message': f'Error updating profile: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class GetProfileView(APIView):
    """
    API view for retrieving teacher profile details.
    """
    def post(self, request):
        try:
            teacher = Teacher.objects.get(user_id=request.data.get('user_id'))
            profile_data = {
                'name': teacher.name,
                'gender': teacher.gender,
                'age': teacher.age,
                'subject': teacher.subject,
                'experience_years': teacher.experience_years,
            }
            return Response(profile_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'success': False, 'message': f'Error retrieving profile: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ListTeachersView(APIView):
    def get(self, request):
        teachers = Teacher.objects.all()
        teacher_data = [
            {
                'user_id': teacher.user_id,
                'name': teacher.name,
                'subject': teacher.subject,
            }
            for teacher in teachers
        ]
        return Response(teacher_data, status=status.HTTP_200_OK)