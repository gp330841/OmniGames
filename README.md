# OmniGames: Web-Based Board Games

A full-stack gaming platform that provides classic board games including Ludo and TicTacToe, allowing users to register, login, and play. The project separates concerns into a React frontend and an Express/SQLite backend.

## 🚀 Walkthrough: Running the Project

> Detailed instructions on how to start the frontend and backend using Docker or local Node environments can be found in our **[Walkthrough Guide](./docs/walkthrough.md)**.

---

## 🏗 Project Architecture

This application acts as a standard full-stack environment.
- **Frontend:** Built with React & Vite. Renders `Ludo`, `TicTacToe`, and `Auth` components.
- **Backend:** Node.js Express server (`/server`) exposing secure APIs.
- **Database:** Uses local SQLite inside `/server/omnidata.db` to reliably persist registered user credentials and session info.

## 🛠 Tech Stack
- **Client:** React 18, Vite, standard CSS Modules
- **Server:** Node.js, Express.js
- **Database:** SQLite3
- **DevOps:** Docker, Docker Compose
