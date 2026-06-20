<div align="center">
  <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop" width="100%" style="border-radius:15px; margin-bottom: 20px" alt="Futuristic Cityscape"/>

  <h1>🚀 Civic Vision: Nexus</h1>
  <p><strong>Next-Generation AI-Powered Civic Issue Detection & Analytics Engine</strong></p>

  <p>
    <a href="https://fastapi.tiangolo.com"><img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white" alt="FastAPI" /></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /></a>
    <a href="https://ultralytics.com/"><img src="https://img.shields.io/badge/YOLOv8-FF0000?style=for-the-badge&logo=ultralytics&logoColor=white" alt="YOLOv8" /></a>
    <a href="https://www.sqlite.org/index.html"><img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" /></a>
  </p>
  
  <p><em>Empowering communities with automated infrastructure diagnostics.</em></p>
</div>

<hr/>

## 🌌 The Vision
**Civic Vision: Nexus** redefines urban maintenance. By combining the speed of modern web architectures with state-of-the-art Computer Vision and Generative AI, we transform raw citizen complaints into highly actionable, geo-tagged, and intelligently triaged data. Welcome to the future of smart cities.

## ✨ Core Capabilities

- **👁️ AI Computer Vision Engine:** Utilizes custom-trained **YOLOv8** segmentation and classification models to instantly detect and map potholes, waste accumulation, and structural damage from user-uploaded images.
- **🧠 Generative Context & Severity (LLM):** Integrates **Google Generative AI** pipelines to automatically generate rich captions and accurately assess the severity of incoming complaints.
- **🗺️ Interactive Geo-Spatial Mapping:** A stunning **React-Leaflet** integration that places every issue on a high-performance interactive map for urban planners.
- **🔐 Secure Identity Nexus:** Fully authenticated workflows using local JWT protocols alongside **Google OAuth**, complete with Bcrypt payload encryption.
- **⚡ Hyper-Fast Asynchronous Core:** Built on **FastAPI** and **AioSQLite**, ensuring non-blocking, lightning-fast response times for AI inferences and data handling.

## 🛠️ The Technology Stack

### **Neural Backend**
- **Core:** Python, FastAPI, Uvicorn
- **AI/ML:** Ultralytics (YOLOv8 ONNX), Transformers, Google Generative AI, ImageHash
- **Database:** SQLite3, SQLAlchemy (Async), Alembic (Migrations)
- **Security:** Passlib (Bcrypt), Python-Jose

### **Client Interface**
- **Core:** React 19, Vite
- **Mapping & Charts:** React-Leaflet, Recharts
- **Icons & UI:** Lucide React, Axios

---

## 🚀 Initialization Protocol (Getting Started)

Follow these steps to deploy the neural net and start the backend server locally:

### 1. Clone & Enter the Matrix
```bash
git clone <repository-url>
cd civic_issues_backend
```

### 2. Backend Boot Sequence
Set up the Python environment and install the neural dependencies.
```bash
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

### 3. Environment Variables
Create a `.env` file in the root directory (use `.env.example` as a template):
```env
# Example configuration
JWT_SECRET_KEY=your_super_secret_key
GOOGLE_API_KEY=your_gemini_api_key
# ...other required variables
```

### 4. Database Migration
Initialize the SQLite matrix:
```bash
python migrate_db.py
```

### 5. Ignite the Server
```bash
python main.py
# The API will be live at http://127.0.0.1:8000
```

### 6. Frontend Ignition
In a new terminal window, power up the React interface:
```bash
cd frontend
npm install
npm run dev
# The UI will be live at http://localhost:5173
```

---

## 🔮 Future Horizon
- [ ] **Drone Integration API:** Real-time stream processing for autonomous drone patrols.
- [ ] **Predictive Decay Models:** Forecasting infrastructure failure before it happens.
- [ ] **Distributed Consensus DB:** Migrating to PostgreSQL for large-scale municipal deployment.

<br/>

<div align="center">
  <p>Built with ❤️ for a Smarter, Cleaner Tomorrow.</p>
</div>
