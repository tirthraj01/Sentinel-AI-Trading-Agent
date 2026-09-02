# SENTINEL — Setup & Installation Guide

This guide walks you through setting up SENTINEL locally from scratch.

---

## 1. Prerequisites

Before starting, ensure you have the following installed on your machine:

* **Node.js**: Version `v20.0.0` or higher (tested on Node v24 LTS)
* **npm**: Version `10.0.0` or higher
* **Git**: Version `2.x` or higher

Check your installed versions:
```bash
node -v
npm -v
git --version
```

---

## 2. External Service Keys

SENTINEL requires three external integrations. All have generous free tiers suitable for hackathon development:

### A. Alpaca Paper Trading Account (Free)
1. Navigate to [https://alpaca.markets/](https://alpaca.markets/) and sign up.
2. Under your dashboard, switch to **Paper Trading** mode (the banner at the top will be purple/blue stating "Paper Account").
3. In the sidebar, generate a new **API Key** and **API Secret**.
4. Save these for your `.env` file (`ALPACA_API_KEY`, `ALPACA_SECRET_KEY`).
5. Verify the base URL is `https://paper-api.alpaca.markets`. **NEVER** use `https://api.alpaca.markets` (live money).

### B. Google Gemini API Key (Free)
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Click **Get API key** and generate a key.
3. Save this as `GEMINI_API_KEY`.

### C. Supabase Project (Free)
1. Go to [https://supabase.com/](https://supabase.com/) and create a free project.
2. In **Project Settings** > **API**, copy:
   * **Project URL** (`SUPABASE_URL`)
   * **Project API keys** > `anon` `public` (`SUPABASE_ANON_KEY`)
   * **Project API keys** > `service_role` (`SUPABASE_SERVICE_ROLE_KEY`)
3. In the **SQL Editor**, run the schema script located at `docs/database.md` or `backend/src/config/schema.sql`.

---

## 3. Local Installation Steps

### Step 1: Clone or Open the Repository
```bash
cd "c:\Users\BusinessComputers.in\Pictures\New folder (2)"
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `backend/.env`:
```bash
cp .env.example backend/.env
```
Fill in your credentials inside `backend/.env`.

### Step 3: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 4: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## 4. Running the Application

You can run both backend and frontend during development:

### Backend Terminal (Port 5000):
```bash
cd backend
npm run dev
```

### Frontend Terminal (Port 5173):
```bash
cd frontend
npm run dev
```

Open your browser at `http://localhost:5173` to explore the SENTINEL interface.

---

## 5. Verifying Safety Constraints

To guarantee live money is never touched:
1. In `backend/.env`, confirm `ALPACA_PAPER_TRADE=true`.
2. Observe backend boot logs:
   ```
   [SENTINEL BOOT] Mode: PAPER TRADING ONLY
   [SENTINEL BOOT] Alpaca Endpoint: https://paper-api.alpaca.markets
   ```
If `ALPACA_PAPER_TRADE` is altered or missing, the server will throw a fatal assertion and immediately terminate execution.
