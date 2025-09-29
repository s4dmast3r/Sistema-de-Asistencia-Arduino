# RFID Attendance System

A complete monorepo solution for RFID-based attendance tracking using Arduino UNO + RC522, with real-time web dashboard.

## 🚀 System Overview

This project provides a complete attendance control system with:

- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + SQLite + Serial Communication
- **Hardware**: Arduino UNO + RC522 RFID Module
- **Real-time**: Server-Sent Events (SSE) for instant updates

## 📋 Features

### ✅ RFID Card Management
- Automatic IN/OUT toggle for registered cards
- Unknown UID detection and registration workflow
- Anti-bounce protection (firmware + backend)
- Cooldown period to prevent accidental double-scans

### ✅ Real-time Dashboard
- Live attendance notifications via SSE
- Present users overview with check-in times
- Attendance history with date/time filtering
- Connection status indicator

### ✅ User Management
- Complete CRUD operations for employees
- Card UID registration and management
- Active/inactive user status
- Bulk operations support

### ✅ Professional UI/UX
- Responsive design for desktop and mobile
- Loading states and error handling
- Toast notifications for all events
- Clean, accessible interface

## 🏗️ Project Structure

```
rfid-attendance/
├─ frontend/                 # React + Vite application (THIS PROJECT)
│  ├─ src/
│  │  ├─ components/
│  │  │  ├─ attendance/     # Attendance components
│  │  │  ├─ users/          # User management
│  │  │  ├─ dashboard/      # Dashboard widgets
│  │  │  └─ ui/            # UI components (shadcn/ui)
│  │  ├─ hooks/            # Custom React hooks
│  │  ├─ lib/              # API client and utilities
│  │  ├─ pages/            # Main pages
│  │  └─ assets/           # Images and static files
│  ├─ package.json
│  └─ vite.config.ts
├─ backend/                  # Node.js server (TO BE CREATED)
│  ├─ server.cjs           # Main server file
│  ├─ package.json         # Backend dependencies
│  └─ attendance.db        # SQLite database (auto-created)
├─ arduino-sketch/           # Arduino code (TO BE CREATED)
│  └─ rfid_attendance.ino  # RC522 RFID reader code
└─ README.md               # This file
```

## 🔧 Frontend Setup (Current Project)

This Lovable project contains the complete frontend dashboard. To run locally:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## ⚙️ Complete System Setup

To create the full attendance system, you'll need to implement the backend and Arduino components:

### 1. Backend Setup (Node.js + Express)

Create `backend/package.json`:
```json
{
  "name": "rfid-attendance-backend",
  "version": "1.0.0",
  "type": "commonjs",
  "dependencies": {
    "express": "^4.18.0",
    "better-sqlite3": "^8.7.0",
    "serialport": "^12.0.0",
    "@serialport/parser-readline": "^12.0.0",
    "cors": "^2.8.5"
  },
  "scripts": {
    "start": "node server.cjs"
  }
}
```

### 2. Database Schema (SQLite)

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  card_uid TEXT UNIQUE NOT NULL,
  active INTEGER DEFAULT 1
);

-- Attendance records
CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  direction TEXT CHECK(direction IN ('IN','OUT')) NOT NULL,
  ts DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
```

### 3. Arduino Wiring (RC522 + Arduino UNO)

```
RC522    Arduino UNO
------------------------
VCC   →  3.3V
GND   →  GND
RST   →  Pin 9
SDA   →  Pin 10
SCK   →  Pin 13
MOSI  →  Pin 11
MISO  →  Pin 12
```

### 4. Required Arduino Libraries

```cpp
#include <SPI.h>
#include <MFRC522.h>
```

## 🚀 Running the System

### Frontend (This Project)
```bash
npm run dev
```
Runs on http://localhost:5173

### Backend (To Be Created)
```bash
# Windows
set SERIAL_PATH=COM5 && set PORT=3000 && node server.cjs

# PowerShell
$env:SERIAL_PATH="COM5"; $env:PORT="3000"; node server.cjs

# Linux/Mac
SERIAL_PATH=/dev/ttyUSB0 PORT=3000 node server.cjs
```
Runs on http://localhost:3000

### Arduino
Upload the sketch and connect via USB. **Important**: Close Arduino Serial Monitor before running the backend!

## 🔌 API Endpoints

The frontend is configured to work with these backend endpoints:

```
GET    /api/health              - Health check
GET    /api/users               - List all users
POST   /api/users               - Create new user
PUT    /api/users/:id           - Update user
DELETE /api/users/:id           - Delete user
GET    /api/attendance          - Get attendance records (with filters)
GET    /api/present             - Get currently present users
GET    /api/stream              - SSE event stream for real-time updates
```

## 📡 Real-time Events (SSE)

The dashboard connects to `/api/stream` and handles these events:

- **attendance**: `{ uid, user: {id, name}, direction: "IN"|"OUT", ts }`
- **unknown**: `{ uid, ts }` - Unknown card detected
- **ignored**: `{ uid, reason: "burst"|"cooldown", secondsLeft?, ts }`
- **ping**: Keep-alive heartbeat

## 🛡️ Security Features

### Anti-bounce Protection
- **Firmware**: Single read per card presence (3s window)
- **Backend**: Burst filtering (1.2s) + cooldown period (3-5s)
- **UI**: Clear feedback for ignored reads

### Input Validation
- UID normalization (HEX uppercase, no separators)
- Required field validation
- SQL injection prevention
- CORS configuration

## 🎨 UI/UX Features

### Real-time Updates
- Instant toast notifications for all card events
- Live connection status indicator
- Auto-refreshing present users list
- Seamless SSE reconnection

### Responsive Design
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interfaces
- Accessible color contrasts

### Professional Theming
- Blue/green security-focused color palette
- Consistent spacing and typography
- Loading states and error handling
- Empty states with helpful messaging

## 🔍 Troubleshooting

### Common Issues

**SSE Connection Fails**
- Ensure backend is running on correct port
- Check CORS configuration
- In development: SSE connects directly to :3000 (bypasses Vite proxy)

**Serial Port Access Denied**
- Close Arduino Serial Monitor
- Kill any processes using the COM port
- Check driver installation
- Try different USB port

**Card Not Detected**
- Verify RC522 wiring (3.3V power!)
- Check SPI connections
- Ensure proper antenna positioning
- Use MIFARE Classic cards for stable UID

**Frontend Build Errors**
- Ensure all TypeScript types are correct
- Check import paths
- Verify shadcn/ui component usage

## 📊 Development Features

### Code Quality
- TypeScript for type safety
- ESLint + Prettier configuration
- Modular component architecture
- Custom hooks for reusable logic

### Performance
- React Query for efficient data fetching
- Optimistic updates for better UX
- Lazy loading and code splitting
- Efficient re-rendering patterns

### Accessibility
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility

## 🚀 Production Deployment

### Frontend Deployment
This Lovable project can be deployed using the built-in publish feature or exported to any static hosting service.

### Backend Deployment
- Use PM2 for process management
- Configure reverse proxy (nginx/Apache)
- Set up SSL certificates
- Configure environment variables
- Monitor serial port connectivity

### Hardware Considerations
- Use quality USB cables for Arduino connection
- Consider powered USB hub for reliability
- Implement hardware watchdog for auto-recovery
- Use appropriate enclosure for RC522 module

## 📈 Future Enhancements

- **Reports**: Detailed analytics and export functionality
- **Multiple Readers**: Support for multiple RFID stations
- **Database**: PostgreSQL/MySQL for larger deployments  
- **Authentication**: Admin login and role-based access
- **Mobile App**: Native mobile companion app
- **Cloud Sync**: Multi-location synchronization

## 🤝 Contributing

This project serves as a complete reference implementation. Feel free to:
- Extend functionality for your specific needs
- Improve the UI/UX design
- Add new features and integrations
- Share improvements with the community

## 📄 License

This project is open source and available under the MIT License.
