# 🩸 Blood Emergency Platform

A modern, full-stack Blood Emergency Platform built using **React.js**, **Django REST Framework**, and **MySQL** to connect blood donors with receivers during emergencies. The platform enables secure authentication, blood request management, donor discovery, donation camp management, notifications, analytics, and an admin dashboard.



## 📌 Project Overview

The Blood Emergency Platform helps hospitals, patients, and voluntary blood donors connect quickly during emergencies.

Users can register as either a **Donor** or **Receiver**, manage their profiles, create emergency blood requests, search nearby compatible donors, receive notifications, participate in blood donation camps, and monitor donation history through an interactive dashboard.


# 🚀 Features

## 👤 Authentication

- User Registration
- Login & Logout
- JWT Authentication
- OTP Verification
- Forgot Password
- Reset Password
- Role Based Authentication
- Secure REST APIs


## ❤️ Donor Module

- Donor Registration
- Donor Profile Management
- Blood Group Details
- Availability Toggle
- Blood Report Upload
- Donation History
- Nearby Donor Search
- Profile Picture Upload

## 🏥 Receiver Module

- Receiver Profile
- Hospital Information
- Patient Details
- Blood Requirement
- Emergency Level
- Track Blood Requests
- Contact Donors

## 🩸 Blood Request Module

- Create Blood Request
- Accept Request
- Reject Request
- Cancel Request
- Complete Request
- Request Timeline
- Request History
- Live Status Tracking

## 🔔 Notification Module

- Request Notifications
- Emergency Alerts
- Camp Notifications
- Read/Unread Notifications
- Delete Notifications

## 🗺️ Maps Module

- Current Location
- Nearby Donors
- OpenStreetMap Integration
- Distance Calculation
- Donor Location Markers

## 🏕 Donation Camp Module

- View Upcoming Camps
- Register for Camps
- QR Code Registration
- QR Check-In
- Attendance Tracking

## 📊 Reports & Analytics

- Blood Group Statistics
- Monthly Donations
- Emergency Requests
- Donation Reports
- Camp Reports
- CSV Export
- Dashboard Charts

## 👨‍💼 Admin Panel

- Manage Users
- Manage Donors
- Manage Receivers
- Manage Blood Requests
- Manage Camps
- View Reports
- Dashboard Analytics
- System Monitoring

# 🛠 Tech Stack

## Frontend

- React.js (Vite)
- React Router
- Bootstrap 5
- Axios
- React Leaflet
- Chart.js
- React Icons

## Backend

- Python
- Django
- Django REST Framework
- JWT Authentication (SimpleJWT)

## Database

- MySQL (Production)
- SQLite (Development)

## Tools

- Git
- GitHub
- VS Code
- Postman

# 📂 Project Structure

```
Blood-Emergency-Platform
│
├── backend
│   ├── accounts
│   ├── donor
│   ├── receiver
│   ├── requests
│   ├── notification
│   ├── reports
│   ├── camp
│   ├── core
│   ├── media
│   ├── manage.py
│   └── requirements.txt
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── context
│   │   ├── services
│   │   ├── assets
│   │   ├── hooks
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── .gitignore


# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/jaybhuva31/Blood-Emergency-Platform.git
```

```bash
cd Blood-Emergency-Platform
```


# Backend Setup

Create Virtual Environment

```bash
python -m venv venv
```

Activate

### Windows

```bash
venv\Scripts\activate
```

### Linux / Mac

```bash
source venv/bin/activate
```

Install Dependencies

```bash
pip install -r requirements.txt
```

Run Migrations

```bash
python manage.py makemigrations

python manage.py migrate
```

Create Superuser

```bash
python manage.py createsuperuser
```


Run Server

```bash
python manage.py runserver
```

---

# Frontend Setup

Navigate to frontend

```bash
cd frontend
```

Install Packages

```bash
npm install
```

Run React

```bash
npm run dev
```

---

# API Base URL

```
http://127.0.0.1:8000/api/
```

---

# Main Modules

- Authentication
- Donor Management
- Receiver Management
- Blood Requests
- Notifications
- Maps
- Donation Camps
- Reports
- Dashboard
- Admin Panel

---

# REST APIs

### Authentication

- Register
- Login
- Verify OTP
- Forgot Password
- Reset Password

### Donor

- Create Profile
- Update Profile
- Availability
- Donation History
- Nearby Donors

### Receiver

- Create Profile
- Update Profile
- Blood Requests

### Requests

- Create
- Accept
- Reject
- Complete
- Cancel

### Notification

- Get Notifications
- Mark Read
- Delete

### Camp

- Camp List
- Register
- QR Check-In

### Reports

- Dashboard Analytics
- CSV Export

---

# Future Enhancements

- SMS Notifications
- Email Alerts
- AI-Based Donor Recommendation
- Hospital Integration
- Mobile Application
- Live Blood Bank Inventory
- Multi-Language Support
- Cloud Deployment
- Digital Donation Certificates

---


# Contributors

### 👨‍💻 Jay Bhuva

Computer Engineering Student

Lok Jagruti Institute of Engineering & Technology (LJIET)

Ahmedabad, Gujarat, India

GitHub:
https://github.com/jaybhuva31

---

# License

This project is developed for educational purposes as a Semester 4 Full Stack & Python (Django REST Framework) academic project.

---

# ⭐ Support

If you found this project useful, please consider giving it a ⭐ on GitHub.

Happy Coding! 🚀
