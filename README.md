# Ledgerline — AI-Powered Personal Finance Manager

This repository contains the end-to-end codebase for **Ledgerline**, a full-stack, AI-integrated financial manager. The codebase is organized as a professional mono-repo containing a Next.js frontend client and a Python FastAPI backend service.

---

## 📂 Repository Structure

```
ledgerline-finance-app/
├── frontend/             # Next.js App Router Frontend
│   ├── app/              # Application pages (Upload, Dashboard, Alerts, Chat, Trends)
│   ├── components/       # Custom React UI components (MetricCard, AlertBanner, etc.)
│   ├── lib/              # Frontend API client and helpers
│   ├── package.json      # React / NextJS dependencies
│   └── tailwind.config.js# Styling theme configuration & tokens
│
├── backend/              # Python FastAPI Backend
│   ├── app/
│   │   ├── api/          # Router endpoints (Auth, Transactions, Alerts, Insights, Agent)
│   │   ├── core/         # JWT Security, Database engines, App configs
│   │   ├── models/       # SQLAlchemy Postgres models
│   │   ├── schemas/      # Pydantic validation models
│   │   └── services/     # Statement parser, ML categorizer, Anomaly detector, Time-series forecasting
│   ├── requirements.txt  # Python packages
│   └── init_db.py        # Database bootstrap tool
│
├── docker-compose.yml    # Development PostgreSQL and pgAdmin setup
└── README.md             # Workspace documentation
```

---

## 🚀 Getting Started

### 1. Database Setup
Spin up a local PostgreSQL database using Docker Compose, or make sure you have local PostgreSQL running:
```bash
docker-compose up -d
```
This runs:
- **Postgres Database**: `localhost:5432` (User/Password: `postgres`/`postgres`)
- **pgAdmin Console**: [http://localhost:5050](http://localhost:5050) (User/Password: `admin@ledgerline.com`/`admin`)

---

### 2. Backend Installation & Run
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Set up virtual environment and install packages:
   ```bash
   python -m venv venv
   .\venv\Scripts\Activate.ps1    # On Windows
   source venv/bin/activate       # On macOS/Linux
   pip install -r requirements.txt
   ```
3. Initialize the database tables:
   ```bash
   python init_db.py
   ```
4. Run the Uvicorn server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
The Swagger UI will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

---

### 3. Frontend Installation & Run
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
The application will be available at [http://localhost:3000](http://localhost:3000).
