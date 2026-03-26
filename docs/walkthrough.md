# 🚀 Walkthrough: Running the Project

You can run OmniGames either locally via your terminal using Node and npm, or utilizing Docker Compose for a completely isolated deployment environment.

## Option 1: Docker Compose (Recommended)

Running via Docker Compose ensures that both the frontend and backend spin up simultaneously without needing to manually install dependencies.

1. Ensure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is running.
2. Open a terminal at the root of the OmniGames directory.
3. Bring up the containers:
   ```bash
   docker-compose up --build
   ```
4. Once running:
   - Your frontend will be served at: [http://localhost:5173](http://localhost:5173) (mapped via Nginx)
   - Your backend will run on: `http://localhost:3001`
5. To stop the servers, run:
   ```bash
   docker-compose down
   ```

## Option 2: Local Node & Vite Environment

If you prefer to run the setup conventionally in two separate terminal windows for iterative development:

### Starting the Backend (Server)
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd server
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Start the Express server:
   ```bash
   node index.js
   ```
   *The server will initialize its SQLite database and start listening on port 3001.*

### Starting the Frontend (React Client)
1. Open a **second terminal** and stay at the root folder:
   ```bash
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Your client should now open locally (typically at `http://localhost:5173`).
