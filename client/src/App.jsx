import { useState, useEffect } from 'react';
import * as api from './api';

function isOverdue(task) {
  if (!task.dueDate || task.completed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

function formatDate(str) {
  if (!str) return '';
  return new Date(str).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({ title: '', description: '', dueDate: '' });
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (text, type = 'ok') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 2500);
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.getTasks();
      setTasks(data);
    } catch {
      setError('Failed to load tasks. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const resetForm = () => {
    setForm({ title: '', description: '', dueDate: '' });
    setEditingId(null);
    setFormError('');
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setFormError('Title is required');
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      dueDate: form.dueDate || null,
    };

    setSaving(true);
    try {
      if (editingId) {
        const { data } = await api.updateTask(editingId, payload);
        setTasks((prev) => prev.map((t) => (t.id === editingId ? data : t)));
        showToast('Task updated');
        resetForm();
      } else {
        const { data } = await api.addTask(payload);
        setTasks((prev) => [data, ...prev]);
        setForm({ title: '', description: '', dueDate: '' });
        showToast('Task added');
      }
    } catch (err) {
      setFormError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await api.toggleTask(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
    } catch {
      showToast('Could not update task', 'err');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteTask(deleteTarget.id);
      setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      if (editingId === deleteTarget.id) resetForm();
      showToast('Task deleted');
      setDeleteTarget(null);
    } catch {
      showToast('Could not delete task', 'err');
    } finally {
      setDeleting(false);
    }
  };

  const total = tasks.length;
  const activeCount = tasks.filter((t) => !t.completed).length;
  const doneCount = tasks.filter((t) => t.completed).length;

  let visible = tasks;
  if (filter === 'active') visible = visible.filter((t) => !t.completed);
  if (filter === 'completed') visible = visible.filter((t) => t.completed);
  if (search.trim()) {
    const q = search.toLowerCase();
    visible = visible.filter((t) => t.title.toLowerCase().includes(q));
  }

  const inputClass =
    'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200';

  return (
    <div className="min-h-screen bg-slate-50">
      {toast && (
        <div
          className={`fixed right-4 top-4 z-50 rounded-lg px-4 py-2 text-sm shadow-md ${
            toast.type === 'err' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}
        >
          {toast.text}
        </div>
      )}

      <div className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Task Manager</h1>
          <p className="text-sm text-slate-500">Keep track of what needs doing</p>
        </header>

        {/* stats */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: total },
            { label: 'Active', value: activeCount },
            { label: 'Done', value: doneCount },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="text-xl font-semibold">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* form */}
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold">{editingId ? 'Edit task' : 'New task'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-slate-600">Title *</label>
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => {
                    setForm({ ...form, title: e.target.value });
                    setFormError('');
                  }}
                  placeholder="What do you need to do?"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Description</label>
                <textarea
                  className={inputClass}
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional details"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Due date</label>
                <input
                  type="date"
                  className={inputClass}
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Add task'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* task list */}
          <div className="lg:col-span-2">
            <div className="mb-4 space-y-3">
              <input
                className={inputClass}
                placeholder="Search by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="flex gap-2 rounded-lg bg-slate-200 p-1">
                {['all', 'active', 'completed'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`flex-1 rounded-md py-1.5 text-sm capitalize ${
                      filter === f ? 'bg-white shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {loading && (
              <div className="py-12 text-center text-slate-400">Loading...</div>
            )}

            {error && (
              <div className="rounded-xl bg-red-50 p-6 text-center">
                <p className="mb-3 text-sm text-red-700">{error}</p>
                <button
                  onClick={fetchTasks}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && visible.length === 0 && (
              <div className="rounded-xl bg-white py-16 text-center shadow-sm">
                <p className="text-4xl mb-3">📝</p>
                <p className="text-slate-600">
                  {search || filter !== 'all'
                    ? 'No tasks match your filter.'
                    : 'No tasks yet. Create your first task.'}
                </p>
              </div>
            )}

            {!loading && !error && visible.length > 0 && (
              <div className="space-y-3">
                {visible.map((task) => {
                  const overdue = isOverdue(task);
                  return (
                    <div
                      key={task.id}
                      className={`rounded-xl bg-white p-4 shadow-sm ${
                        overdue ? 'border-l-4 border-red-500 bg-red-50' : ''
                      } ${task.completed ? 'opacity-70' : ''}`}
                    >
                      <div className="flex gap-3">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggle(task.id)}
                          className="mt-1 h-4 w-4 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3
                              className={`font-medium ${
                                task.completed ? 'line-through text-slate-400' : ''
                              }`}
                            >
                              {task.title}
                            </h3>
                            {overdue && (
                              <span className="rounded bg-red-200 px-2 py-0.5 text-xs text-red-800">
                                Overdue
                              </span>
                            )}
                          </div>
                          {task.description && (
                            <p className="mt-1 text-sm text-slate-500">{task.description}</p>
                          )}
                          <p className="mt-2 text-xs text-slate-400">
                            {task.dueDate && (
                              <span className={overdue ? 'text-red-600' : ''}>
                                Due {formatDate(task.dueDate)} ·{' '}
                              </span>
                            )}
                            Added {formatDate(task.createdAt)}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEdit(task)}
                            className="rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(task)}
                            className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* delete modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <h3 className="mb-2 font-semibold">Delete task?</h3>
            <p className="mb-5 text-sm text-slate-500">
              &quot;{deleteTarget.title}&quot; will be gone for good.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-lg border py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
