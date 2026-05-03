# 🌿 Ceylon Spices - Product Export Management System

![License](https://img.shields.io/badge/License-ISC-blue.svg)
![React Native](https://img.shields.io/badge/Frontend-React%20Native%20%2F%20Expo-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2F%20Express-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)

A professional, full-stack mobile application designed to streamline the international export of premium Ceylon spices. The system manages the entire lifecycle from product cataloging and client ordering to logistics tracking and secure document management.

---

## 🏛️ Project Architecture
The system follows a **3-Tier Architecture**:
*   **Frontend:** React Native (Expo) for a premium mobile experience.
*   **Backend:** RESTful API built with Node.js and Express.
*   **Database:** MongoDB for flexible, high-performance data storage.
*   **Storage:** Cloudinary for secure cloud hosting of images and PDFs.

---

## ✨ Key Features

### 🔐 Role-Based Access Control (RBAC)
*   **Admin:** Full system control, analytics, and user management.
*   **Staff:** Inventory management, order approval, and logistics updates.
*   **Client:** Product browsing, order placement, and real-time tracking.

### 📦 Core Modules
*   **Inventory Management:** Real-time spice catalog with stock level monitoring.
*   **Order Lifecycle:** Complete workflow from "Pending" to "Delivered".
*   **Logistics Tracking:** Milestone-based tracking for international shipments.
*   **Secure Payments:** Bank transfer verification with digital receipt uploads.
*   **Digital Vault:** Secure storage for regulatory export documents (Invoices, Licenses).

---

## 🛠️ Technology Stack
*   **Frontend:** React Native, Expo, React Native Paper, Axios.
*   **Backend:** Node.js, Express.js, Mongoose.
*   **Security:** JWT (JSON Web Tokens), Bcrypt.js.
*   **Cloud Services:** Cloudinary (Media), Railway (Deployment), MongoDB Atlas.

---

## 🚀 Installation & Setup

### 🟢 Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file and add your credentials:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_atlas_url
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=30d
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```
4. Start the server: `npm start`

### 🔵 Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Update the `API_URL` in your environment config.
4. Start the app: `npx expo start`

---

## 👥 Team Responsibilities

| Name | Responsibility |
| :--- | :--- |
| **Member 01** | Product & Inventory Management |
| **Member 02** | Order Management & Analytics |
| **Member 03** | Shipment & Logistics Tracking |
| **Member 04** | Client & User Management |
| **Member 05** | Payment & Invoice Management |
| **Member 06** | Digital Document Repository |

---

## 📄 License
This project is licensed under the **ISC License**.

---

Developed for **Ceylon Spices Export Management**. 🌶️🌍🚀
