# InfiChat 💬

A modern real-time chat application built with the MERN stack, featuring **E2E encryption** , AI integration, group chats and much more.

**Live Site** → [https://infichat-soumadip.netlify.app](https://infichat-soumadip.netlify.app)
---

---

## ✨ Features

-   **💬 1:1 & Group Messaging** with admin roles
-   **🔍 Message Search** for quick lookups
-   **🖼️ Image Sharing** with Cloudinary storage
-   **🤖 AI Assistant (Gemini)** via Google GenAI
-   **🔔 Typing & Online Indicators** in real-time
-   **📜 Infinite Scroll** with Timestamps & Dates
-   **🎨 35+ Themes** with Tailwind + DaisyUI
-   **🔒 JWT Authentication** + Password Hashing
-   **📝 Profile & Group Editing** – Update user and group details easily
-   **🔐 End-to-End Encryption** – Messages secured with ECDH + AES-GCM 
---

## 🛠️ Tech Stack

### 💻 Frontend

-   **⚛️ React 19** – Core UI framework
-   **⚡ Vite** – Lightning-fast dev build tool
-   **🎨 TailwindCSS + DaisyUI** – Modern UI styling with components
-   **🐻 Zustand** – State management between various states
-   **🌐 Axios** – Simplified HTTP requests
-   **🔄 Socket.IO Client** – Real-time communication with server
-   **🔔 React Hot Toast** – Notifications for actions/events
-   **🛣️ React Router v7** – Navigation and routing
-   **😊 Lucide-React & Lordicon** – Icons and animated graphics
-   **🔐 Web Crypto API** – Native browser E2EE cryptography (ECDH + AES-GCM)

### 🔧 Backend
-   **🟢 Node.js + Express 5** – Server framework
-   **🍃 MongoDB + Mongoose** – Database & ODM for models
-   **🔑 JWT (jsonwebtoken)** – Authentication
-   **🔒 bcryptjs** – Password hashing
-   **🍪 cookie-parser** – Handling cookies for sessions
-   **🌐 CORS** – Cross-origin requests handling
-   **⚡ Socket.IO** – Real-time messaging engine
-   **📦 Body-parser** – Request body parsing
-   **📁 Formidable + Multer** – File & image upload handling
-   **☁️ Cloudinary** – Image hosting/CDN integration
-   **⚙️ dotenv** – Environment variable management
-   **🤖 @google/genai** – Google Generative AI SDK for Gemini bot
-   **🔐 Node.js crypto** – Built-in server-side cryptography for public-private key generation
-   **🔴 Redis + Socket.IO Redis Adapter** – Pub/sub adapter for scaling Socket.IO across multiple instances
-   **🔀 Nginx** – Reverse proxy and load balancer for containerized deployment

### 🚀 Hosting

-   **🌍 Frontend:** Deployed on **Netlify**.
-   **☁️ Backend:** Deployed on **Render**.

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Node.js (v18 or later)
-   npm / yarn / pnpm
-   MongoDB (local instance or a cloud URI from MongoDB Atlas)
-   Docker CLI & Docker Engine – for containerized deployment

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/Soumadip-Mishra/InfiChat.git
    cd InfiChat
    ```

2.  **Install Frontend Dependencies:**
    ```sh
    cd frontend
    npm install
    ```

3.  **Set up Environment Variables:**
    -   Create a `.env` file in the `backend` and `frontend`  directory.
    -   Copy the contents from `.env.example` (see below) and fill in your values.

4.  **Run the application:**
    -   Start the backend server (from the `backend` folder):
        ```sh
        docker compose -f "docker-compose.dev.yml" up
        ```
    -   Start the frontend development server (from the `frontend` folder):
        ```sh
        npm run dev
        ```

The application should now be running on `http://localhost:5173` (or the port Vite assigns).

---

### Environment Variables  

Create a `.env` file in the **backend** folder with the following keys:  

```dotenv
# Server Configuration
PORT=            # Port number for backend (e.g., 3000)
NODE_ENV=        # development | production

# Frontend URL for CORS
CLIENT_URL=      # e.g., http://localhost:5173

# MongoDB Connection
MONGODB_URL=     # Your MongoDB Atlas connection string with embedded password

# JWT Authentication
JWT_SECRET=      # Secret key for signing tokens

# Cloudinary / External API Config
API_NAME=        # Your Cloudinary API name
API_KEY=         # Your Cloudinary API key
API_SECRET=      # Your Cloudinary API secret

# Google Gemini AI
GEMINI_API_KEY=  # Your Google GenAI API key
```

Create a `.env` file in the **frontend** folder with the following key:  

```dotenv
# Backend URL 
VITE_API_URL=   # e.g., http://localhost:3000
```
