"""
Django settings for auto_crm project.
Production-ready for Railway.
"""

import os
from pathlib import Path
import dj_database_url  # <-- Added for Railway Database

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# ==========================================
# SECURITY & PRODUCTION CONFIG
# ==========================================

# Pull secret key from env var in prod, use unsafe default locally
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-local-dev-key-change-me')

# Set DEBUG to False in production (default to True locally)
DEBUG = os.environ.get('DEBUG', 'True') == 'True'

# Railway handles routing, so we allow all hosts behind its load balancer
ALLOWED_HOSTS = ['*']


# ==========================================
# APPLICATION DEFINITION
# ==========================================

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third Party
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    
    # Local Apps
    'inventory',
    'sales',
    'service',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # <-- MUST BE HERE (Static Files)
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',       # <-- MUST BE HERE (React Connection)
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'auto_crm.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'auto_crm.wsgi.application'


# ==========================================
# DATABASE (Auto-Switching)
# ==========================================
# If DATABASE_URL env var exists (Railway), use it.
# Otherwise, default to local SQLite.

DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///db.sqlite3',
        conn_max_age=600
    )
}


# ==========================================
# PASSWORD VALIDATION
# ==========================================

AUTH_PASSWORD_VALIDATORS = [
    { 'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator', },
]


# ==========================================
# CORS (Allow Frontend)
# ==========================================

# In production, we read the specific frontend URL from Railway variables.
# Locally, we default to localhost.
CORS_ALLOWED_ORIGINS = os.environ.get(
    'CORS_ALLOWED_ORIGINS', 
    'http://localhost:5173'
).split(',')

CSRF_TRUSTED_ORIGINS = os.environ.get(
    'CSRF_TRUSTED_ORIGINS', 
    'http://localhost:5173'
).split(',')

# Optional: If you face persistent CORS issues during initial deployment,
# uncomment this line temporarily to allow all domains.
# CORS_ALLOW_ALL_ORIGINS = True  


# ==========================================
# INTERNATIONALIZATION
# ==========================================

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# ==========================================
# STATIC & MEDIA FILES
# ==========================================

# CSS/JS for Admin Panel
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Use WhiteNoise to serve static files in production
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media Files (User Uploads / License Plates)
# WARNING: On Railway these delete on restart unless using S3
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')


# ==========================================
# REST FRAMEWORK
# ==========================================

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny', 
    ],
}