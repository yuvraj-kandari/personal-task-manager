import express from 'express';
import cors from 'cors';
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 5000;

const dataFile = join(dirname(fileURLToPath(import.meta.url)), 'data', 'tasks.json');

app.use(cors());
app.use(express.json());

async function loadTasks() {
  try {
    const raw = await readFile(dataFile, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await writeFile(dataFile, '[]');
      return [];
    }
    throw err;
  }
}

async function saveTasks(tasks) {
  await writeFile(dataFile, JSON.stringify(tasks, null, 2));
}

function sortNewestFirst(tasks) {
  return tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// GET all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = sortNewestFirst(await loadTasks());
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load tasks' });
  }
});

// create task
app.post('/api/tasks', async (req, res) => {
  const { title, description = '', dueDate = null } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const tasks = await loadTasks();
    const task = {
      id: uuidv4(),
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || null,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    tasks.push(task);
    await saveTasks(tasks);
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create task' });
  }
});

// update task
app.put('/api/tasks/:id', async (req, res) => {
  const { title, description, dueDate } = req.body;

  if (title !== undefined && !title.trim()) {
    return res.status(400).json({ error: 'Title cannot be empty' });
  }

  try {
    const tasks = await loadTasks();
    const idx = tasks.findIndex((t) => t.id === req.params.id);

    if (idx === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (title !== undefined) tasks[idx].title = title.trim();
    if (description !== undefined) tasks[idx].description = description.trim();
    if (dueDate !== undefined) tasks[idx].dueDate = dueDate || null;

    await saveTasks(tasks);
    res.json(tasks[idx]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update task' });
  }
});

// toggle done/undone
app.patch('/api/tasks/:id/toggle', async (req, res) => {
  try {
    const tasks = await loadTasks();
    const idx = tasks.findIndex((t) => t.id === req.params.id);

    if (idx === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    tasks[idx].completed = !tasks[idx].completed;
    await saveTasks(tasks);
    res.json(tasks[idx]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update task' });
  }
});

// delete
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const tasks = await loadTasks();
    const idx = tasks.findIndex((t) => t.id === req.params.id);

    if (idx === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    tasks.splice(idx, 1);
    await saveTasks(tasks);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete task' });
  }
});

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
