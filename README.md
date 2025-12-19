
# 🚀 AI CareerBoost | Intelligent Resume Analyzer
## 📖 Introduction

**AI CareerBoost** is a next-generation career intelligence platform designed to bridge the gap between job seekers and Applicant Tracking Systems (ATS).

In today's competitive job market, nearly **75% of resumes are rejected by automated systems** before they ever reach a human recruiter. AI CareerBoost solves this problem by simulating a real-world ATS. It uses advanced **Generative AI (Llama 3)** to semantically analyze your resume against specific job descriptions.

Instead of simple keyword matching, our AI "reads" your resume to understand context, impact, and tone. It then provides an instant **0-100 score**, detailed feedback on your content's strength, and actionable tips to optimize your application for the specific role you want.

## ✨ Key Features

* **🔐 Secure Authentication:** Complete Login/Signup system with JWT & Bcrypt.
* **📄 Smart PDF Parsing:** Extracts text from complex resume layouts.
* **🖼️ Visual Thumbnails:** Auto-generates image previews of uploaded resumes.
* **🤖 AI Grading Engine:** Scores resumes (0-100) based on impact, keywords, and tone.
* **🛡️ Data Guardrails:** Automatically rejects non-resume files (e.g., invoices).
* **🎨 Modern UI:** Responsive Glassmorphism design built with Tailwind CSS.

---

## 🛠️ Tech Stack

* **Frontend:** React.js, Vite, Tailwind CSS, Lucide Icons
* **Backend:** Node.js, Express.js
* **Database:** MongoDB, Mongoose
* **AI Engine:** Groq SDK (Llama 3-70b)
* **File Handling:** Multer, PDF-Parse, PDF.js

---

## 🚀 Getting Started

Follow these steps to get a local copy up and running.

### 1. Prerequisites
Ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v18 or higher)
* [MongoDB](https://www.mongodb.com/try/download/community) (Local) or [Atlas](https://www.mongodb.com/atlas) (Cloud)
* [Git](https://git-scm.com/)

### 2. Installation

**Clone the repository:**
```bash
git clone [https://github.com/YOUR_USERNAME/resume-analyzer.git](https://github.com/YOUR_USERNAME/resume-analyzer.git)
cd resume-analyzer

```

#### **A. Setup Backend (Server)**

```bash
cd server
npm install

```

#### **B. Setup Frontend (Client)**

Open a new terminal, go back to the root folder:

```bash
cd ..
npm install

```

### 3. Environment Configuration (Crucial!)

You must create a `.env` file for the backend to work.

1. Navigate to the `server/` folder.
2. Create a file named `.env`.
3. Paste the following keys:

```env
# Server Port
PORT=5000

# Database Connection (Use your local link or Atlas link)
MONGODB_URI=mongodb://127.0.0.1:27017/resume-analyzer

# Login Security Key (Random text)
JWT_SECRET=my_secure_secret_key_123

# AI API Key (Get free from [https://console.groq.com/keys](https://console.groq.com/keys))
GROQ_API_KEY=gsk_your_api_key_here

```

---

## ▶️ How to Run

You need to run the **Backend** and **Frontend** simultaneously.

**Terminal 1 (Backend):**

```bash
cd server
node index.js

```

> *Output should say: "✅ Connected to MongoDB"*

**Terminal 2 (Frontend):**

```bash
# Make sure you are in the root folder
npm run dev

```

> *Output should say: "Local: http://localhost:5173/"*

**👉 Open your browser and visit:** `http://localhost:5173`

---

## 📂 Project Structure

```text
resume-analyzer/
├── app/                  # Frontend Logic (React)
│   ├── components/       # UI Components (Navbar, Cards)
│   ├── routes/           # Page Logic (Home, Upload, Login)
│   └── lib/              # Utilities (PDF Converter)
├── server/               # Backend Logic (Node)
│   ├── models/           # Database Schemas
│   ├── routes/           # API Endpoints (Auth, AI)
│   ├── uploads/          # Resume Storage
│   └── index.js          # Server Entry Point
└── README.md             # Documentation

```

---

## 🐛 Troubleshooting

* **"MongoNetworkError"**: Ensure your MongoDB service is running (`mongod`) or check your internet connection if using Atlas.
* **"AI Analysis Failed"**: Check your terminal logs. Usually means the `GROQ_API_KEY` is missing or invalid.
* **"Upload Failed"**: Ensure the `server/uploads` folder exists. If not, create it manually.

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

```

```
