# Ledgerline Backend — Python FastAPI API

This is the Python FastAPI backend for Ledgerline, implementing user authentication, transaction parsing, auto-categorization models, anomaly detection, time-series forecasting, and a Text-to-SQL conversational agent.

---

## 🛠️ Setup & Installation

### 1. Create and Activate Virtual Environment

```bash
# In the backend directory
python -m venv venv

# Activate on Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Activate on macOS/Linux
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment Configuration

Copy the sample environment file and configure your credentials:

```bash
cp .env.example .env
```

Edit `.env` and set:
- PostgreSQL database credentials.
- `OPENAI_API_KEY` for LLM fallback and conversational SQL generation.
- Langfuse observability parameters (optional).

### 4. Running the Server

Start the FastAPI application with Uvicorn:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`. You can inspect the Swagger interactive docs at `http://127.0.0.1:8000/docs`.

---

## 📂 Architecture & Directory Structure

- `app/main.py`: Entrypoint for application configuration, CORS rules, and database tables auto-bootstrap.
- `app/core/`: Settings loading, security/JWT routines, and SQLAlchemy database engines.
- `app/models/`: SQLAlchemy schema declarations mapped to Postgres tables.
- `app/schemas/`: Pydantic input validation, request, and response schemas.
- `app/api/`: Routing definitions organized by resources (Auth, Transactions, Alerts, Insights, Agent).
- `app/services/`: Core logic engines for file parsing, classification, Isolation Forest anomalies, Prophet time-series forecasts, and Text-to-SQL safety validations.
