# Frontend - Next.js Authentication Platform

Modern Next.js frontend for the NestJS authentication backend with dark blue theme.

## 🚀 Features

- ✅ Built with Next.js 15 & TypeScript
- ✅ App Router (no React Router needed!)
- ✅ Server & Client components
- ✅ Login & Signup pages
- ✅ Dashboard with user profile
- ✅ Google Authenticator 2FA setup
- ✅ View all users
- ✅ Responsive design
- ✅ Tailwind CSS styling

---

## 🛠️ Installation

### Navigate to Next.js frontend folder

```powershell
cd "C:\Users\allen\Documents\login and signup\frontend-nextjs"
```

### Install dependencies (already done)

```powershell
npm install
```

---

## ▶️ How to Run

### Make sure backend is running first!

In one terminal:
```powershell
cd "C:\Users\allen\Documents\login and signup\backend"
npm run start:dev
```

### Then start Next.js frontend in another terminal

```powershell
cd "C:\Users\allen\Documents\login and signup\frontend-nextjs"
npm run dev
```

Frontend will open at: **http://localhost:3000**

---

## 🛑 How to Stop

Press `Ctrl + C` in the terminal

---

## 📱 Usage

1. **Open browser:** http://localhost:3000
2. **Create account:** Click "Sign up"
3. **Login:** Use your email/password
4. **Dashboard:** View profile and all users
5. **Enable 2FA:** Go to 2FA Settings tab

---

## 🎨 Design Features

- Dark blue gradient background
- Modern glassmorphism cards
- Smooth animations
- Purple-blue gradient buttons
- Clean, professional layout
- Same styling as React version!

---

## 🔌 API Connection

Frontend connects to backend at `http://localhost:3000`

Make sure both are running:
- Backend: `http://localhost:3000`
- Frontend (Next.js): `http://localhost:3000` (same port!)

**Note:** Next.js runs on port 3000 by default, but if backend is on 3000, Next.js will auto-switch to 3001.

---

## 📦 Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - API requests
- **qrcode.react** - QR code display
- **App Router** - File-based routing

---

## 🆕 What's Different from React + Vite?

### Advantages:
- ✅ No React Router needed (file-based routing)
- ✅ TypeScript out of the box
- ✅ Better SEO support
- ✅ Server-side rendering ready
- ✅ Optimized performance
- ✅ Built-in image optimization

### File Structure:
- `app/` directory for pages
- `components/` for reusable components
- `app/layout.tsx` = root layout
- `app/page.tsx` = homepage
- `app/login/page.tsx` = login page

---

Happy coding! 🚀
