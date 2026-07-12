

# GrowEasy AI CRM Importer

An intelligent, AI-powered CSV importer designed to extract, map, and standardize CRM lead information from any valid CSV format. This system uses Large Language Models (LLMs) to handle inconsistent column names and messy data structures, converting them into the standardized GrowEasy CRM format.

## 🚀 Features

- **Intelligent AI Mapping**: Uses Groq (Llama 3) to automatically detect and map headers like "Cell", "E-mail", or "Customer Name" to standardized CRM fields.
- **Batch Processing**: Built-in logic to handle 1,000+ records by chunking data to prevent API timeouts.
- **SaaS Dashboard**: Real-time analytics showing Lead Quality, Source Reach, and Recent Activity—driven entirely by live database data.
- **Lead Management**: Full CRUD-style management with search, status filtering, and lead viewing.
- **Export Engine**: Export the entire database or specific import batches into valid GrowEasy **CSV** or **JSON** formats.
- **Production Ready**: Fully dockerized environment for one-command setup.

## 🛠️ Tech Stack

- **Frontend**: Next.js (TypeScript), Tailwind CSS, Lucide Icons, PapaParse.
- **Backend**: Node.js, Express.js.
- **ORM/Database**: Prisma with SQLite (Production-ready for local testing).
- **AI Engine**: Groq Cloud SDK (Llama-3.3-70b-versatile).
- **DevOps**: Docker, Docker Compose.

## 📁 Folder Structure

```text
├── frontend/           # Next.js Client application
│   ├── app/            # Main page logic & routing
│   ├── components/     # Reusable UI (Sidebar, DataTable, etc.)
│   └── public/         # Static assets
├── backend/            # Express Server
│   ├── prisma/         # Database Schema & Migrations
│   ├── services/       # AI Logic (Groq Integration)
│   └── server.js       # API Routes & Express Config
└── docker-compose.yml  # Multi-container orchestration
```

## ⚙️ Environment Variables

Create a `.env` file in the **backend** folder:

```env
GROQ_API_KEY=your_groq_api_key_here
PORT=5001
```

## 💻 Local Installation

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Setup Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
node server.js
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:3000` to view the app.

## 🐳 Run with Docker (Easiest)

Ensure you have your `GROQ_API_KEY` in a `.env` file in the root directory.

```bash
docker-compose up --build
```
The application will be live at `http://localhost:3000`.

## 🛰️ API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/import` | Process raw CSV JSON through AI and save to DB. |
| **GET** | `/api/dashboard-stats` | Get real-time KPIs and upload history. |
| **GET** | `/api/leads` | Retrieve all mapped CRM records from DB. |
| **GET** | `/api/export-all` | Fetch all records specifically for CSV/JSON export. |

## 📸 Screenshots

### 1. Modern Dashboard
![Dashboard Placeholder](https://via.placeholder.com/800x400?text=Dashboard+UI)

### 2. AI Lead Generation
![Generate Leads Placeholder](https://via.placeholder.com/800x400?text=Lead+Import+UI)

### 3. CRM Data Management
![Manage Leads Placeholder](https://via.placeholder.com/800x400?text=Lead+Management+UI)

---

## 📝 Assignment Requirements Checklist

- [x] AI-powered extraction from any CSV layout.
- [x] Correct mapping to GrowEasy CRM format (15 fields).
- [x] Handling 1000+ records via batching.
- [x] Export functionality (CSV & JSON).
- [x] Responsive Frontend (Desktop, Tablet, Mobile).
- [x] Database persistence (SQLite + Prisma).
- [x] Docker setup for easy evaluation.

**Submission by**: [Madhav Jagtap]  
**Position Applied**: Software Developer (Intern / Full-Time)
