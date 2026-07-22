# Ledgerline — Autonomous Agentic AI Financial Platform

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--3.5/4-412991?style=for-the-badge&logo=openai&logoColor=white)](https://platform.openai.com/)
[![Scikit-Learn](https://img.shields.io/badge/scikit_learn-ML_Engine-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Prophet](https://img.shields.io/badge/Meta_Prophet-Time_Series-008080?style=for-the-badge&logo=chart-line&logoColor=white)](https://facebook.github.io/prophet/)
[![Docker](https://img.shields.io/badge/Docker-Dev_Env-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

**Ledgerline** is a full-stack, autonomous **Agentic AI Financial Platform**. It ingests raw financial statement files (CSV/PDF), automatically categorizes transactions using a hybrid ML/LLM pipeline, detects anomalous spending via personalized Isolation Forest models, forecasts future cash flow with Meta Prophet, and features a multi-tool **ReAct Agent Framework** capable of executing scenario simulations, subscription audits, and safe Text-to-SQL database analytics.

---

## 🌟 Latest Updates (Agentic AI Framework v2.0)

- **🤖 Multi-Tool ReAct Agent Engine**: Replaced single-turn SQL query execution with an intent-driven **Reasoning + Acting (ReAct)** framework.
- **🔮 "What-If" Financial Scenario Simulator (`tool_simulate_scenario`)**: Simulates major purchases or EMI commitments (e.g., *"Can I afford a ₹30,000 laptop on 6 months EMI?"*), projecting cash flow impact and feasibility ratings (**Comfortable**, **Tight**, **High Risk**).
- **🔄 Recurring Subscriptions Auditor (`tool_detect_subscriptions`)**: Automatically identifies active subscriptions (Netflix, Spotify, broadband, rent) and computes total recurring monthly commitments.
- **🛡️ Isolation Forest Anomaly Inspector (`tool_audit_anomalies`)**: Scans user spend history for uncharacteristic transactions and flags open alerts.
- **🔄 Active Learning Recategorization (`tool_bulk_recategorize`)**: Reclassifies merchant categories conversational-style and triggers background ML model retraining.
- **🔒 Sandboxed SQL Safety Guardrails (`tool_sql_analytics`)**: Enforces strictly read-only `SELECT` queries with mandatory user-level data isolation (`WHERE user_id = :user_id`).

---

## 🛠️ Agentic Tool Ecosystem

| Tool Function | Description | Example Query |
| :--- | :--- | :--- |
| `tool_simulate_scenario` | Computes baseline monthly spend, EMI installments, percentage spend increase, and feasibility rating. | *"Can I afford a ₹25,000 phone on 3 months EMI?"* |
| `tool_detect_subscriptions` | Identifies monthly/weekly recurring payment patterns and totals monthly commitments. | *"What active subscriptions do I have?"* |
| `tool_audit_anomalies` | Runs unsupervised Isolation Forest anomaly detection to inspect uncharacteristic purchases. | *"Show me my unusual spending anomalies"* |
| `tool_bulk_recategorize` | Updates matching merchant categories in DB and triggers active-learning model retraining. | *"change swiggy to groceries"* |
| `tool_sql_analytics` | Translates natural language into safe, read-only SQL queries with tenant isolation. | *"How much did I spend on dining this month?"* |

---

## 📂 Repository Structure

```
ledgerline-finance-app/
├── frontend/                     # Next.js App Router Client
│   ├── app/                      # Pages (Upload, Dashboard, Alerts, Chat, Trends, Login)
│   ├── components/               # Custom React Components (MetricCard, CategoryChart, ChatPanel)
│   ├── lib/                      # API client (`api.js`) & mock state fallbacks
│   └── tailwind.config.js        # Design system tokens and styling theme
│
├── backend/                      # Python FastAPI Service
│   ├── app/
│   │   ├── api/                  # API endpoints (auth, transactions, alerts, insights, agent)
│   │   ├── core/                 # JWT Auth, Database engines, Settings
│   │   ├── models/               # SQLAlchemy PostgreSQL models (User, Transaction, Alert, Forecast)
│   │   ├── schemas/              # Pydantic validation schemas
│   │   └── services/             # AI Agent orchestrator, ML categorizer, Anomaly detector, Forecaster
│   ├── init_db.py                # Database setup script
│   ├── test_agent_tools.py       # In-memory unit test suite for Agentic tools
│   ├── test_flow.py              # End-to-end integration test flow script
│   └── requirements.txt          # Python dependencies
│
├── docker-compose.yml            # PostgreSQL & pgAdmin dev setup
└── README.md                     # Workspace documentation
```

---

## 🚀 Getting Started

### 1. Database Setup
Spin up a local PostgreSQL database using Docker Compose:
```bash
docker-compose up -d
```
- **Postgres DB**: `localhost:5432` (`postgres`/`postgres`)
- **pgAdmin**: [http://localhost:5050](http://localhost:5050) (`admin@ledgerline.com`/`admin`)

---

### 2. Backend Setup & Running
```bash
cd backend

# Create & activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1   # On Windows
source venv/bin/activate      # On macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Initialize database tables
python init_db.py

# Run Uvicorn dev server
uvicorn app.main:app --reload --port 8000
```
Swagger API Docs will be live at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

---

### 3. Agentic AI Unit & Integration Tests
To test the multi-tool Agentic framework and scenario simulators:
```bash
cd backend
python test_agent_tools.py   # Runs in-memory ReAct agent tool tests
python test_flow.py          # Runs full E2E HTTP integration tests
```

---

### 4. Frontend Setup & Running
```bash
cd frontend
npm install
npm run dev
```
The Next.js client will be available at [http://localhost:3000](http://localhost:3000).

---

## 📜 License & Academic Attribution
Developed as part of an **AI-Powered Personal Finance System** project, demonstrating classical machine learning, Agentic AI state machine workflows, and modern web application architecture.
