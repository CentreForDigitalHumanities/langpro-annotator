#!/bin/sh

# Exit if any command ends with a non-zero status.
set -e

echo "Running migrations..."

python manage.py migrate

echo "Migrations applied successfully. Starting Gunicorn server..."

exec gunicorn langpro_annotator.wsgi:application \
    -w 4 \
    -b 0.0.0.0:8000 \
    --timeout 600 \
    --access-logfile /usr/src/app/logs/access_log \
    --error-logfile /usr/src/app/logs/error_log \
    --capture-output
