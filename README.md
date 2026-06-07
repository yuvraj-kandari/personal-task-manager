# Task Manager

A full-stack Task Manager application built with React, Vite, Node.js, and Express. Users can create, update, complete, and delete tasks through a clean and responsive interface.

## Live Demo

**Frontend:**
https://personal-task-manager-lake.vercel.app

**Backend API:**
https://personal-task-manager-ou9v.onrender.com/api/tasks

## Features

* Create new tasks
* Edit existing tasks
* Mark tasks as completed
* Delete tasks
* Filter tasks by status
* Persistent storage using JSON file
* Responsive user interface

## Tech Stack

### Frontend

* React
* Vite
* Axios
* Tailwind CSS

### Backend

* Node.js
* Express.js
* UUID
* CORS

## Installation

### Clone Repository

```bash
git clone https://github.com/yuvraj-kandari/personal-task-manager.git
cd personal-task-manager
```

### Backend Setup

```bash
cd server
npm install
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

### Frontend Setup

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## Project Structure

```text
personal-task-manager/
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── app.js
│   ├── package.json
│   └── data/
│       └── tasks.json
│
└── README.md
```

## API Endpoints

| Method | Endpoint              | Description              |
| ------ | --------------------- | ------------------------ |
| GET    | /api/tasks            | Get all tasks            |
| POST   | /api/tasks            | Create a new task        |
| PUT    | /api/tasks/:id        | Update a task            |
| PATCH  | /api/tasks/:id/toggle | Toggle completion status |
| DELETE | /api/tasks/:id        | Delete a task            |

## Task Object

```json
{
  "id": "uuid",
  "title": "Task title",
  "description": "Task description",
  "dueDate": "2026-06-15",
  "completed": false,
  "createdAt": "ISO date"
}
```

## Future Improvements

* User Authentication
* Database Integration (MongoDB/PostgreSQL)
* Task Categories
* Due Date Notifications
* Dark Mode
* User Profiles

## Author

Yuvraj Kandari
