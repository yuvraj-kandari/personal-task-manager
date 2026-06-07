# Task Manager

Simple full-stack todo app. React frontend, Express backend, tasks saved to a JSON file.

## Stack

- **Frontend:** React, Vite, Tailwind, Axios
- **Backend:** Node, Express, UUID, CORS

## Setup

You need Node 18+.

**Backend:**
```bash
cd server
npm install
npm run dev
```
Runs on http://localhost:5000

**Frontend** (separate terminal):
```bash
cd client
npm install
npm run dev
```
Runs on http://localhost:5173

Optional env: `PORT` (default 5000) for the API.

## Project layout

```
task-manager/
├── client/
│   └── src/
│       ├── App.jsx      # UI + state
│       ├── api.js       # axios calls
│       ├── main.jsx
│       └── index.css
├── server/
│   ├── app.js           # API + file storage
│   └── data/tasks.json
└── README.md
```

## API

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/tasks` | List tasks (newest first) |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| PATCH | `/api/tasks/:id/toggle` | Toggle completed |
| DELETE | `/api/tasks/:id` | Delete task |

Task shape:
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "dueDate": "2026-06-15",
  "completed": false,
  "createdAt": "ISO date"
}
```

## Ideas for later

- User accounts
- Real database
- Due date reminders
- Dark mode
