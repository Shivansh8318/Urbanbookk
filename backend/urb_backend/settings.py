"""
Django settings for urb_backend project.

Generated by 'django-admin startproject' using Django 4.2.7.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""

from pathlib import Path
import dj_database_url
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "django-insecure-mfz%25l6kkl6q%r4zgfu0-azx((qq@ouyz60er$^l%f5kqz7^m"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True  # Set to False in production

# Allow requests from your local network and React Native app
ALLOWED_HOSTS = ['*', '172.20.10.3', 'localhost', '127.0.0.1', '10.0.2.2']  # Include emulator IP (10.0.2.2 for Android Emulator)

# OTPless API credentials
OTPLESS_CLIENT_ID = "UGLIQUQICEM293V28ERAL5V6SRIUTQK4"
OTPLESS_CLIENT_SECRET = "pkt08lintnunsuvznlkpvjs3gu0cnr7l"

# Razorpay Settings
RAZORPAY_KEY_ID = 'rzp_test_e2MT5ljjbnbMkc'
RAZORPAY_KEY_SECRET = 'gknO5gROIU98k1OKebtIpQqD'

# Application definition
INSTALLED_APPS = [
    'daphne',
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party apps
    'channels',
    "rest_framework",
    "corsheaders",  # Added for CORS support
    # Custom apps
    'booking',
    'payment',
    'student',
    'teacher',
]

MIDDLEWARE = [
   
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",  # Added CORS middleware (must be before CommonMiddleware)
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "urb_backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "urb_backend.wsgi.application"
# Channels settings
ASGI_APPLICATION = 'urb_backend.asgi.application'

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": ["rediss://:ATABAAIjcDFiOTZiNTU4ODFiNWQ0ZmRjYWQ0YTRkZDAyMTlkNzY1NXAxMA@legal-stag-12289.upstash.io:6379/0"],
        },
    },
}

# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases
DATABASES = {
    'default': dj_database_url.parse(
        'postgresql://neondb_owner:npg_E9neg5YtcqFh@ep-muddy-bar-a4xl6dli-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
    )
}

# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/
STATIC_URL = "static/"
STATIC_ROOT = os.path.join(BASE_DIR, 'static')  # For serving static files in production

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost",
    "http://127.0.0.1",
    "https://7cc4-2409-40e3-318a-b056-9914-eafc-111b-89ba.ngrok-free.app",  # Your local IP and port
    "http://10.0.2.2:8000",    # Android Emulator host
    # Add other origins if needed (e.g., your app's IP or domain)
]
CORS_ALLOW_ALL_ORIGINS = True  # Allow all origins for development; disable in production

# Logging for debugging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'DEBUG',  # Set to DEBUG for development
        },
    },
}

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"