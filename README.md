# MediBuddy (SIP) - Caregiver Auth Demo

cd "C:\Users\Siddhartha\AppData\Local\Programs\Ollama"; .\ollama.exe serve

Ollama model setup
- Ensure the better local model is installed:
	- In a separate terminal: `cd "C:\Users\Siddhartha\AppData\Local\Programs\Ollama"`
	- Pull the model: `./ollama.exe pull llama3.1`
	- Leave `./ollama.exe serve` running while you use the app

Small Node + Express app demonstrating caregiver registration and login using SQLite and session-based auth.

Stack
- Node.js + Express
- SQLite (via sqlite3)
- bcrypt for password hashing
- express-session + connect-sqlite3 for sessions
- express-rate-limit for simple login rate limiting
- Frontend: HTML + Bootstrap + fetch()

Quick start
1. Install dependencies: npm install
2. Start server: npm run dev (requires nodemon) or npm start
3. Open http://localhost:3000/register.html to create a caregiver account

Notes
- Passwords are hashed with bcrypt (saltRounds = 10)
- The app uses session cookies and stores sessions in a sqlite file via connect-sqlite3
- For production, change SESSION_SECRET and consider using HTTPS and better session store

Project structure
- server.js - app bootstrap and routes
- db/ - database file and init script
- models/ - database access
- controllers/ - route handlers
- routes/ - express routers
- middleware/ - auth middleware
- public/ - login & register pages + JS
- views/ - protected HTML (dashboard)

Comments are included in code where relevant for SIP grading.
