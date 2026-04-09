# 🏛️ Government Internship Portal — Setup Guide

## 📁 Folder Structure
```
your-project/
│
├── server.js          ← The backend server (you run this)
├── package.json       ← Lists all packages needed
│
└── public/            ← Put ALL your HTML files here
    ├── Login.html
    ├── Registration.html
    ├── Successful_reg.html
    ├── cs.html
    ├── eee.html
    ├── aiml.html
    ├── mech.html
    ├── aero.html
    ├── science.html
    └── image1.jpg, image2.png ... (your images)
```

---

## 🚀 How to Run (Step by Step)

### Step 1 — Install Node.js
- Go to https://nodejs.org
- Download and install the **LTS** version
- Open terminal and check: `node --version`

### Step 2 — Install MongoDB
- Go to https://www.mongodb.com/try/download/community
- Download and install **MongoDB Community Edition**
- Start MongoDB (it runs in the background automatically after install)

### Step 3 — Set up the project
Open a terminal in your project folder and run:
```bash
npm install
```
This reads package.json and installs all required packages (express, mongoose, etc.)

### Step 4 — Add your HTML files
Copy all your HTML files (Login.html, Registration.html, etc.) into the `public/` folder.

### Step 5 — Start the server
```bash
node server.js
```
You should see:
```
✅ Connected to MongoDB successfully!
🚀 Server running at http://localhost:3000
```

### Step 6 — Open the portal
Open your browser and go to:
```
http://localhost:3000/Login.html
```

---

## 🔌 API Endpoints Reference

| Method | URL | What it does |
|--------|-----|--------------|
| GET | /api/health | Check if server is running |
| POST | /api/register | Register a new student |
| POST | /api/login | Login a student |
| POST | /api/apply | Submit an internship application |
| GET | /api/status/:userId | Get a student's application status |
| GET | /api/admin/applications | Get all applications (admin) |
| PATCH | /api/admin/review/:id | Approve or reject an application |
| GET | /api/admin/users | Get all registered users (admin) |

---

## ❓ Common Issues

**"Cannot connect to server"**
→ Make sure you ran `node server.js` in the terminal

**"MongoDB connection error"**
→ Make sure MongoDB is installed and running

**"npm not found"**
→ Node.js wasn't installed properly — reinstall from nodejs.org

---

## 📚 What Each File Does

| File | Purpose |
|------|---------|
| `server.js` | The backend brain — handles all requests |
| `package.json` | Lists all packages the project needs |
| `public/Login.html` | Login page (now talks to backend) |
| `public/Registration.html` | Registration page (now talks to backend) |
