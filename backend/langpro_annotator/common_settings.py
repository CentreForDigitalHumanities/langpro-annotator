INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "livereload",
    "django.contrib.staticfiles",
    "rest_framework",
    "django.contrib.sites",
    "rest_framework.authtoken",
    "dj_rest_auth",
    "dj_rest_auth.registration",
    "allauth",
    "allauth.account",
    # Required for deleting accounts, but not actually used,
    # cf. https://github.com/iMerica/dj-rest-auth/pull/110.
    "allauth.socialaccount",
    "user",
    "revproxy",
    "problem",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
]

# Internationalization
# https://docs.djangoproject.com/en/3.0/topics/i18n/
LANGUAGES = [
    ("en", "English"),
    ("nl", "Nederlands"),
]
LANGUAGE_CODE = "en"

TIME_ZONE = "Europe/Amsterdam"

USE_I18N = True

USE_TZ = True  # Authentication
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ]
}

AUTH_USER_MODEL = "user.User"
ACCOUNT_EMAIL_VERIFICATION = "mandatory"
ACCOUNT_SIGNUP_FIELDS = ["email*", "username*", "password1*", "password2*"]

SITE_ID = 1
SITE_NAME = "langpro_annotator"

# Remove this setting in production!
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

HOST = "localhost:8000"

REST_AUTH = {
    "USER_DETAILS_SERIALIZER": "user.serializers.CustomUserDetailsSerializer",
}

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {message}",
            "style": "{",
        },
        "simple": {
            "format": "{levelname} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "level": "INFO",
            "class": "logging.StreamHandler",
            "formatter": "simple",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        "LangProAnnotator": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
    },
}
