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

- JWT Authentication (OTP sign-in via Bangladesh phone number)
- Silent token refresh: `POST /api/auth/refresh` exchanges an expired access
  token for a new one within the refresh window (default 14 days, revoked on
  logout). The axios client retries a failed request once after refreshing and
  only ends the session when the refresh itself fails with a server response —
  network errors never log the user out.
- Access-token lifetime is configured with `JWT_TTL` (default 60 minutes).
- Phone numbers are normalized to `+8801XXXXXXXX` (`01…`, `8801…`, `008801…`
  and spaced/dashed variants all map to the same account).
- OTP security: 5-minute expiry, 5 wrong-attempt lockout, 60-second per-phone
  resend cooldown (10/day), previous codes invalidated on resend, single use.
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

GET /api/admin/analytics/district-summary

GET /api/admin/analytics/overview
```

---

# 📊 District Disaster Summary VIEW

## PostgreSQL VIEW: `district_disaster_summary`

### Purpose

Provides a combined district-level disaster situation summary for the Admin
Dashboard in one reusable place, so Laravel/backend code does not repeat the
same complex aggregation queries. The VIEW is created by the migration
`database/migrations/2026_09_30_060000_create_district_disaster_summary_view.php`
(`CREATE OR REPLACE VIEW district_disaster_summary`) and dropped again by its
`down()` method (`DROP VIEW IF EXISTS district_disaster_summary`).

### Existing tables used

| Table | Contribution to the VIEW |
|-------|--------------------------|
| `incidents` | District dimension (`TRIM(district)`), `active_incidents`, `critical_incidents` |
| `reports` | `verified_reports`, joined through `reports.incident_id` |
| `relief_requests` | `pending_relief_requests`, joined through `relief_requests.incident_id` |
| `volunteers` + `users` | `active_volunteers`, matched on `volunteers.current_location` |
| `assignments` | `active_assignments`, joined through `assignments.incident_id` |

There is no `districts` table in this project: the dimension of the VIEW is the
set of distinct incident districts. Each metric is aggregated in its own CTE and
`LEFT JOIN`ed onto that dimension, so:

- districts with zero activity still appear with `0` counts,
- one-to-many joins can never inflate the counts (`COUNT(DISTINCT ...)` is used
  where multiple child rows can match).

### Metric definitions

- `active_incidents` – incidents with status `active`
- `critical_incidents` – incidents with severity `critical` that are not
  resolved (status `active` or `monitoring`)
- `verified_reports` – reports with status `verified` linked to an incident of
  the district
- `pending_relief_requests` – relief requests with status `pending` linked to an
  incident of the district
- `active_volunteers` – active, non-unavailable volunteers whose
  `current_location` starts with the district name
- `active_assignments` – assignments with status `pending`, `accepted` or
  `in_progress` for incidents of the district

### API endpoint

```
GET /api/admin/analytics/district-summary
```

Authentication: JWT. Authorization: `admin` role only (`AuthenticateJwt` +
`role:admin` middleware, same as the other admin endpoints). The controller
(`AdminAnalyticsController`) delegates to `AdminAnalyticsService`, which only
reads from the VIEW.

### Expected response fields

```json
{
  "success": true,
  "message": "District disaster summary retrieved successfully.",
  "data": {
    "districts": [
      {
        "district_id": 1,
        "district_name": "Sylhet",
        "active_incidents": 1,
        "critical_incidents": 0,
        "verified_reports": 1,
        "pending_relief_requests": 0,
        "active_volunteers": 1,
        "active_assignments": 2
      }
    ],
    "count": 4
  },
  "errors": null
}
```

`district_id` is a synthetic ordinal (`ROW_NUMBER()` ordered by district name)
because the project has no `districts` table; `district_name` is the stable
identifier. The **Admin Analytics page** (`/admin/analytics`) renders this data
in the *District Situation* bar chart and in the *District Situation — Full
Breakdown* table (both marked *PostgreSQL VIEW*). The Admin Dashboard keeps only
a *View full analytics* call-to-action that links to the Analytics page.

---

# 📈 Admin Analytics Page

## Route: `/admin/analytics`

Protected by `ProtectedRoute allowedRoles={['admin']}` on the frontend and by
`AuthenticateJwt` + `role:admin` on the backend. The sidebar *Analytics* entry
navigates here.

## Endpoints consumed

```
GET /api/admin/analytics/overview        → KPIs, severity, types, relief, volunteer activity
GET /api/admin/analytics/district-summary → district chart + district table (the VIEW)
```

Both routes live inside the `admin` prefix group in `routes/api.php` and go
through `AdminAnalyticsController` → `AdminAnalyticsService` → PostgreSQL.

## What each section shows (and where the data comes from)

| Section | Chart | Data source |
|---------|-------|-------------|
| Disaster Overview | 7 KPI tiles | one single-table count each: `incidents`, `reports`, `relief_requests`, `users`, `assignments` |
| District Situation | grouped bar chart (4 series) | VIEW `district_disaster_summary` |
| Incident Severity | donut with legend, % and tooltip | `incidents.severity` `GROUP BY` — only severity values that actually exist are returned (e.g. `low` never appears if no incident has it) |
| Disaster Types | horizontal bar list | derived from real `incidents.title` text (the schema has **no** type/category column); categories are classified with `LIKE` keywords in `AdminAnalyticsService::TYPE_CLASSIFICATION_SQL` and only categories that occur are returned |
| Relief Request Status | horizontal bar list | `relief_requests.status` `GROUP BY` — status chosen over urgency; empty state is shown while the table has no rows |
| Volunteer Activity | 6 KPI tiles + coverage note | `users` (role/role_status), `volunteers.current_location`, `assignments` |
| District Situation — Full Breakdown | table (totals row, horizontal scroll) | VIEW `district_disaster_summary` |

Every chart answers a question (printed on the card), shows units, a legend or
percentage and a hover tooltip. Loading, error (+ Retry) and empty states are
implemented for every data-backed section.

## Data-integrity notes (measured against the live database)

- **No join inflation**: each metric is aggregated in its own query/CTE with
  `COUNT(DISTINCT …)` where child rows can multiply — a naive
  `reports × relief_requests × assignments` join would have inflated the
  numbers.
- **Verified reports: platform total vs district rows**: the platform KPI counts
  every verified report (`3` at the time of writing), while district rows only
  count verified reports that are linked to an incident
  (`2` — one verified report has no `incident_id`, so no district can claim it).
  Both numbers are correct for their scope.
- **Volunteers: dashboard total (`11`) vs district rows (`3`)**: district-level
  volunteers are matched through `volunteers.current_location` and exclude
  `availability = 'unavailable'`. The gap is surfaced honestly on the Analytics
  page: `7` of `11` active volunteers have no location set (`5` empty
  `current_location` + `2` users without a `volunteers` profile) and `1`
  located volunteer is marked unavailable. The response therefore also returns
  `located_volunteers`, `unlocated_volunteers` and `district_view_volunteers`
  so the coverage can never be mistaken for a data loss.

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
