📧 Gmail Automation Tool

Automate Gmail tasks such as labeling, filtering, and sending auto-replies based on customizable rules.

This project includes:
✔ Backend (Node.js + Express + MongoDB)
✔ Frontend (React + Vite)
✔ Google OAuth2 Login
✔ Gmail API Automation
✔ Rule-Based Email Processing Engine
✔ AES-256 Encryption for Gmail Tokens

🚀 Features

Login using Google OAuth2

Create rules:

Match subject keywords

Match sender email

Apply Gmail labels

Send auto-reply templates

Background scheduler for continuous email processing

Logs for every automation action

Secure token encryption

📂 Project Structure
/gmail-automation
  /backend
    src/
      controllers/
      models/
      routes/
      utils/
      index.js
      app.js
    .env
  
  /frontend
    src/
    index.html
    .env

🛠️ Backend Setup (Node.js)
1. Install Dependencies
cd backend
npm install

2. Create .env File (backend)

Create a .env file inside the backend folder:

PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/gmail-automation

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
OAUTH_REDIRECT_URI=http://localhost:4000/api/auth/google/callback

JWT_SECRET=your_jwt_secret

ENCRYPTION_SECRET=32_byte_hex_key_here
FRONTEND_URL=http://localhost:3000

Generate a valid 32-byte encryption key:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"


Paste this into:
ENCRYPTION_SECRET=your_generated_key

3. Start Backend Server
npm run start


Expected output:

Connected to MongoDB
Server listening on port 4000

🌐 Google OAuth Setup

Go to Google Cloud Console:
https://console.cloud.google.com/apis/credentials

✔ Step 1 — Create OAuth Client (Web Application)

Authorized JavaScript origins:

http://localhost:3000


Authorized redirect URIs:

http://localhost:4000/api/auth/google/callback

✔ Step 2 — Add Test Users (Important!)

Because your app is unverified, only test users can log in.

Go to:

OAuth Consent Screen → Test Users
Add:

the Google account you will use for login

any other developer accounts

🎨 Frontend Setup (React/Vite)
1. Install Dependencies
cd frontend
npm install

2. Create .env File (frontend)
VITE_BACKEND_URL=http://localhost:4000

3. Start Frontend
npm run dev


Open the app:
👉 http://localhost:3000

🔐 Logging In

Click Login with Google.

If Google shows "App not verified":

Advanced → Go to Gmail Automation Tool (unsafe)


After login, you should be redirected to:

http://localhost:5173/?token=<JWT_TOKEN>

📬 Testing the Automation Engine
✔ Step 1 — Create a Rule

Example:

Name: Invoice Rule

Subject Contains: invoice

Label: Finance

Auto Reply: (optional template)

Click Save.

✔ Step 2 — Send Test Email

Send from any email account to the Google account you logged in with.

Example:

To: your_logged_in_account@gmail.com
Subject: invoice test
Body: This is a test email

✔ Step 3 — Wait for Automation Engine

The backend scheduler runs every 1 minute.

You should see logs like:

Processing email <messageId> matched rule <ruleId>
Label applied: Finance

✔ Step 4 — Check Gmail

Open Gmail inbox →
You should see the email labeled automatically.

If auto-reply is enabled → sender receives a reply.

🛡️ Security Notes

AES-256 is used for encrypting Gmail OAuth tokens

.env files must never be pushed to GitHub

JWT secrets should be long and random

❗ Common Issues & Fixes
1. “redirect_uri_mismatch”

Fix: Ensure redirect URI matches exactly:

http://localhost:4000/api/auth/google/callback

2. “Invalid key length”

Your encryption key must be exactly 32 bytes (64 hex characters).

Generate again:

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

3. “App not verified” Warning

This happens because your app is not Google-verified.
Solution: Add your email under Test Users in Google Console.
