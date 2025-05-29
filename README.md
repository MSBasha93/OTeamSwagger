# OTeam Platform

The Platform of OTeam is designed to simplify ticketing management for our clients in the support department.

## Project Structure

-   `backend/`: NestJS application for the API and core logic.
-   `frontend/`: Next.js application for the user interface.
-   `docker-compose.yml`: For local development environment (PostgreSQL database).
-   `render.yaml`: Blueprint for deploying to Render.com.

## Prerequisites

-   Node.js (v18+ recommended)
-   npm or yarn
-   Docker & Docker Compose (for local development)
-   Render CLI (optional, for manual Render deployments)

## Local Development Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd oteam
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    cp .env.example .env
    # Update .env with your local PostgreSQL credentials (defaults match docker-compose)
    # DATABASE_URL="postgresql://oteam_user:oteam_password@localhost:5432/oteam_db?schema=public"
    npm install
    npx prisma generate # Generate Prisma Client
    npx prisma migrate dev --name init # Apply migrations
    cd ..
    ```

3.  **Frontend Setup:**
    ```bash
    cd frontend
    cp .env.local.example .env.local
    # Update .env.local if needed (NEXT_PUBLIC_API_URL should point to your backend)
    npm install
    cd ..
    ```

4.  **Run Docker Compose (for PostgreSQL):**
    In the project root (`oteam/`):
    ```bash
    docker-compose up -d
    ```
    This will start a PostgreSQL database container.

5.  **Run Backend:**
    ```bash
    cd backend
    npm run start:dev
    # Backend will run on http://localhost:3001 (or port specified in .env)
    ```

6.  **Run Frontend:**
    In a new terminal:
    ```bash
    cd frontend
    npm run dev
    # Frontend will run on http://localhost:3000
    ```

## Tech Stack

-   **Frontend**: Next.js (React), Tailwind CSS
-   **Backend**: NestJS (Node.js, TypeScript), Prisma (ORM)
-   **Database**: PostgreSQL
-   **Authentication**: JWT
-   **Deployment**: Render.com

## User Roles (Initial)

-   `CLIENT_ADMIN`: Manages their organization's users and tickets.
-   `CLIENT_SUB_USER`: Member of a client organization, can create/view tickets.
-   `EXPERT`: Technical expert, handles assigned tickets.
-   `TDM`: Technical Delivery Manager, oversees experts.
-   `PLATFORM_ADMIN`: Super admin for the platform.
-   `OPERATION_ADMIN`: Manages platform operations.
-   `SDM`: Service Delivery Manager.

## Sprint Backlog (Initial Focus)

-   User Auth System
-   Basic DB Schema
-   AI Chat Scaffold
-   Ticket Creation Flow
-   Admin Dashboard v0
-   Expert Dashboard v0
-   API Gateway Setup
-   DevOps Init

## Deployment to Render.com

The `render.yaml` file defines the services for Render.
1.  Create a new "Blueprint" on Render.
2.  Connect your Git repository.
3.  Render will automatically detect `render.yaml` and set up the services:
    -   A PostgreSQL database.
    -   A backend web service (NestJS).
    -   A frontend static site or web service (Next.js).
4.  Environment variables need to be set in the Render dashboard for each service, especially `DATABASE_URL` for the backend and `NEXT_PUBLIC_API_URL` for the frontend.
5.  The backend's `DATABASE_URL` on Render will be provided by Render's managed PostgreSQL service.