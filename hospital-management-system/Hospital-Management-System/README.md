# CarePoint Hospital Management System

A college-level full-stack MERN hospital management application built with React, Vite, Express, Node.js, MongoDB, and Mongoose.

## Features
- Dashboard summary for patients, doctors, appointments, beds, and bills
- JWT registration/login with password hashing
- Role-aware navigation for admin, doctor, and receptionist roles
- CRUD management for patients, doctors, appointments, beds, medicines, and bills
- Search/filter for each management module
- Appointment status updates
- Bed occupancy status
- Medicine stock tracking
- Billing records and payment status
- Responsive dashboard layout

## Important
This is an educational/demo project. Do not use it to store real patient information or make clinical decisions. Use synthetic data only. The project is not configured for production security or healthcare compliance.

## Requirements
- Node.js 18+
- npm
- MongoDB local instance or MongoDB Atlas connection string

## Run locally

Open PowerShell in this folder.

1. Install dependencies:
   ```powershell
   npm install
   npm run install:all
   ```

2. Create the backend environment file:
   ```powershell
   Copy-Item server/.env.example server/.env
   ```
   Edit `server/.env` and set a strong `JWT_SECRET` and your `MONGODB_URI`.

3. (Optional) Load sample demo records:
   ```powershell
   npm run seed
   ```

4. Start the app:
   ```powershell
   npm run dev
   ```

Frontend: http://localhost:5173  
API health: http://localhost:5000/api/health

## Demo login
Register a new account through the app. The first account can select Admin for local demo purposes. In a real deployment, users must not be allowed to self-assign privileged roles.

## Folder structure
```text
Hospital-Management-System/
├── README.md
├── package.json
├── .gitignore
├── client/
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api.js
│       └── style.css
└── server/
    ├── package.json
    ├── .env.example
    ├── server.js
    ├── config/db.js
    ├── middleware/auth.js
    ├── models/
    ├── routes/
    └── scripts/seed.js
```

## Modules
- Patients: name, age, gender, phone, email, address, notes
- Doctors: name, specialization, phone, email, availability
- Appointments: patient, doctor, date/time, reason, status
- Beds: ward, bed number, type, status, patient
- Medicines: name, category, quantity, price, expiry date
- Bills: patient, description, amount, payment status, due date

## API overview
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/dashboard`
- `GET|POST /api/patients`
- `GET|POST /api/doctors`
- `GET|POST /api/appointments`
- `GET|POST /api/beds`
- `GET|POST /api/medicines`
- `GET|POST /api/bills`
- Each resource also supports `PUT /api/:resource/:id` and `DELETE /api/:resource/:id`.

All resource routes require a valid bearer token.
