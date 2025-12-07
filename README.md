# 🎬 Streamflix  
A full-stack Netflix-style streaming platform built using **Node.js**, **Express**, **PostgreSQL**, and **vanilla JavaScript**.  
Streamflix features a modern, responsive UI inspired by Netflix — including hero banners, movie carousels, hover effects, favorites, and admin movie management.

---

## 🚀 Features

### 🔐 **Authentication**
- Secure **JWT-based login and registration**
- Password hashing with bcrypt
- Protected routes for user actions

### 🎞 **Movies & UI**
- Dynamic **Netflix-like home page**
- Hero banner based on featured movie
- Horizontal **scrollable carousels**
- Movie detail modal
- Add to Favorites
- Responsive layout for all screen sizes

### 🗄 **Database**
- PostgreSQL relational schema
- Tables for Users, Movies, Genres, Movie-Genres (many-to-many), Favorites
- Clean data model for streaming platforms

### 🛠 **Admin Tools**
- Upload and manage movies
- Local poster uploads in `/frontend/uploads/`
- Admin-only authorization

---

## 🔧 **Tech Stack**

**Frontend:**  
HTML5, CSS3, JavaScript (Vanilla)

**Backend:**  
Node.js, Express.js

**Database:**  
PostgreSQL

**Auth:**  
JWT, bcrypt

**Storage:**  
Local image hosting via Express (`/uploads`)

---

## 📸 Screenshots

### 🏠 Home Page
![Home Page](screenshots/home.png)

### 🎬 Login Page
![Movie Details](screenshots/login.png)

### 🔎 Browse Page
![Browse](screenshots/browse.png)

---

## 🛠 Setup & Installation

### 1️⃣ Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/streamflix.git
cd streamflix
```
### 2️⃣ Install dependencies
```npm install```

### 3️⃣ Create a .env file

(Not committed to GitHub for security.)
```
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/streamflix
JWT_SECRET=your-secret-key
PORT=4000
ADMIN_IDS=1
```
### 4️⃣ Setup the database

Run:
```
psql -U postgres -f db/schema.sql
psql -U postgres -f db/seed.sql
```
(Create DB manually if needed.)

### 5️⃣ Start the server
```npm run dev```
Backend will run on:
```
http://localhost:4000
```
Open the browser and Streamflix will load automatically.

---
