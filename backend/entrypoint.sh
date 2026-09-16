#!/bin/sh

# Exit if any command ends with a non-zero status.
set -e

echo "Running system check..."
python manage.py check

echo "Applying migrations..."
python manage.py migrate

if [ "$DJANGO_DEBUG" = "1" ]; then
    echo "Django debug mode is enabled. Starting development server..."
    exec python manage.py runserver 0.0.0.0:8000
else
    echo "Starting Gunicorn server..."
    exec gunicorn langpro_annotator.wsgi:application \
        -w 4 \
        -b 0.0.0.0:8000 \
        --timeout 600 \
        --access-logfile /usr/src/app/logs/access_log \
        --error-logfile /usr/src/app/logs/error_log \
        --capture-output

fi
