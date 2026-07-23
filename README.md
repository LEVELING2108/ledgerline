# Ledgerline — Autonomous Agentic AI Financial Platform

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-State_Machine-FF6F00?style=flat-square&logo=langchain&logoColor=white)](https://www.langchain.com/langgraph)
[![LangChain](https://img.shields.io/badge/LangChain-Framework-1C3C3C?style=flat-square&logo=langchain&logoColor=white)](https://www.langchain.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o_/_3.5-412991?style=flat-square&logo=openai&logoColor=white)](https://platform.openai.com/)
[![Langfuse](https://img.shields.io/badge/Langfuse-Observability-000000?style=flat-square&logo=langfuse&logoColor=white)](https://langfuse.com/)
[![Scikit-Learn](https://img.shields.io/badge/scikit_learn-Isolation_Forest-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Meta Prophet](https://img.shields.io/badge/Meta_Prophet-Time_Series-008080?style=flat-square&logo=chart-line&logoColor=white)](https://facebook.github.io/prophet/)
[![Pandas](https://img.shields.io/badge/Pandas-Data_Processing-150458?style=flat-square&logo=pandas&logoColor=white)](https://pandas.pydata.org/)
[![NumPy](https://img.shields.io/badge/NumPy-Numerical_Ops-013243?style=flat-square&logo=numpy&logoColor=white)](https://numpy.org/)
[![pdfplumber](https://img.shields.io/badge/pdfplumber-PDF_Extraction-FF0000?style=flat-square&logo=adobeacrobatreader&logoColor=white)](https://github.com/jsvine/pdfplumber)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-Async_ORM-D71100?style=flat-square&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Pydantic](https://img.shields.io/badge/Pydantic-v2.0-E92063?style=flat-square&logo=pydantic&logoColor=white)](https://docs.pydantic.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-2.12-22B5BF?style=flat-square&logo=chart-line&logoColor=white)](https://recharts.org/)
[![Lucide](https://img.shields.io/badge/Lucide_React-Icons-F56565?style=flat-square&logo=lucide&logoColor=white)](https://lucide.dev/)
[![Docker](https://img.shields.io/badge/Docker-Dev_Env-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)

**Ledgerline** is an end-to-end, autonomous **Agentic AI Personal Financial Platform**. It ingests raw bank statements (CSV/PDF), automatically categorizes transactions using a hybrid ML/LLM pipeline with active learning, detects anomalous spending via personalized Isolation Forest models, forecasts future cash flow with Meta Prophet, and features a multi-tool **LangGraph State Machine ReAct Agent** capable of executing financial scenario simulations, subscription audits, continuous recategorization, and safe Text-to-SQL database analytics.

---

## 🌟 Key Features & Capabilities

- **🤖 LangGraph State Machine Agent**: Intent-driven state routing with dedicated intent classification (`node_intent_router`), tool execution (`node_tool_executor`), and security auditing (`node_security_guardrail`).
- **🔮 "What-If" Financial Scenario Simulator (`tool_simulate_scenario`)**: Simulates major purchases or EMI commitments (*e.g., "Can I afford a ₹30,000 laptop on 6 months EMI?"*), projecting baseline vs. new monthly spend and feasibility ratings (**Comfortable**, **Tight**, **High Risk**).
- **🔄 Recurring Subscriptions Auditor (`tool_detect_subscriptions`)**: Automatically identifies active recurring subscriptions (*Netflix, Spotify, broadband, rent, etc.*) and computes total recurring monthly commitments.
- **🛡️ Isolation Forest Anomaly Inspector (`tool_audit_anomalies`)**: Runs personalized, per-user unsupervised Isolation Forest models to flag uncharacteristic transactions, unusual merchants, or abnormal velocity.
- **🔄 Active Learning Recategorization (`tool_bulk_recategorize`)**: Updates merchant category assignments through natural language and triggers background ML model retraining.
- **🔒 Sandboxed SQL Safety Guardrails (`tool_sql_analytics`)**: Enforces strictly read-only `SELECT` queries with mandatory user-level tenant data isolation (`WHERE user_id = :user_id`).
- **📄 Multi-Format Ingestion**: Parses CSV exports and PDF bank statements via `pdfplumber` with automated merchant name normalization and self-transfer/contra identification.
- **📈 Visual Dashboard & Interactive Analytics**: Built with Next.js 14, Tailwind CSS, and Recharts, featuring metric cards, spending category breakdowns, anomaly alerts, trend forecasting, and docked conversational AI interface.

---

## 🛠️ Complete Technology Stack

| Layer | Technology | Purpose & Usage |
| :--- | :--- | :--- |
| **Backend Core** | **Python 3.10+**, **FastAPI**, **Uvicorn** | High-performance asynchronous API framework & ASGI web service |
| **Agent Orchestration** | **LangGraph**, **LangChain**, **OpenAI** | State Machine workflow orchestration, intent routing & GPT-3.5/4 integration |
| **Observability** | **Langfuse** | Agent decision tracing, query telemetry & latency logging |
| **Machine Learning** | **Scikit-Learn**, **Meta Prophet** | Unsupervised Isolation Forest anomaly detection & time-series cash flow forecasting |
| **Data Processing** | **Pandas**, **NumPy**, **pdfplumber** | Financial data cleaning, merchant string normalization & PDF statement extraction |
| **Database & ORM** | **PostgreSQL 15**, **SQLAlchemy (Async)**, **Asyncpg** | Relational transactional storage with async row-level scoping |
| **Validation & Security** | **Pydantic v2**, **PyJWT**, **Passlib / Bcrypt** | Data schema validation, JWT authentication & password encryption |
| **Frontend UI** | **Next.js 14 (App Router)**, **React 18** | Client rendering, page routing & server components |
| **Styling & Icons** | **Tailwind CSS 3**, **Lucide React** | Responsive design system, theme tokens & vector UI icons |
| **Data Visualization** | **Recharts** | Interactive spending distribution charts & trend graphs |
| **DevOps & Containers**| **Docker**, **Docker Compose**, **pgAdmin** | Local containerized PostgreSQL database & DB management tool |

---

## 🤖 Agentic Tool Ecosystem

| Tool Function | Purpose & Description | Example Query |
| :--- | :--- | :--- |
| `tool_simulate_scenario` | Computes baseline monthly spend, monthly EMI installments, percentage spend increase, and feasibility rating. | *"Can I afford a ₹25,000 phone on 3 months EMI?"* |
| `tool_detect_subscriptions` | Identifies recurring payment patterns (Netflix, Spotify, broadband, rent) and totals monthly commitments. | *"What active subscriptions do I have?"* |
| `tool_audit_anomalies` | Runs unsupervised Isolation Forest anomaly detection to inspect uncharacteristic purchases. | *"Show me my unresolved spending anomalies"* |
| `tool_bulk_recategorize` | Updates matching merchant categories in DB and triggers active-learning model retraining. | *"change swiggy to groceries"* |
| `tool_sql_analytics` | Translates natural language into safe, read-only SQL queries with tenant isolation. | *"How much did I spend on dining this month?"* |

---

## 📂 Repository Structure

```
ledgerline-finance-app/
├── frontend/                     # Next.js 14 App Router Client
│   ├── app/                      # Pages (Upload, Dashboard, Alerts, Chat, Trends, Login, Onboarding)
│   ├── components/               # Custom React UI Components (MetricCard, CategoryChart, ChatPanel)
│   ├── lib/                      # API client (`api.js`) & mock state fallbacks
│   └── tailwind.config.js        # Design system tokens and styling theme
│
├── backend/                      # Python FastAPI Service & AI Engine
│   ├── app/
│   │   ├── api/                  # REST endpoints (auth, transactions, alerts, insights, agent)
│   │   ├── core/                 # JWT Auth, Database async engines, Config settings
│   │   ├── models/               # SQLAlchemy models (User, Transaction, Alert, Forecast)
│   │   ├── schemas/              # Pydantic validation schemas
│   │   └── services/             # Agent orchestrator, LangGraph pipeline, Categorizer, Detector, Forecaster, Parser
│   ├── init_db.py                # Database setup & table initialization script
│   ├── test_agent_tools.py       # In-memory unit tests for Agentic financial tools
│   ├── test_langgraph_agent.py   # State machine test suite for LangGraph agent
│   ├── test_flow.py              # End-to-end integration test flow script
│   └── requirements.txt          # Python dependencies
│
├── docker-compose.yml            # PostgreSQL 15 & pgAdmin dev setup
└── README.md                     # Project documentation
```

---

## 🚀 Getting Started & Local Setup

### 1. Database Setup
Spin up a local PostgreSQL database container:
```bash
docker-compose up -d
```
- **Postgres DB**: `localhost:5432` (`postgres`/`postgres`)
- **pgAdmin**: [http://localhost:5050](http://localhost:5050) (`admin@ledgerline.com`/`admin`)

---

### 2. Backend Setup & Execution
```bash
cd backend

# Create & activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1   # On Windows (PowerShell)
source venv/bin/activate      # On macOS/Linux

# Install backend dependencies
pip install -r requirements.txt

# Initialize database schema and default tables
python init_db.py

# Launch FastAPI development server
uvicorn app.main:app --reload --port 8000
```
Interactive Swagger API documentation will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

---

### 3. Running Unit & Integration Test Suites
Validate the multi-tool Agentic framework and scenario simulators:
```bash
cd backend

# 1. Test isolated agent tool functions
python test_agent_tools.py

# 2. Test LangGraph State Machine execution
python test_langgraph_agent.py

# 3. Test full E2E HTTP integration flow
python test_flow.py
```

---

### 4. Frontend Setup & Execution
```bash
cd frontend

# Install client packages
npm install

# Start Next.js development server
npm run dev
```
The Next.js client interface will be live at [http://localhost:3000](http://localhost:3000).

---

## 🔒 Security & Guardrail Principles

- **Row-Level Data Scoping**: All database operations and AI agent tools automatically enforce `user_id` filtering to ensure strict multi-tenant isolation.
- **Read-Only SQL Sandbox**: The `tool_sql_analytics` tool inspects generated SQL statements to prohibit destructive commands (`DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `TRUNCATE`).
- **Encrypted Authentication**: Passwords hashed using `bcrypt` and authenticated via short-lived JWT tokens.

---

## 📜 License & Academic Attribution
Developed as part of an **AI-Powered Personal Finance System** project, demonstrating classical machine learning, Agentic AI state machine workflows (LangGraph & ReAct), and modern full-stack web application architecture.
