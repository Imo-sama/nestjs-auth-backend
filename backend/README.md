# NestJS Login & Signup Backend with 2FA

A complete authentication backend built with NestJS, featuring user registration, login, JWT authentication, and Google Authenticator (2FA) support.

## 🚀 Features

- ✅ User signup and login
- ✅ Password hashing with bcrypt
- ✅ JWT authentication
- ✅ Google Authenticator (TOTP) 2FA
- ✅ CRUD operations (Create, Read, Update, Delete users)
- ✅ SQLite database with Prisma ORM
- ✅ Input validation with class-validator

---

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Google Authenticator app** (for 2FA testing)
  - [iOS App Store](https://apps.apple.com/app/google-authenticator/id388497605)
  - [Android Play Store](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2)

---

## 🛠️ Installation (First Time Only)

### Step 1: Open PowerShell or Terminal

In Cursor: Press `` Ctrl+` `` (backtick) to open terminal

### Step 2: Navigate to backend folder

```powershell
cd "C:\Users\allen\Documents\login and signup\backend"
```

### Step 3: Install dependencies

```powershell
npm install
```

### Step 4: Generate Prisma Client

```powershell
npx prisma generate
```

### Step 5: Create database

```powershell
npx prisma db push
```

---

## ▶️ How to Start the Server

### Open Terminal in Cursor (`` Ctrl+` ``)

```powershell
cd "C:\Users\allen\Documents\login and signup\backend"
npm run start:dev
```

**That's it!** Server will start at:
- **API:** http://localhost:3000
- **Swagger Docs:** http://localhost:3000/api 📚 ← **Test API in your browser!**

Keep the terminal window open while testing!

### 🎯 NEW: Swagger API Documentation

Open http://localhost:3000/api in your browser to:
- ✅ See all available endpoints
- ✅ Test API directly in the browser (no Postman needed!)
- ✅ See request/response examples
- ✅ Try out authentication

---

## 🛑 How to Stop the Server

In the terminal where server is running, press: **`Ctrl + C`**

Or close the terminal window.

---

## 📱 Other Useful Commands

```powershell
# View database with Prisma Studio
npx prisma studio

# Reset database (deletes all data!)
npx prisma db push --force-reset

# Rebuild the project
npm run build

# Production mode
npm run start:prod
```

---

## 📡 API Endpoints

Base URL: `http://localhost:3000`

### 🔐 Authentication Endpoints

#### 1. **Signup** - Create new account

- **Method:** `POST`
- **URL:** `/auth/signup`
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cmlnk...",
    "email": "user@example.com"
  }
}
```

---

#### 2. **Login** - Sign in

- **Method:** `POST`
- **URL:** `/auth/login`
- **Body (without 2FA):**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Body (with 2FA enabled):**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "twoFactorCode": "123456"
}
```
- **Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cmlnk...",
    "email": "user@example.com"
  }
}
```

---

### 👤 User Endpoints

#### 3. **Get All Users**

- **Method:** `GET`
- **URL:** `/auth/users`
- **Auth:** Not required
- **Response:**
```json
[
  {
    "id": "cmlnk...",
    "email": "user@example.com",
    "createdAt": "2026-01-21T...",
    "updatedAt": "2026-01-21T...",
    "twoFactorEnabled": false
  }
]
```

---

#### 4. **Get My Profile** 🔒

- **Method:** `GET`
- **URL:** `/auth/me`
- **Auth:** Bearer Token required
- **Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### ✏️ Update Endpoints

#### 5. **Update Account (with JWT)** 🔒

- **Method:** `PUT`
- **URL:** `/auth/account`
- **Auth:** Bearer Token required
- **Body:**
```json
{
  "email": "newemail@example.com",
  "password": "newpassword123"
}
```

---

#### 6. **Update Account (easy, no JWT)**

- **Method:** `PUT`
- **URL:** `/auth/update`
- **Auth:** Not required
- **Body:**
```json
{
  "currentEmail": "old@example.com",
  "currentPassword": "oldpassword",
  "newEmail": "new@example.com",
  "newPassword": "newpassword123"
}
```

---

### 🗑️ Delete Endpoints

#### 7. **Delete Own Account (with JWT)** 🔒

- **Method:** `DELETE`
- **URL:** `/auth/account`
- **Auth:** Bearer Token required

---

#### 8. **Delete Account by ID (with JWT)** 🔒

- **Method:** `DELETE`
- **URL:** `/auth/account/:id`
- **Auth:** Bearer Token required
- **Example:** `/auth/account/cmlnk123456`

---

#### 9. **Delete Account (easy, no JWT)**

- **Method:** `DELETE`
- **URL:** `/auth/delete`
- **Auth:** Not required
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

---

### 📱 Google Authenticator (2FA) Endpoints

#### 10. **Enable 2FA** - Get QR Code

- **Method:** `POST`
- **URL:** `/auth/2fa/enable`
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response:**
```json
{
  "message": "2FA secret generated. Scan QR code with Google Authenticator",
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Next steps:**
1. Copy the `qrCode` value (entire data URL)
2. Paste it in your browser address bar
3. Scan the QR code with Google Authenticator app
4. The app will show a 6-digit code

---

#### 11. **Verify 2FA** - Activate it

- **Method:** `POST`
- **URL:** `/auth/2fa/verify`
- **Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```
(Use the 6-digit code from Google Authenticator)

- **Response:**
```json
{
  "message": "2FA enabled successfully"
}
```

After this, login will require the `twoFactorCode`!

---

#### 12. **Disable 2FA**

- **Method:** `POST`
- **URL:** `/auth/2fa/disable`
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "code": "123456"
}
```

---

## 🧪 Testing with Postman

### Quick Start Guide

1. **Open Postman**

2. **Test Signup:**
   - Method: `POST`
   - URL: `http://localhost:3000/auth/signup`
   - Body → raw → JSON:
   ```json
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```
   - Click **Send**
   - Copy the `access_token` from response

3. **Test Protected Endpoint:**
   - Method: `GET`
   - URL: `http://localhost:3000/auth/me`
   - Authorization → Type: **Bearer Token**
   - Paste the token
   - Click **Send**

### 🔑 Setting Bearer Token in Postman

1. Click **Authorization** tab
2. Select **Type:** `Bearer Token`
3. Paste your `access_token` in the **Token** field
4. Click **Send**

---

## 📱 Google Authenticator Setup

### Complete 2FA Flow

1. **Create account:**
```
POST /auth/signup
{
  "email": "2fauser@example.com",
  "password": "mypassword"
}
```

2. **Enable 2FA:**
```
POST /auth/2fa/enable
{
  "email": "2fauser@example.com",
  "password": "mypassword"
}
```

3. **Copy the `qrCode` from response** (starts with `data:image/png;base64,`)

4. **Paste QR code in browser:**
   - Open new browser tab
   - Paste the entire `qrCode` value in address bar
   - Press Enter
   - QR code image will appear

5. **Scan with Google Authenticator:**
   - Open Google Authenticator app on phone
   - Tap "+" or "Add account"
   - Choose "Scan a QR code"
   - Scan the QR from browser
   - App will show 6-digit code (changes every 30 seconds)

6. **Verify the code:**
```
POST /auth/2fa/verify
{
  "email": "2fauser@example.com",
  "code": "123456"
}
```
(Replace 123456 with actual code from app)

7. **Login with 2FA:**
```
POST /auth/login
{
  "email": "2fauser@example.com",
  "password": "mypassword",
  "twoFactorCode": "654321"
}
```
(Use current code from Google Authenticator)

---

## 🗄️ Database

### View database with Prisma Studio

```powershell
npx prisma studio
```

Opens browser at **http://localhost:5555** with visual database editor.

### Database location

- File: `backend/prisma/dev.db`
- Type: SQLite

---

## 🔧 Environment Variables

The app uses fallback values if `.env` is not configured:

- `JWT_SECRET`: `"your-secret-key-here"` (change in production!)
- `DATABASE_URL`: `"file:./dev.db"`
- `PORT`: `3000`

To customize, create `.env` file in `backend/` folder:

```env
JWT_SECRET=your-super-secret-key
DATABASE_URL=file:./dev.db
PORT=3000
```

---

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── dev.db              # SQLite database
├── src/
│   ├── auth/               # Authentication module
│   │   ├── dto/            # Data validation classes
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── jwt.strategy.ts
│   │   ├── jwt-auth.guard.ts
│   │   └── two-factor.service.ts
│   ├── users/              # Users module
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── prisma/             # Prisma module
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   ├── app.module.ts
│   └── main.ts
├── package.json
└── README.md               # This file
```

---

## 🐛 Troubleshooting

### ⚠️ Can't compress/zip/move files - "File in use" error

**Problem:** Backend server is running and locking the database file

**Solution:** Stop the server first!
- Press `Ctrl+C` in the terminal where server is running

After stopping, you can compress/move files safely.

### Port 3000 already in use

```powershell
# Stop the process using port 3000:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

### Server not starting

1. Delete `node_modules` and reinstall:
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

2. Regenerate Prisma:
```powershell
npx prisma generate
```

### Database errors

```powershell
# Reset database (WARNING: deletes all data!)
Remove-Item prisma\dev.db -Force
npx prisma db push
```

---

## 📚 Technologies Used

- **NestJS** - Backend framework
- **TypeScript** - Programming language
- **Prisma** - ORM (Object-Relational Mapping)
- **SQLite** - Database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **speakeasy** - TOTP generation
- **qrcode** - QR code generation
- **Passport.js** - Authentication middleware
- **class-validator** - Input validation

---

## 🎯 API Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/signup` | POST | ❌ | Create account |
| `/auth/login` | POST | ❌ | Sign in |
| `/auth/users` | GET | ❌ | Get all users |
| `/auth/me` | GET | ✅ | Get my profile |
| `/auth/account` | PUT | ✅ | Update my account |
| `/auth/account` | DELETE | ✅ | Delete my account |
| `/auth/account/:id` | DELETE | ✅ | Delete user by ID |
| `/auth/update` | PUT | ❌ | Update (no JWT) |
| `/auth/delete` | DELETE | ❌ | Delete (no JWT) |
| `/auth/2fa/enable` | POST | ❌ | Get 2FA QR code |
| `/auth/2fa/verify` | POST | ❌ | Activate 2FA |
| `/auth/2fa/disable` | POST | ❌ | Disable 2FA |

✅ = Requires JWT Bearer Token  
❌ = No authentication required

---

## 📞 Support

If you encounter any issues:

1. Make sure the server is running (`npm run start:dev`)
2. Check you're using the correct HTTP method (GET/POST/PUT/DELETE)
3. For protected routes, ensure Bearer token is set correctly
4. For 2FA, verify the code hasn't expired (30-second window)

---

## 🎉 Quick Test

Run this complete flow in Postman:

```json
// 1. Signup
POST http://localhost:3000/auth/signup
{ "email": "demo@test.com", "password": "test123" }

// 2. View all users
GET http://localhost:3000/auth/users

// 3. Enable 2FA
POST http://localhost:3000/auth/2fa/enable
{ "email": "demo@test.com", "password": "test123" }

// 4. Copy qrCode → paste in browser → scan with Google Authenticator

// 5. Verify 2FA
POST http://localhost:3000/auth/2fa/verify
{ "email": "demo@test.com", "code": "123456" }

// 6. Login with 2FA
POST http://localhost:3000/auth/login
{ "email": "demo@test.com", "password": "test123", "twoFactorCode": "654321" }
```

Happy coding! 🚀
