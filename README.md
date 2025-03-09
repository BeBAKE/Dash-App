# Dashboard Website

A modern blogging platform built with a powerful stack to deliver a seamless and dynamic user experience. This project leverages the best of frontend and backend technologies, ensuring efficiency, scalability, and a delightful user interface.

## Features

- **Google Sheets Integration**: Add the data from your google sheets to your Dashboard.

## Tech Stack

### Frontend

- **Framework**: Next.js with TypeScript for a type-safe and scalable architecture.
- **Styling**: Tailwind CSS for sleek and responsive design and Shadcnui.

### Backend

- **Express.js Backend** (TypeScript):
  - Specialized http server for writing.
  - Implements an autofetch feature to get data from google sheets.

### Database

- **MongoDb**: A robust relational database management system.
- **Mongoose ODM**: Secure database with type safety

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/blogging-website.git
   cd Dash-App
   npm install
   ```

2. Install dependencies for both frontend and backend:

   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend (Express)
   cd .backend-express
   npm install
   ```

3. Set up environment variables for each backend service:

   - Express Backend:
     - `API_KEY`
     - `MONGO_URI`
     - `JWT_SECRET`

4. Start the services:

   ```bash
   # Frontend
   npm run dev

   # Backend (Express)
   npm run dev
   ```

## Usage

- Access the frontend at `http://localhost:3000`.
- Log in to create tables.

## Project Structure

### Frontend

- **Google Sheets Integration**: Add the data from your google sheets to your Dashboard.

### Backend

- **Express WebSocket Server**: Specialized http server for writing, Implements an autofetch feature to get data from google sheets.

### Database

- **MongoDb**: Handles all data persistence.
- **Mongoose ODM**: Secure database with type safety.
