import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useAppDispatch, useAppSelector } from './hooks'
import {
  addTask,
  deleteTask,
  reorderTasks,
  saveTasks,
  setTaskStatus,
  updateTask,
} from './store/tasksSlice'
import type { Priority, Task, TaskFormData, TaskStatus } from './types/task'

type DisplayView = 'list' | 'card'
type FilterStatus = 'All' | TaskStatus

const emptyForm: TaskFormData = {
  title: '',
  description: '',
  priority: 'Medium',
  dueDate: '',
}

function App() {
  const dispatch = useAppDispatch()
  const tasks = useAppSelector((state) => state.tasks.tasks)
  const [formData, setFormData] = useState<TaskFormData>(emptyForm)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('All')
  const [priorityFilter, setPriorityFilter] = useState<'All' | Priority>('All')
  const [view, setView] = useState<DisplayView>('list')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchTarget = `${task.title} ${task.description}`.toLowerCase()
      const matchesSearch = searchTarget.includes(searchText.trim().toLowerCase())
      const matchesStatus =
        statusFilter === 'All' ? true : task.status === statusFilter
      const matchesPriority =
        priorityFilter === 'All' ? true : task.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [tasks, searchText, statusFilter, priorityFilter])

  const stats = useMemo(() => {
    const pending = tasks.filter((task) => task.status === 'Pending').length
    const completed = tasks.length - pending
    return {
      total: tasks.length,
      pending,
      completed,
    }
  }, [tasks])

  const resetForm = () => {
    setFormData(emptyForm)
    setEditingTaskId(null)
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formData.title.trim() || !formData.description.trim() || !formData.dueDate) {
      return
    }

    if (editingTaskId) {
      dispatch(updateTask({ id: editingTaskId, updates: formData }))
    } else {
      dispatch(addTask(formData))
    }
    resetForm()
  }

  const onChangeField =
    (field: keyof TaskFormData) =>
    (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
      setFormData((prev) => ({ ...prev, [field]: event.target.value }))
    }

  const startEdit = (task: Task) => {
    setEditingTaskId(task.id)
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const confirmDelete = (taskId: string) => {
    const confirmed = window.confirm('Delete this task?')
    if (confirmed) {
      dispatch(deleteTask(taskId))
    }
  }

  const moveTask = (taskId: string, direction: 'up' | 'down') => {
    const fromIndex = tasks.findIndex((task) => task.id === taskId)
    if (fromIndex === -1) {
      return
    }
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
    dispatch(reorderTasks({ fromIndex, toIndex }))
  }

  return (
    <main className="app-shell">
      <header className="header">
        <h1>Task Management Dashboard</h1>
        <button
          type="button"
          className="secondary-btn"
          onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
        >
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <p>Total Tasks</p>
          <strong>{stats.total}</strong>
        </article>
        <article className="stat-card">
          <p>Pending Tasks</p>
          <strong>{stats.pending}</strong>
        </article>
        <article className="stat-card">
          <p>Completed Tasks</p>
          <strong>{stats.completed}</strong>
        </article>
      </section>

      <section className="panel">
        <h2>{editingTaskId ? 'Edit Task' : 'Create Task'}</h2>
        <form className="task-form" onSubmit={onSubmit}>
          <input
            placeholder="Title"
            value={formData.title}
            onChange={onChangeField('title')}
            maxLength={80}
            required
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={onChangeField('description')}
            maxLength={240}
            required
          />
          <div className="form-row">
            <select value={formData.priority} onChange={onChangeField('priority')}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <input
              type="date"
              value={formData.dueDate}
              onChange={onChangeField('dueDate')}
              required
            />
          </div>
          <div className="button-row">
            <button type="submit" className="primary-btn">
              {editingTaskId ? 'Update Task' : 'Add Task'}
            </button>
            {editingTaskId && (
              <button type="button" className="secondary-btn" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="toolbar">
          <input
            placeholder="Search by title or description"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as FilterStatus)}
          >
            <option value="All">All Tasks</option>
            <option value="Pending">Pending Tasks</option>
            <option value="Completed">Completed Tasks</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(event.target.value as 'All' | Priority)
            }
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => setView((prev) => (prev === 'list' ? 'card' : 'list'))}
          >
            {view === 'list' ? 'Card View' : 'List View'}
          </button>
        </div>

        {filteredTasks.length === 0 ? (
          <p className="empty-state">No tasks match your current filters.</p>
        ) : (
          <div className={view === 'list' ? 'tasks-list' : 'tasks-card-grid'}>
            {filteredTasks.map((task) => {
              const fullIndex = tasks.findIndex((item) => item.id === task.id)
              return (
                <article
                  key={task.id}
                  className={`task-item ${task.status === 'Completed' ? 'done' : ''}`}
                >
                  <div className="task-head">
                    <h3>{task.title}</h3>
                    <span className={`priority ${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p>{task.description}</p>
                  <div className="task-meta">
                    <span>Due: {task.dueDate}</span>
                    <span>Status: {task.status}</span>
                  </div>
                  <div className="button-row">
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() =>
                        dispatch(
                          setTaskStatus({
                            id: task.id,
                            status:
                              task.status === 'Pending' ? 'Completed' : 'Pending',
                          }),
                        )
                      }
                    >
                      {task.status === 'Pending' ? 'Mark Complete' : 'Mark Pending'}
                    </button>
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => startEdit(task)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="danger-btn"
                      onClick={() => confirmDelete(task.id)}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      className="secondary-btn"
                      disabled={fullIndex === 0}
                      onClick={() => moveTask(task.id, 'up')}
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      className="secondary-btn"
                      disabled={fullIndex === tasks.length - 1}
                      onClick={() => moveTask(task.id, 'down')}
                    >
                      Down
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

export default App
