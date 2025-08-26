# 💸 Xpenso – Personal Expense Tracker App

**Xpenso** is a secure, minimal, and responsive personal expense tracking web application. Built using **Node.js**, **Express.js**, **MongoDB**, and **EJS**, it allows users to **register, login, logout, and manage their dashboard securely using JWT-based authentication**.

LINK : https://expense-tracker-znch.onrender.com

---

## ✅ Features

- 🔐 JWT Authentication (Login, Register, Logout)
- 🧑‍💼 User Dashboard with secure middleware protection
- 📁 Cookie-based login session tracking
- 🧠 MVC Architecture (Model, View, Controller)
- 🎨 Clean and responsive Bootstrap-based UI
- 📦 Organized folder structure for scalability

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js  
- **Frontend:** EJS, Bootstrap 5  
- **Database:** MongoDB with Mongoose  
- **Authentication:** JWT + Cookie  
- **Templating Engine:** EJS  

---

## 🚀 Installation & Setup

```bash
git clone https://github.com/MEHULsahu6/xpenso.git
cd xpenso
npm install
```

🔑 **Create a `.env` file** with:

```env
MONGO_URI=mongodb://127.0.0.1:27017/xpenso
JWT_SECRET=your_jwt_secret_key
```

▶️ **Run the app:**

```bash
nodemon app.js
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## 📂 Folder Structure

```
xpenso/
│
├── controller/
│   ├── auth.controller.js
│   └── dashboard.controller.js
│
├── middleware/
│   └── jwt.js
│
├── models/
│   └── user.model.js
│
├── routes/
│   ├── auth.routes.js
│   └── user.routes.js
│
├── views/
│   ├── auth/
│   ├── dashboard/
│   └── error.ejs
│
├── public/
│
├── app.js
└── .env
```

---

## 🙌 Contribution

Feel free to fork this repo, raise issues, or contribute new features!

---

## 🧠 Future Improvements

- Add expense categories & tracking
- Graphical analytics (charts)
- Email/password recovery
- Mobile responsiveness

