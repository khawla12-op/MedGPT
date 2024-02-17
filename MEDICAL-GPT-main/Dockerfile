FROM python:3.10.7-alpine

# Prevents writing the pyc files
# Removes output stream buffering, allowing for more efficient logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8


ENV PROJECT_DIR /MEDICAL-GPT-main


WORKDIR ${PROJECT_DIR}

COPY ./requirements.txt .
RUN pip install -r requirements.txt --no-cache-dir

# Not running any migration command
# Since we do not have anything at this point
COPY . . 

EXPOSE 8080

# Run the application
CMD python manage.py runserver 0.0.0.0:80