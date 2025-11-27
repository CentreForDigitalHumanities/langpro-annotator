FROM python:3.11

WORKDIR /usr/src/app/backend
COPY requirements.txt .
RUN pip install -U pip pip-tools && pip-sync

COPY . .

CMD python manage.py check && \
    python manage.py migrate && \
    python manage.py runserver --settings glue --pythonpath .. 0.0.0.0:8000
