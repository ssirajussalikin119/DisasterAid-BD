# 🌊 DisasterAid BD

A centralized disaster management platform for Bangladesh that helps citizens report disasters, request relief, and connect with verified volunteers, doctors, NGOs, and administrators.

---

## 📖 Project Overview

Bangladesh frequently faces seasonal disasters such as floods, waterlogging, heatwaves, cold waves, and disease outbreaks. Information regarding affected areas, relief requirements, and volunteer coordination is often scattered and inefficient.

**DisasterAid BD** aims to provide a centralized digital platform where:

- Citizens can report disaster incidents.
- Victims can request relief assistance.
- Volunteers and health workers can respond to verified incidents.
- NGOs and administrators can coordinate relief operations efficiently.

---

## 🎯 Objective

The primary objective of this project is to improve disaster response and relief coordination by providing:

- Centralized disaster reporting
- Damage assessment
- Relief request management
- Volunteer coordination
- NGO inventory management
- Administrative monitoring
- AI-assisted disaster classification

---

# 👥 Target Users

- Citizens
- Volunteers
- Doctors & Health Workers
- NGOs
- Administrators

---

# 🚀 Features

## 🔐 Authentication

- JWT Authentication
- Role-based Access Control

Supported Roles:

- Citizen
- Volunteer
- Doctor / Health Worker
- Admin / NGO

---

## 📍 Disaster Report Management

Citizens can:

- Submit disaster reports
- Upload images
- Provide location details
- Track report status

Status Flow:

```
Pending → Verified → In Progress → Resolved
```

---

## 🏚 Damage Assessment

Users can report:

- House damage
- Crop loss
- Livestock loss
- Business damage

---

## 🎁 Relief Request System

Citizens can request:

- Medicine
- Dry Food
- Clothes
- Drinking Water
- Shelter Materials
- Cash Support

---

## ✅ Verification System

Every submitted report is verified before action is taken.

Verification Flow:

```
Unverified
      ↓
Under Review
      ↓
Verified / Rejected
```

---

## 📦 Relief Inventory Management

NGOs can manage:

- Food stock
- Medicine stock
- Clothing
- Emergency supplies

---

## 🙋 Volunteer Assignment

Volunteers can

- Apply for verified incidents
- Receive assignments
- Track assigned tasks

---

## 🛠 Admin Dashboard

Admin Features:

- User Management
- Report Verification
- Relief Request Moderation
- Inventory Monitoring
- Volunteer Assignment
- Analytics Dashboard
- Emergency Broadcast System

---

## 🤖 AI Features

- Automatic Disaster Category Detection
- Severity Prediction
- AI Chatbot Support

---

# 🖥 Tech Stack

| Technology | Used |
|------------|------|
| Frontend | React |
| Backend | Laravel |
| Database | MySQL |
| Authentication | JWT |
| Styling | Tailwind CSS |
| Deployment | VPS + Nginx |
| Containerization | Docker |
| Rendering | Client Side Rendering (CSR) |

---

# 📂 Project Structure

```
DisasterAid-BD/
│
├── frontend/
│   ├── React
│   └── Tailwind CSS
│
├── backend/
│   └── Laravel
│
└── database/
    └── MySQL
```

---

# 📌 Major Modules

- Authentication
- Report Management
- Damage Assessment
- Relief Requests
- Verification System
- Relief Inventory
- Volunteer Assignment
- Admin Dashboard
- AI Classification
- AI Chatbot

---

# 🔄 Report Workflow

```
Citizen
    │
    ▼
Submit Report
    │
    ▼
Verification
    │
    ▼
Admin Review
    │
    ▼
Volunteer Assignment
    │
    ▼
Relief Distribution
    │
    ▼
Resolved
```

---

# 📡 Sample API Endpoints

```
POST /api/reports

GET /api/reports

PUT /api/reports/{id}/status

POST /api/reports/{id}/verify

POST /api/damage-assessment

POST /api/relief-requests

POST /api/inventory

POST /api/volunteers/apply

GET /api/admin/dashboard/summary
```

---

# 🛠 Installation

## Clone Repository

```bash
git clone https://github.com/ssirajussalikin119/DisasterAid-BD.git
```

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Backend

```bash
cd backend
composer install
php artisan serve
```

---

# 📸 Screens

- Home Page
- Login
- Registration
- Incident List
- Volunteer Dashboard
- NGO Dashboard
- Admin Dashboard

---

# 🌍 Future Improvements

- Real-time Notifications
- GIS & Interactive Maps
- Mobile Application
- SMS Alerts
- AI-powered Damage Detection
- Weather API Integration

---

# 👨‍💻 Team Members

| Roll | Role |
|------|------|
| 20230204119 | Team Lead & Full Stack Developer |
| 20230204098 | Frontend Developer |
| 20230204094 | Backend Developer |

---

# 📄 License

This project was developed as an academic software engineering project.

---

## ⭐ Acknowledgement

Developed for academic purposes to improve disaster response, relief management, and volunteer coordination in Bangladesh.
