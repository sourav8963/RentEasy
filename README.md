# RentEasy - Furniture & Appliance Rental Platform

RentEasy is a modern, high-performance monorepo application for renting furniture and appliances. It features premium design aesthetics, role-based controls (Customer, Vendor, Admin), credit/referral systems, and a seamless checkout experience.

---

## Applied Technology Stack

This project is built using a modern, robust, and highly-scalable technology stack:

*   **Frontend**: 
    *   **Core**: HTML5, CSS3, JavaScript (written in **TypeScript** for safety and autocompletion).
    *   **Framework**: **React.js** (built with **Vite** for lightning-fast HMR and build performance).
    *   **Styling**: **Tailwind CSS** (for utility-first, modern responsive UI designs) and custom CSS variables for Japandi/minimalist theme aesthetics.
*   **Backend**:
    *   **Runtime**: **Node.js** with **Express.js** (written in **TypeScript**).
    *   **Architecture**: Clean MVC-inspired pattern with REST APIs, middlewares, validation, and JWT authentication.
*   **Database**:
    *   **Primary**: **MongoDB** (orchestrated via **Mongoose** with automated data seeding).
    *   **Development Fallback**: In-memory/Local JSON database file-based fallback (`backend/data/`) to enable running the backend server immediately without database installation.
    *   *Alternative support*: PostgreSQL can be easily supported by replacing the database configuration layer with **Prisma ORM** or **Sequelize**.
*   **Deployment & Containerization**:
    *   **AWS**: Containerized environment via custom **Dockerfiles** for both frontend and backend, orchestrated by **Docker Compose**.
    *   **Vercel**: Monorepo static configuration using `vercel.json` with reverse proxy routes for CORS-free API calls.
    *   **Netlify**: Custom `netlify.toml` for deploying the frontend React SPA with routing redirects.

---

## Workspace Structure

```text
RentEasy/
├── backend/                  # Express REST API (TypeScript)
│   ├── src/
│   │   ├── config/           # Database connections
│   │   ├── controllers/      # Route controllers
│   │   ├── models/           # Mongoose Schemas (User, Product, Rental, etc.)
│   │   ├── routes/           # REST endpoints
│   │   ├── services/         # Database operations & JSON DB fallback logic
│   │   └── utils/            # Seeding, validation, helper functions
│   └── Dockerfile            # Container build for Node/Express production
├── frontend/                 # React SPA (TypeScript + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/       # Global components (Navbar, Footer)
│   │   ├── context/          # State management (Auth, Cart)
│   │   └── pages/            # Page views (Home, Catalog, Dashboards, ShiftEase)
│   ├── Dockerfile            # Multi-stage production Nginx container build
│   ├── nginx.conf            # Nginx server routing configurations
│   └── netlify.toml          # Netlify build and redirect configurations
├── docker-compose.yml        # Local orchestrator for MongoDB, backend, and frontend
└── vercel.json               # Root monorepo deployment config for Vercel
```

---

## Local Setup & Development

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [MongoDB](https://www.mongodb.com/) (Optional, server will fall back to JSON database if local DB isn't running)
*   [Docker](https://www.docker.com/) (Optional, for containerized run)

### Method 1: Running Concurrently (Standard Dev)

1.  **Clone the workspace and open terminal in the root directory.**
2.  **Install dependencies in root, frontend, and backend:**
    ```bash
    npm run install:all
    ```
3.  **Configure environment variables:**
    *   Copy `backend/.env.example` to `backend/.env` and edit variables.
    *   Copy `frontend/.env.example` to `frontend/.env` and edit variables.
4.  **Start both servers concurrently:**
    ```bash
    npm run dev
    ```
    *   **Frontend**: http://localhost:5173
    *   **Backend**: http://localhost:5005

### Method 2: Running via Docker Compose

To test the containerized production build locally (which simulates how it runs in AWS):

1.  Ensure Docker Desktop is running.
2.  Run the following command from the root directory:
    ```bash
    docker-compose up --build
    ```
3.  **Access points:**
    *   **Frontend**: http://localhost:3000
    *   **Backend (API)**: http://localhost:5005
    *   **MongoDB**: localhost:27017

---

## Deployment Instructions

### 1. AWS Deployment (Dockerized Container Service)
Using the provided `Dockerfile`s, you can deploy RentEasy on AWS ECS (Fargate) or AWS App Runner:

*   **Database**: Provision a managed **Amazon DocumentDB** (MongoDB compatible) cluster or **MongoDB Atlas** database, and note the connection URI.
*   **Express Backend**:
    1.  Build the backend Docker image using `/backend/Dockerfile`.
    2.  Push to **Amazon ECR** (Elastic Container Registry).
    3.  Deploy to **AWS App Runner** or **AWS ECS (Fargate)**.
    4.  Expose port `5005`. Add environment variables `MONGO_URI` (pointing to your database), `JWT_SECRET`, and `PORT`.
*   **React Frontend**:
    1.  Build the frontend Docker image using `/frontend/Dockerfile`. Pass `VITE_API_URL` as a build argument (e.g. `https://api.rentease-domain.com/api`).
    2.  Push to Amazon ECR.
    3.  Deploy to **AWS ECS** or serve as static files via **Amazon S3** and **Amazon CloudFront** CDN.

### 2. Vercel Deployment
You can deploy the RentEasy repository directly to Vercel as a Monorepo:

1.  Connect your GitHub repository to Vercel.
2.  Configure a new project and select the **Root Directory** as the root folder.
3.  Vercel will detect `vercel.json`. It will trigger the static build for the `frontend` using the configuration defined in `vercel.json`.
4.  Add the environment variables in Vercel Dashboard under Settings:
    *   `VITE_API_URL` = `https://your-deployed-backend-api.com/api` (this configures the API endpoint).
5.  *CORS Bypass*: `vercel.json` contains route rewrites which automatically proxy `/api/*` requests to your hosted backend (e.g. on AWS/Render), preventing cross-origin request issues.

### 3. Netlify Deployment
You can deploy the React frontend directly to Netlify:

1.  Connect your GitHub repository to Netlify.
2.  Deploy the project and set the **Base Directory** to `frontend`.
3.  Netlify will automatically detect `frontend/netlify.toml` and configure the **Build Command** (`npm run build`) and **Publish Directory** (`dist`).
4.  Add `VITE_API_URL` under Environment Variables in the Netlify site settings.
5.  *CORS Bypass & SPA Routing*: The `netlify.toml` is pre-configured with rules to redirect API requests to the production API server and handle React Router's URL rewrite structure.

---

## Database Customization (PostgreSQL Integration)

If you prefer to migrate from MongoDB to **PostgreSQL**:

1.  Initialize Prisma in the backend directory:
    ```bash
    cd backend
    npm install @prisma/client
    npm install -D prisma
    npx prisma init
    ```
2.  Create your PostgreSQL schemas inside `backend/prisma/schema.prisma` mapping the properties of models (`User`, `Product`, `Rental`, `Maintenance`).
3.  Update data access layers in `backend/src/services/` (e.g., `userService.ts`, `productService.ts`) to use Prisma clients (e.g. `prisma.user.create`) instead of Mongoose models.