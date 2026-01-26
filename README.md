# Authentication Platform - Full Stack

Complete authentication system with NestJS backend and React frontend, featuring Google Authenticator 2FA.

## 🚀 Features

- ✅ Modern dark blue UI design (like crypto exchange)
- ✅ User signup and login
- ✅ JWT authentication
- ✅ Google Authenticator 2FA
- ✅ User dashboard
- ✅ CRUD operations
- ✅ Swagger API documentation

---

## 📁 Project Structure

```
login and signup/
├── backend/          # NestJS API
│   ├── src/
│   ├── prisma/
│   └── README.md
├── frontend/         # React UI
│   ├── src/
│   └── README.md
└── README.md         # This file
```

---

## 🛠️ Quick Start

### Step 1: Install Backend

```powershell
cd "C:\Users\allen\Documents\login and signup\backend"
npm install
npx prisma generate
npx prisma db push
```

### Step 2: Install Frontend

```powershell
cd "C:\Users\allen\Documents\login and signup\frontend"
npm install
```

---

## ▶️ How to Run

### Option 1: Run Both Together (Recommended)

**Terminal 1 - Backend:**
```powershell
cd "C:\Users\allen\Documents\login and signup\backend"
npm run start:dev
```

**Terminal 2 - Frontend:**
```powershell
cd "C:\Users\allen\Documents\login and signup\frontend"
npm run dev
```

### Option 2: Open in Your Terminal

1. Press `` Ctrl+` `` in Cursor
2. Run backend command
3. Click **+** to open new terminal
4. Run frontend command

---

## 🌐 Access Points

After starting both servers:

- **Frontend UI:** http://localhost:5173 ← Open this in browser!
- **Backend API:** http://localhost:3000
- **API Docs (Swagger):** http://localhost:3000/api
- **Database Viewer:** Run `npx prisma studio` → http://localhost:5555

---

## 📱 How to Use

1. **Open browser:** http://localhost:5173
2. **Create account:** Click "Sign up"
3. **Login:** Use your credentials
4. **View dashboard:** See your profile and all users
5. **Setup 2FA:** Click "2FA Settings" → Follow steps

---

## 🔐 2FA Setup Flow

1. In Dashboard → "2FA Settings" tab
2. Enter your password → Generate QR
3. Open Google Authenticator app on phone
4. Scan QR code
5. Enter 6-digit code to verify
6. 2FA is now enabled!

Next login will require the code from your app!

---

## 🛑 How to Stop

Press `Ctrl + C` in each terminal window (backend and frontend)

---

## 🎨 Design

Modern UI with:
- Dark blue gradient background (#0a1628 → #1a2942)
- Purple-blue gradient buttons
- Clean cards with shadows
- Smooth animations
- Responsive layout

---

## 🔧 Tech Stack

### Backend
- NestJS
- TypeScript
- Prisma ORM
- SQLite
- JWT + Passport
- Speakeasy (2FA)

### Frontend
- React 18
- Vite
- Tailwind CSS
- Axios
- React Router
- QRCode.react

---

## 📞 Troubleshooting

### Frontend shows connection error

Make sure backend is running at http://localhost:3000

### Port already in use

Backend (3000):
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

Frontend (5173):
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
```

---

## 🎉 Quick Test

1. Start backend
2. Start frontend
3. Open http://localhost:5173
4. Create account
5. Login
6. Enjoy! 🚀
