# OVPA Daily Time Record (DTR) App

A modern, mobile-first Daily Time Record application for the Office of the Vice President for Administration (OVPA), featuring geolocation tagging, webcam capture, and administrative dashboards.

## Features

- **Mobile-First Design:** Optimized for mobile devices with a responsive UI.
- **Time Tracking:** Clock In/Out with mandatory Geolocation and Photo capture.
- **Dashboard:** Admin view for monitoring logs, filtering by office/date, and generating DTR PDFs.
- **PDF Generation:** Automated Civil Service Form No. 48 generation.
- **Security:** Role-based access (User vs Admin).

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Django Rest Framework
- **Database:** SQLite (Default)

## Setup Instructions

### Backend (Django)

1.  Navigate to `server` directory:
    ```bash
    cd server
    ```
2.  Create and activate virtual environment:
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # Linux/Mac
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run migrations:
    ```bash
    python manage.py migrate
    ```
5.  Start server (0.0.0.0 for mobile access):
    ```bash
    python manage.py runserver 0.0.0.0:8000
    ```

### Frontend (React)

1.  Navigate to `client` directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start development server (HTTPS enabled for mobile camera):
    ```bash
    npm run dev -- --host
    ```
    - Access via `https://<YOUR_IP>:5174`
    - Accept the self-signed certificate warning to enable camera/location.

## License

Private Repository for OVPA.
